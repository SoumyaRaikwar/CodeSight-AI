from app.mcp.adapter import CodeWikiMCPAdapter


class FailingClient:
    def call_tool(self, tool_name: str, payload: dict) -> dict:
        raise RuntimeError("down")


def test_mcp_disabled_fallback() -> None:
    adapter = CodeWikiMCPAdapter(enabled=False, endpoint="http://x", timeout_seconds=1)
    result = adapter.query("https://github.com/x/y", "what")
    assert not result.available


def test_mcp_failure_fallback() -> None:
    adapter = CodeWikiMCPAdapter(enabled=True, endpoint="http://x", timeout_seconds=1, max_retries=0)
    adapter.client = FailingClient()
    result = adapter.query("https://github.com/x/y", "what")
    assert not result.available
    assert result.error
