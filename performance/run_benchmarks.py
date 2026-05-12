from __future__ import annotations

import argparse
import csv
import json
import math
import re
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests

plt = None


SIZE_ORDER = {"small": 0, "medium": 1, "large": 2}
CHUNK_PATTERN = re.compile(r"Indexed\s+\d+\s+files\s+and\s+(\d+)\s+chunks", flags=re.IGNORECASE)


@dataclass
class RepoTarget:
    size_category: str
    repo_url: str
    label: str


@dataclass
class EvalQuestion:
    question_id: str
    prompt: str
    expected_reference_tokens: list[str]


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Run CodeSight performance benchmarks.")
    parser.add_argument("--api-base", default="http://localhost:8000", help="CodeSight backend URL")
    parser.add_argument("--repos-file", default=str(script_dir / "repositories.txt"))
    parser.add_argument("--questions-file", default=str(script_dir / "questions.json"))
    parser.add_argument("--output-dir", default=str(script_dir / "outputs"))
    parser.add_argument("--chat-runs", type=int, default=2, help="Times each question is repeated")
    parser.add_argument("--ingest-timeout", type=float, default=1800.0, help="Seconds per ingest request")
    parser.add_argument("--chat-timeout", type=float, default=240.0, help="Seconds per chat request")
    parser.add_argument(
        "--sleep-between-chats",
        type=float,
        default=0.0,
        help="Optional delay (seconds) inserted after each /api/chat request to reduce quota/rate-limit pressure",
    )
    parser.add_argument(
        "--resume-run-dir",
        default="",
        help="Resume from an existing run folder under performance/outputs",
    )
    parser.add_argument(
        "--continue-after-quota",
        action="store_true",
        help="Continue benchmarking other repos even after quota/rate-limit errors",
    )
    return parser.parse_args()


def load_repositories(path: Path) -> list[RepoTarget]:
    if not path.exists():
        raise FileNotFoundError(f"Repositories file not found: {path}")

    repos: list[RepoTarget] = []
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        parts = [part.strip() for part in line.split(",")]
        if len(parts) < 2:
            raise ValueError(f"Invalid repositories line: {line}")

        size_category = parts[0].lower()
        repo_url = parts[1]
        label = parts[2] if len(parts) >= 3 and parts[2] else derive_label(repo_url)

        if size_category not in SIZE_ORDER:
            raise ValueError(f"Invalid size category '{size_category}' in line: {line}")
        if repo_url.startswith("PASTE_"):
            raise ValueError(f"Replace placeholder URL before running benchmarks: {line}")
        if not repo_url.startswith("http"):
            raise ValueError(f"Repository URL must start with http/https: {line}")

        repos.append(RepoTarget(size_category=size_category, repo_url=repo_url, label=label))

    if len(repos) < 3:
        raise ValueError("Expected at least three repositories (small, medium, large).")

    present_sizes = {repo.size_category for repo in repos}
    missing = [size for size in SIZE_ORDER if size not in present_sizes]
    if missing:
        raise ValueError(f"Missing repository categories: {', '.join(missing)}")

    repos.sort(key=lambda item: (SIZE_ORDER[item.size_category], item.label))
    return repos


def load_questions(path: Path) -> list[EvalQuestion]:
    if not path.exists():
        raise FileNotFoundError(f"Questions file not found: {path}")

    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, list) or not raw:
        raise ValueError("Questions JSON must be a non-empty list.")

    questions: list[EvalQuestion] = []
    for item in raw:
        if not isinstance(item, dict):
            raise ValueError("Each questions entry must be an object.")
        question_id = str(item.get("id", "")).strip()
        prompt = str(item.get("prompt", "")).strip()
        tokens_raw = item.get("expected_reference_tokens", [])
        tokens = [str(token).lower() for token in tokens_raw] if isinstance(tokens_raw, list) else []
        if not question_id or not prompt:
            raise ValueError("Each question needs both 'id' and 'prompt'.")
        questions.append(
            EvalQuestion(
                question_id=question_id,
                prompt=prompt,
                expected_reference_tokens=tokens,
            )
        )
    return questions


def derive_label(repo_url: str) -> str:
    parsed = urlparse(repo_url)
    path = parsed.path.strip("/")
    return path.replace("/", "-").replace(".git", "") or "repo"


