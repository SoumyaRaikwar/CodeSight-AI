from pathlib import Path

from app.ingestion.file_filter import should_include_file


def test_file_filter_excludes_node_modules(tmp_path: Path) -> None:
    p = tmp_path / "node_modules" / "x.js"
    p.parent.mkdir(parents=True)
    p.write_text("const a = 1")
    assert not should_include_file(p, max_file_size_bytes=10_000)


def test_file_filter_includes_python(tmp_path: Path) -> None:
    p = tmp_path / "app.py"
    p.write_text("print('ok')")
    assert should_include_file(p, max_file_size_bytes=10_000)
