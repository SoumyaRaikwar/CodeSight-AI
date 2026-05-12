from __future__ import annotations

from abc import ABC, abstractmethod

import requests


class MCPClient(ABC):
    @abstractmethod
    def call_tool(self, tool_name: str, payload: dict) -> dict:
        ...


class HTTPMCPClient(MCPClient):
    def __init__(self, endpoint: str, timeout_seconds: float):
        self.endpoint = endpoint
        self.timeout_seconds = timeout_seconds

    def call_tool(self, tool_name: str, payload: dict) -> dict:
        response = requests.post(
            self.endpoint,
            json={"tool": tool_name, "input": payload},
            timeout=self.timeout_seconds,
        )
        response.raise_for_status()
        return response.json()