def request_json(
    session: requests.Session,
    method: str,
    url: str,
    timeout_seconds: float,
    payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    try:
        if method.lower() == "post":
            response = session.post(url, json=payload, timeout=timeout_seconds)
        elif method.lower() == "get":
            response = session.get(url, timeout=timeout_seconds)
        else:
            raise ValueError(f"Unsupported method: {method}")
    except requests.RequestException as exc:
        raise RuntimeError(f"{method.upper()} {url} failed: {exc}") from exc

    if not response.ok:
        text = response.text.strip().replace("\n", " ")
        raise RuntimeError(f"{method.upper()} {url} failed ({response.status_code}): {text[:300]}")

    try:
        data = response.json()
    except ValueError as exc:
        raise RuntimeError(f"{method.upper()} {url} returned non-JSON response.") from exc

    if not isinstance(data, dict):
        raise RuntimeError(f"{method.upper()} {url} returned unexpected JSON shape.")

    return data


def extract_chunk_count(summary: str) -> int | None:
    match = CHUNK_PATTERN.search(summary or "")
    if not match:
        return None
    return int(match.group(1))


def directory_size_mb(path_str: str) -> float:
    target = Path(path_str)
    if not target.exists():
        # Backend returns a relative path like `data/repos/<id>`; resolve under `backend/` when needed.
        if not target.is_absolute():
            candidate = Path("backend") / target
            if candidate.exists():
                target = candidate
            else:
                return 0.0
        else:
            return 0.0

    total_bytes = 0
    for file_path in target.rglob("*"):
        if file_path.is_file():
            try:
                total_bytes += file_path.stat().st_size
            except OSError:
                continue
    return total_bytes / (1024 * 1024)


def percentile(values: list[float], p: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    if len(ordered) == 1:
        return ordered[0]
    rank = (len(ordered) - 1) * (p / 100.0)
    low = math.floor(rank)
    high = math.ceil(rank)
    if low == high:
        return ordered[low]
    fraction = rank - low
    return ordered[low] + (ordered[high] - ordered[low]) * fraction


def safe_avg(values: list[float]) -> float | None:
    if not values:
        return None
    return sum(values) / len(values)


def safe_rate(numerator: int, denominator: int) -> float | None:
    if denominator <= 0:
        return None
    return numerator / denominator


def benchmark_repo(
    session: requests.Session,
    api_base: str,
    repo: RepoTarget,
    questions: list[EvalQuestion],
    chat_runs: int,
    ingest_timeout: float,
    chat_timeout: float,
    sleep_between_chats: float,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    summary: dict[str, Any] = {
        "size_category": repo.size_category,
        "label": repo.label,
        "repo_url": repo.repo_url,
        "repo_id": "",
        "ingest_seconds": None,
        "indexed_files": None,
        "chunk_count": None,
        "repo_disk_mb": None,
        "chat_avg_seconds": None,
        "chat_p50_seconds": None,
        "chat_p95_seconds": None,
        "chat_success_rate": None,
        "avg_references": None,
        "grounded_rate": None,
        "retrieval_hit_rate": None,
        "total_chat_requests": 0,
        "failed_chat_requests": 0,
        "error": "",
    }
    rows: list[dict[str, Any]] = []

    ingest_start = time.perf_counter()
    try:
        ingest_data = request_json(
            session,
            method="post",
            url=f"{api_base}/api/repos/ingest",
            timeout_seconds=ingest_timeout,
            payload={"repo_url": repo.repo_url},
        )
        summary["ingest_seconds"] = time.perf_counter() - ingest_start
        summary["repo_id"] = ingest_data.get("repo_id", "")
    except RuntimeError as exc:
        summary["error"] = str(exc)
        return summary, rows

    repo_id = summary["repo_id"]
    if not repo_id:
        summary["error"] = "Ingest response missing repo_id."
        return summary, rows

    try:
        repo_meta = request_json(
            session,
            method="get",
            url=f"{api_base}/api/repos/{repo_id}",
            timeout_seconds=60.0,
        )
        summary_text = str(repo_meta.get("summary", ""))
        summary["indexed_files"] = repo_meta.get("indexed_files")
        summary["chunk_count"] = extract_chunk_count(summary_text)
        summary["repo_disk_mb"] = directory_size_mb(str(repo_meta.get("local_path", "")))
    except RuntimeError as exc:
        summary["error"] = str(exc)
        return summary, rows

    successful_latencies: list[float] = []
    refs_per_answer: list[int] = []
    answers_with_refs = 0
    retrieval_hits = 0
    retrieval_total = 0
    total_chat = 0
    failed_chat = 0

    for run_idx in range(chat_runs):
        for question in questions:
            total_chat += 1
            row: dict[str, Any] = {
                "size_category": repo.size_category,
                "repo_label": repo.label,
                "repo_url": repo.repo_url,
                "repo_id": repo_id,
                "run_index": run_idx + 1,
                "question_id": question.question_id,
                "question_prompt": question.prompt,
                "chat_seconds": None,
                "references_count": 0,
                "has_references": 0,
                "retrieval_match": "",
                "error": "",
            }

            started = time.perf_counter()
            try:
                chat_data = request_json(
                    session,
                    method="post",
                    url=f"{api_base}/api/chat",
                    timeout_seconds=chat_timeout,
                    payload={"repo_id": repo_id, "query": question.prompt},
                )
            except RuntimeError as exc:
                failed_chat += 1
                row["error"] = str(exc)
                rows.append(row)
                if sleep_between_chats > 0:
                    time.sleep(sleep_between_chats)
                continue

            elapsed = time.perf_counter() - started
            references = chat_data.get("references", [])
            if not isinstance(references, list):
                references = []

            ref_count = len(references)
            ref_paths = [str(item.get("file_path", "")).lower() for item in references if isinstance(item, dict)]

            row["chat_seconds"] = elapsed
            row["references_count"] = ref_count
            row["has_references"] = int(ref_count > 0)

            successful_latencies.append(elapsed)
            refs_per_answer.append(ref_count)
            if ref_count > 0:
                answers_with_refs += 1

            expected_tokens = question.expected_reference_tokens
            if expected_tokens:
                retrieval_total += 1
                matched = any(token in path for token in expected_tokens for path in ref_paths)
                if matched:
                    retrieval_hits += 1
                row["retrieval_match"] = int(matched)

            rows.append(row)
            if sleep_between_chats > 0:
                time.sleep(sleep_between_chats)

    summary["total_chat_requests"] = total_chat
    summary["failed_chat_requests"] = failed_chat
    summary["chat_avg_seconds"] = safe_avg(successful_latencies)
    summary["chat_p50_seconds"] = percentile(successful_latencies, 50)
    summary["chat_p95_seconds"] = percentile(successful_latencies, 95)
    summary["chat_success_rate"] = safe_rate(total_chat - failed_chat, total_chat)
    summary["avg_references"] = safe_avg([float(value) for value in refs_per_answer]) if refs_per_answer else None
    summary["grounded_rate"] = safe_rate(answers_with_refs, len(successful_latencies))
    summary["retrieval_hit_rate"] = safe_rate(retrieval_hits, retrieval_total)

    return summary, rows


def is_quota_like_error(message: str) -> bool:
    text = (message or "").lower()
    quota_terms = [
        "quota",
        "rate limit",
        "resource_exhausted",
        "429",
        "too many requests",
        "exceeded your current quota",
    ]
    return any(term in text for term in quota_terms)


def repo_has_quota_failure(summary: dict[str, Any], rows: list[dict[str, Any]]) -> bool:
    if is_quota_like_error(str(summary.get("error", ""))):
        return True
    for row in rows:
        if is_quota_like_error(str(row.get("error", ""))):
            return True
    return False


def write_csv(path: Path, rows: list[dict[str, Any]], columns: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({key: row.get(key, "") for key in columns})


SUMMARY_COLUMNS = [
    "size_category",
    "label",
    "repo_url",
    "repo_id",
    "ingest_seconds",
    "indexed_files",
    "chunk_count",
    "repo_disk_mb",
    "chat_avg_seconds",
    "chat_p50_seconds",
    "chat_p95_seconds",
    "chat_success_rate",
    "avg_references",
    "grounded_rate",
    "retrieval_hit_rate",
    "total_chat_requests",
    "failed_chat_requests",
    "error",
]

RAW_CHAT_COLUMNS = [
    "size_category",
    "repo_label",
    "repo_url",
    "repo_id",
    "run_index",
    "question_id",
    "question_prompt",
    "chat_seconds",
    "references_count",
    "has_references",
    "retrieval_match",
    "error",
]


def fmt_float(value: float | None, digits: int = 2) -> str:
    if value is None:
        return "-"
    return f"{value:.{digits}f}"


def fmt_int(value: int | None) -> str:
    if value is None:
        return "-"
    return str(value)


def fmt_pct(value: float | None) -> str:
    if value is None:
        return "-"
    return f"{value * 100:.1f}%"


def write_markdown_report(path: Path, summaries: list[dict[str, Any]], questions_count: int) -> None:
    lines: list[str] = []
    lines.append("# CodeSight Performance Report")
    lines.append("")
    lines.append(f"- Generated at: `{datetime.now().isoformat(timespec='seconds')}`")
    lines.append(f"- Evaluated repositories: `{len(summaries)}`")
    lines.append(f"- Questions per run: `{questions_count}`")
    lines.append("")
    lines.append("## Matrix 1: Ingestion and System")
    lines.append("| Repo | Size | Indexed Files | Chunks | Repo Disk (MB) | Ingest Time (s) |")
    lines.append("|---|---|---:|---:|---:|---:|")
    for item in summaries:
        lines.append(
            f"| {item['label']} | {item['size_category']} | {fmt_int(item.get('indexed_files'))} | "
            f"{fmt_int(item.get('chunk_count'))} | {fmt_float(item.get('repo_disk_mb'))} | "
            f"{fmt_float(item.get('ingest_seconds'))} |"
        )
    lines.append("")
    lines.append("## Matrix 2: Chat Latency")
    lines.append("| Repo | Avg (s) | P50 (s) | P95 (s) | Chat Success |")
    lines.append("|---|---:|---:|---:|---:|")
    for item in summaries:
        lines.append(
            f"| {item['label']} | {fmt_float(item.get('chat_avg_seconds'))} | "
            f"{fmt_float(item.get('chat_p50_seconds'))} | {fmt_float(item.get('chat_p95_seconds'))} | "
            f"{fmt_pct(item.get('chat_success_rate'))} |"
        )
    lines.append("")
    lines.append("## Matrix 3: Retrieval Quality")
    lines.append("| Repo | Retrieval Hit Rate | Avg References / Answer |")
    lines.append("|---|---:|---:|")
    for item in summaries:
        lines.append(
            f"| {item['label']} | {fmt_pct(item.get('retrieval_hit_rate'))} | "
            f"{fmt_float(item.get('avg_references'))} |"
        )
    lines.append("")
    lines.append("## Matrix 4: Groundedness")
    lines.append("| Repo | Grounded Rate (Has References) | Failed Chats | Total Chats |")
    lines.append("|---|---:|---:|---:|")
    for item in summaries:
        lines.append(
            f"| {item['label']} | {fmt_pct(item.get('grounded_rate'))} | "
            f"{fmt_int(item.get('failed_chat_requests'))} | {fmt_int(item.get('total_chat_requests'))} |"
        )
    lines.append("")
    lines.append("## Notes")
    lines.append("- Retrieval hit rate is computed from token matches between expected tokens and returned reference file paths.")
    lines.append("- Grounded rate is the fraction of successful chat responses containing at least one reference.")
    lines.append("- If a value is `-`, that metric was unavailable due to request failures.")
    path.write_text("\n".join(lines), encoding="utf-8")


def generate_plots(summaries: list[dict[str, Any]], plots_dir: Path) -> list[Path]:
    created: list[Path] = []
    global plt
    if plt is None:
        try:
            import matplotlib

            matplotlib.use("Agg")
            import matplotlib.pyplot as imported_plt

            plt = imported_plt
        except Exception:
            return created

    plots_dir.mkdir(parents=True, exist_ok=True)
    labels = [f"{item['size_category']}-{item['label']}" for item in summaries]
    x = list(range(len(labels)))

    ingest = [item.get("ingest_seconds") or 0.0 for item in summaries]
    plt.figure(figsize=(10, 5))
    plt.bar(x, ingest)
    plt.xticks(x, labels, rotation=20, ha="right")
    plt.ylabel("Seconds")
    plt.title("Ingestion Time by Repository")
    plt.tight_layout()
    plot_path = plots_dir / "01_ingestion_time.png"
    plt.savefig(plot_path, dpi=160)
    plt.close()
    created.append(plot_path)

    p50 = [item.get("chat_p50_seconds") or 0.0 for item in summaries]
    p95 = [item.get("chat_p95_seconds") or 0.0 for item in summaries]
    width = 0.35
    plt.figure(figsize=(10, 5))
    left = [index - width / 2 for index in x]
    right = [index + width / 2 for index in x]
    plt.bar(left, p50, width=width, label="P50")
    plt.bar(right, p95, width=width, label="P95")
    plt.xticks(x, labels, rotation=20, ha="right")
    plt.ylabel("Seconds")
    plt.title("Chat Latency by Repository")
    plt.legend()
    plt.tight_layout()
    plot_path = plots_dir / "02_chat_latency.png"
    plt.savefig(plot_path, dpi=160)
    plt.close()
    created.append(plot_path)

    retrieval = [(item.get("retrieval_hit_rate") or 0.0) * 100 for item in summaries]
    grounded = [(item.get("grounded_rate") or 0.0) * 100 for item in summaries]
    plt.figure(figsize=(10, 5))
    left = [index - width / 2 for index in x]
    right = [index + width / 2 for index in x]
    plt.bar(left, retrieval, width=width, label="Retrieval Hit Rate (%)")
    plt.bar(right, grounded, width=width, label="Grounded Rate (%)")
    plt.xticks(x, labels, rotation=20, ha="right")
    plt.ylabel("Percent")
    plt.title("Quality and Groundedness")
    plt.ylim(0, 100)
    plt.legend()
    plt.tight_layout()
    plot_path = plots_dir / "03_quality_groundedness.png"
    plt.savefig(plot_path, dpi=160)
    plt.close()
    created.append(plot_path)

    indexed_files = [item.get("indexed_files") or 0 for item in summaries]
    disk_mb = [item.get("repo_disk_mb") or 0.0 for item in summaries]

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8), sharex=True)
    ax1.bar(x, indexed_files)
    ax1.set_ylabel("Indexed Files")
    ax1.set_title("Repository Scale")
    ax2.bar(x, disk_mb)
    ax2.set_ylabel("Disk Size (MB)")
    ax2.set_xticks(x)
    ax2.set_xticklabels(labels, rotation=20, ha="right")
    plt.tight_layout()
    plot_path = plots_dir / "04_repository_scale.png"
    plt.savefig(plot_path, dpi=160)
    plt.close(fig)
    created.append(plot_path)

    return created


def save_checkpoint(
    checkpoint_path: Path,
    summary_rows: list[dict[str, Any]],
    raw_chat_rows: list[dict[str, Any]],
) -> None:
    payload = {
        "updated_at": datetime.now().isoformat(timespec="seconds"),
        "summary_rows": summary_rows,
        "raw_chat_rows": raw_chat_rows,
    }
    checkpoint_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def load_checkpoint(checkpoint_path: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    if not checkpoint_path.exists():
        return [], []
    payload = json.loads(checkpoint_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        return [], []
    summary_rows = payload.get("summary_rows", [])
    raw_chat_rows = payload.get("raw_chat_rows", [])
    if not isinstance(summary_rows, list):
        summary_rows = []
    if not isinstance(raw_chat_rows, list):
        raw_chat_rows = []
    return summary_rows, raw_chat_rows


def export_current_outputs(
    run_dir: Path,
    summary_rows: list[dict[str, Any]],
    raw_chat_rows: list[dict[str, Any]],
    questions_count: int,
) -> list[Path]:
    # Backfill disk size for older checkpoint entries created before path resolution was added.
    for item in summary_rows:
        if str(item.get("error", "")).strip():
            continue
        repo_id = str(item.get("repo_id", "")).strip()
        if not repo_id:
            continue
        disk_raw = item.get("repo_disk_mb")
        try:
            disk_val = float(disk_raw) if disk_raw not in (None, "") else 0.0
        except (TypeError, ValueError):
            disk_val = 0.0
        if disk_val <= 0.0:
            item["repo_disk_mb"] = directory_size_mb(str(Path("backend") / "data" / "repos" / repo_id))

    summary_rows.sort(key=lambda item: (SIZE_ORDER.get(item["size_category"], 99), item["label"]))
    summary_csv = run_dir / "repo_summary.csv"
    raw_csv = run_dir / "chat_raw.csv"
    markdown_report = run_dir / "report.md"
    plots_dir = run_dir / "plots"

    write_csv(summary_csv, summary_rows, SUMMARY_COLUMNS)
    write_csv(raw_csv, raw_chat_rows, RAW_CHAT_COLUMNS)
    write_markdown_report(markdown_report, summary_rows, questions_count=questions_count)
    return generate_plots(summary_rows, plots_dir=plots_dir)


def main() -> None:
    args = parse_args()
    api_base = args.api_base.rstrip("/")
    repos_file = Path(args.repos_file).resolve()
    questions_file = Path(args.questions_file).resolve()
    output_root = Path(args.output_dir).resolve()

    repos = load_repositories(repos_file)
    questions = load_questions(questions_file)

    if args.resume_run_dir:
        run_dir = Path(args.resume_run_dir).resolve()
    else:
        run_dir = output_root / datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir.mkdir(parents=True, exist_ok=True)
    checkpoint_path = run_dir / "checkpoint.json"

    print(f"Loaded {len(repos)} repositories from {repos_file}")
    print(f"Loaded {len(questions)} benchmark questions from {questions_file}")
    print(f"Using backend API: {api_base}")
    print(f"Run directory: {run_dir}")
    print("")

    summary_rows, raw_chat_rows = load_checkpoint(checkpoint_path)
    if summary_rows:
        print(f"Loaded checkpoint with {len(summary_rows)} completed repo summaries.")
    # Only treat repos with no error as completed; errored entries should be rerun on resume.
    completed_repo_urls = {
        str(item.get("repo_url", ""))
        for item in summary_rows
        if str(item.get("repo_url", "")) and not str(item.get("error", "")).strip()
    }

    def drop_repo_results(repo_url: str) -> None:
        nonlocal summary_rows, raw_chat_rows
        summary_rows = [item for item in summary_rows if str(item.get("repo_url", "")) != repo_url]
        raw_chat_rows = [row for row in raw_chat_rows if str(row.get("repo_url", "")) != repo_url]

    with requests.Session() as session:
        for repo in repos:
            if repo.repo_url in completed_repo_urls:
                print(f"Skipping [{repo.size_category}] {repo.label} (already completed in checkpoint).")
                continue

            print(f"Benchmarking [{repo.size_category}] {repo.label} ...")
            # If a previous run stored an errored summary for this repo, remove it before rerun.
            drop_repo_results(repo.repo_url)
            try:
                summary, raw_rows = benchmark_repo(
                    session=session,
                    api_base=api_base,
                    repo=repo,
                    questions=questions,
                    chat_runs=args.chat_runs,
                    ingest_timeout=args.ingest_timeout,
                    chat_timeout=args.chat_timeout,
                    sleep_between_chats=args.sleep_between_chats,
                )
            except Exception as exc:  # noqa: BLE001
                summary = {
                    "size_category": repo.size_category,
                    "label": repo.label,
                    "repo_url": repo.repo_url,
                    "repo_id": "",
                    "ingest_seconds": None,
                    "indexed_files": None,
                    "chunk_count": None,
                    "repo_disk_mb": None,
                    "chat_avg_seconds": None,
                    "chat_p50_seconds": None,
                    "chat_p95_seconds": None,
                    "chat_success_rate": None,
                    "avg_references": None,
                    "grounded_rate": None,
                    "retrieval_hit_rate": None,
                    "total_chat_requests": 0,
                    "failed_chat_requests": 0,
                    "error": f"Unexpected failure: {exc}",
                }
                raw_rows = []

            summary_rows.append(summary)
            raw_chat_rows.extend(raw_rows)
            if not str(summary.get("error", "")).strip():
                completed_repo_urls.add(repo.repo_url)

            save_checkpoint(checkpoint_path, summary_rows, raw_chat_rows)
            created_plots = export_current_outputs(
                run_dir=run_dir,
                summary_rows=summary_rows,
                raw_chat_rows=raw_chat_rows,
                questions_count=len(questions),
            )

            if summary.get("error"):
                print(f"  Error: {summary['error']}")
            else:
                print(
                    f"  Ingest: {fmt_float(summary.get('ingest_seconds'))}s | "
                    f"P50 chat: {fmt_float(summary.get('chat_p50_seconds'))}s | "
                    f"Grounded: {fmt_pct(summary.get('grounded_rate'))}"
                )
            print("  Checkpoint saved.")

            if repo_has_quota_failure(summary, raw_rows) and not args.continue_after_quota:
                print("  Quota/rate-limit detected. Stopping early to preserve completed results.")
                break

    created_plots = export_current_outputs(
        run_dir=run_dir,
        summary_rows=summary_rows,
        raw_chat_rows=raw_chat_rows,
        questions_count=len(questions),
    )
    save_checkpoint(checkpoint_path, summary_rows, raw_chat_rows)

    summary_csv = run_dir / "repo_summary.csv"
    raw_csv = run_dir / "chat_raw.csv"
    markdown_report = run_dir / "report.md"

    print("")
    print("Benchmark complete.")
    print(f"- Summary CSV: {summary_csv}")
    print(f"- Raw chat CSV: {raw_csv}")
    print(f"- Report: {markdown_report}")
    if created_plots:
        print(f"- Plots: {run_dir / 'plots'}")
    else:
        print("- Plots: skipped (matplotlib is not installed)")


if __name__ == "__main__":
    main()
