from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "CodeSight AI"
    environment: str = "dev"
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:3000"

    data_dir: Path = Path("./data")
    repos_dir: Path = Path("./data/repos")
    metadata_db_path: Path = Path("./data/repo_metadata.json")
    notes_dir: Path = Path("./data/notes")
    chroma_path: Path = Path("./data/chroma")

    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    top_k: int = 8

    llm_provider: str = "openai-compatible"
    llm_api_base: str = "https://api.openai.com/v1"
    llm_api_key: str = Field(default="", repr=False)
    llm_model: str = "gpt-4o-mini"
    llm_temperature: float = 0.2
    llm_max_tokens: int = 1200

    mcp_enabled: bool = True
    mcp_codewiki_endpoint: str = "http://localhost:8100/mcp"
    mcp_timeout_seconds: float = 6.0
    mcp_max_retries: int = 1

    max_file_size_bytes: int = 512_000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.repos_dir.mkdir(parents=True, exist_ok=True)
    settings.notes_dir.mkdir(parents=True, exist_ok=True)
    settings.chroma_path.mkdir(parents=True, exist_ok=True)
    settings.metadata_db_path.parent.mkdir(parents=True, exist_ok=True)
    return settings
