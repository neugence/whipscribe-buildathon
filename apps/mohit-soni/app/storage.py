import json
import hashlib
import re
from pathlib import Path
from typing import Any


class JobStore:
    def __init__(self, root: Path | str):
        self.root = Path(root)

    def _path(self, job_id: str, name: str) -> Path:
        safe_job_id = re.sub(r"[^A-Za-z0-9._-]+", "_", job_id).strip("._")
        if not safe_job_id:
            safe_job_id = hashlib.sha256(job_id.encode("utf-8")).hexdigest()[:16]
        return self.root / safe_job_id / f"{name}.json"

    def save(self, job_id: str, name: str, data: dict[str, Any]) -> None:
        path = self._path(job_id, name)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")

    def load(self, job_id: str, name: str) -> dict[str, Any]:
        path = self._path(job_id, name)
        return json.loads(path.read_text(encoding="utf-8"))

    def exists(self, job_id: str, name: str) -> bool:
        return self._path(job_id, name).exists()
