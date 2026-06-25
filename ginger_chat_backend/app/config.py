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
    site_base_url: str


def _parse_allowed_origins(raw_value: str | None) -> list[str]:
    if not raw_value:
        return ["http://127.0.0.1:8000", "http://localhost:8000", "http://127.0.0.1:8001", "http://localhost:8001"]
    return [origin.strip() for origin in raw_value.split(",") if origin.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    project_root = Path(__file__).resolve().parents[2]
    docs_root = Path(os.getenv("ZIGGA_CHAT_DOCS_ROOT", project_root / "docs")).resolve()

    return Settings(
        azure_api_key=os.getenv("ZIGGA_CHAT_AZURE_API_KEY") or os.getenv("AZURE_API"),
        azure_endpoint=os.getenv(
            "ZIGGA_CHAT_AZURE_ENDPOINT",
            "https://cns-caii-prod.cognitiveservices.azure.com/",
        ),
        azure_api_version=os.getenv("ZIGGA_CHAT_AZURE_API_VERSION", "2024-12-01-preview"),
        azure_deployment=os.getenv("ZIGGA_CHAT_AZURE_DEPLOYMENT", "gpt-4.1-mini"),
        # Future candidate: Codestral-2501 for lower latency on the planning step.
        planning_model=os.getenv("ZIGGA_CHAT_PLANNING_MODEL", "gpt-4.1-mini"),
        allowed_origins=_parse_allowed_origins(os.getenv("ZIGGA_CHAT_ALLOWED_ORIGINS")),
        docs_root=docs_root,
        retrieval_top_k=max(1, int(os.getenv("ZIGGA_CHAT_RETRIEVAL_TOP_K", "6"))),
        chunk_size=max(400, int(os.getenv("ZIGGA_CHAT_CHUNK_SIZE", "1400"))),
        chunk_overlap=max(0, int(os.getenv("ZIGGA_CHAT_CHUNK_OVERLAP", "120"))),
        site_base_url=os.getenv("ZIGGA_CHAT_SITE_BASE_URL", "").rstrip("/"),
    )
