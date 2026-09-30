import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    whipscribe_api_key: str
    whipscribe_base_url: str
    runtime_dir: Path


def get_settings() -> Settings:
    return Settings(
        whipscribe_api_key=os.getenv("WHIPSCRIBE_API_KEY", ""),
        whipscribe_base_url=os.getenv("WHIPSCRIBE_BASE_URL", "https://whipscribe.com/api/v1").rstrip("/"),
        runtime_dir=Path(os.getenv("RUNTIME_DIR", ".runtime")),
    )
