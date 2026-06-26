from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    azure_api_key: str | None
    azure_endpoint: str
    azure_api_version: str
    azure_deployment: str
    planning_model: str
    allowed_origins: list[str]
    docs_root: Path
    retrieval_top_k: int
    chunk_size: int
    chunk_overlap: int
    source_char_limit: int
    site_base_url: str


def _parse_allowed_origins(raw_value: str | None) -> list[str]:
    if not raw_value:
        return ["http://127.0.0.1:8000", "http://localhost:8000", "http://127.0.0.1:8001", "http://localhost:8001"]
    return [origin.strip() for origin in raw_value.split(",") if origin.strip()]


def _env(*names: str, default: str | None = None) -> str | None:
    for name in names:
        value = os.getenv(name)
        if value is not None:
            return value
    return default


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    project_root = Path(__file__).resolve().parents[2]
    docs_root = Path(_env("GINGER_CHAT_DOCS_ROOT", default=str(project_root / "docs"))).resolve()

    return Settings(
        azure_api_key=_env("GINGER_CHAT_AZURE_API_KEY", "CIR_AZURE_API"),
        azure_endpoint=_env(
            "GINGER_CHAT_AZURE_ENDPOINT",
            default="https://cir-openai.services.ai.azure.com/openai/v1",
        ),
        azure_api_version=_env("GINGER_CHAT_AZURE_API_VERSION", default="2024-12-01-preview"),
        azure_deployment=_env("GINGER_CHAT_AZURE_DEPLOYMENT", default="gpt-4.1-mini"),
        # Future candidate: Codestral-2501 for lower latency on the planning step.
        planning_model=_env("GINGER_CHAT_PLANNING_MODEL", default="gpt-4.1-nano"),
        allowed_origins=_parse_allowed_origins(_env("GINGER_CHAT_ALLOWED_ORIGINS")),
        docs_root=docs_root,
        retrieval_top_k=max(1, int(_env("GINGER_CHAT_RETRIEVAL_TOP_K", default="6"))),
        chunk_size=max(400, int(_env("GINGER_CHAT_CHUNK_SIZE", default="1400"))),
        chunk_overlap=max(0, int(_env("GINGER_CHAT_CHUNK_OVERLAP", default="120"))),
        source_char_limit=max(100, int(_env("GINGER_CHAT_SOURCE_CHAR_LIMIT", default="500"))),
        site_base_url=_env("GINGER_CHAT_SITE_BASE_URL", default="").rstrip("/"),
    )
