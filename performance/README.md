# Performance Benchmark Kit

This folder benchmarks CodeSight on the 4 report metrics we selected:

1. Ingestion and system performance
2. Chat latency performance
3. Retrieval quality
4. Groundedness reliability

## Files

- `repositories.txt`: paste one `small`, one `medium`, and one `large` GitHub repo URL.
- `questions.json`: evaluation prompts and expected reference tokens.
- `run_benchmarks.py`: runs ingest + chat benchmarks and generates tables/charts.
- `outputs/`: run artifacts (CSV, markdown report, plots, checkpoint).

## 1) Fill repository list

Edit `repositories.txt` in this format:

```text
small,https://github.com/owner/repo-small,small-repo
medium,https://github.com/owner/repo-medium,medium-repo
large,https://github.com/owner/repo-large,large-repo
```

## 2) Install benchmark dependencies

From project root:

```bash
python -m pip install -r performance/requirements.txt
```

## 3) Start backend

Use your normal backend run command (for example):

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 4) Run benchmarks

From project root:

```bash
python performance/run_benchmarks.py --api-base http://localhost:8000 --chat-runs 2
```

Default run order is `small -> medium -> large`.
The script writes checkpointed outputs after every repository, so completed repos are preserved.

Optional knobs:

- `--chat-runs`: repeat each question multiple times (improves p50/p95 confidence).
- `--ingest-timeout`: max seconds for each repo ingest.
- `--chat-timeout`: max seconds for each chat call.
- `--sleep-between-chats`: add delay after each chat call (helps avoid 429 on Gemini free tier).
- `--resume-run-dir`: resume a previous output folder.
- `--continue-after-quota`: continue next repos even after quota/rate-limit errors (default is early stop).

## Resume after quota reset

If quota is hit, continue with:

```bash
python performance/run_benchmarks.py --resume-run-dir performance/outputs/<run_timestamp>
```

The script loads `checkpoint.json`, skips already completed repos, and continues from the next repo.

## Outputs

Each run creates a timestamped folder in `outputs/`, containing:

- `repo_summary.csv`: one row per repository with all matrix values.
- `chat_raw.csv`: question-level raw measurements.
- `report.md`: report-ready performance matrices.
- `checkpoint.json`: incremental state for resume support.
- `plots/01_ingestion_time.png`: ingestion chart.
- `plots/02_chat_latency.png`: latency chart.
- `plots/03_quality_groundedness.png`: quality and groundedness chart.
- `plots/04_repository_scale.png`: repository scale chart.

## How retrieval and groundedness are scored

- Retrieval hit rate: a question is a hit when returned reference paths contain any expected token from `questions.json`.
- Grounded rate: fraction of successful answers with at least one reference returned by `/api/chat`.
