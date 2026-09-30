from app.storage import JobStore


def test_job_store_round_trips_json(tmp_path):
    store = JobStore(tmp_path)
    store.save("job-123", "status", {"job_id": "job-123", "status": "queued"})

    loaded = store.load("job-123", "status")

    assert loaded == {"job_id": "job-123", "status": "queued"}


def test_job_store_sanitizes_job_id_path(tmp_path):
    store = JobStore(tmp_path)
    store.save("..", "status", {"status": "done"})

    assert store.load("..", "status") == {"status": "done"}
    assert not (tmp_path.parent / "status.json").exists()
