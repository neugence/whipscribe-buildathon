from app.exporters import report_to_markdown


def test_report_to_markdown_includes_score_and_evidence():
    report = {
        "score": 45,
        "max_score": 100,
        "items": {
            "greeting": {
                "label": "Greeting",
                "status": "Pass",
                "earned": 10,
                "weight": 10,
                "evidence": [{"start": 0.0, "end": 4.0, "speaker": "SPEAKER_00", "text": "Hi there"}],
            }
        },
        "risks": [],
        "customer_pain_points": [],
        "coaching_notes": ["Review timeline clarity with the agent."],
    }

    markdown = report_to_markdown("job-123", report)

    assert "# Support QA Report" in markdown
    assert "45/100" in markdown
    assert "0.0s" in markdown
    assert "Hi there" in markdown


def test_generic_report_to_markdown_includes_insights_without_score():
    report = {
        "workflow_type": "generic_review",
        "title": "Transcript Intelligence Review",
        "summary": "3 segments across 2 speakers.",
        "speaker_summary": [{"speaker": "Speaker 1", "segments": 2}, {"speaker": "Speaker 2", "segments": 1}],
        "key_moments": [{"start": 0.0, "end": 3.0, "speaker": "Speaker 1", "text": "We need to launch tomorrow."}],
        "questions": [{"start": 3.1, "end": 6.0, "speaker": "Speaker 2", "text": "Can you send screenshots?"}],
        "action_items": [{"owner": "Speaker 1", "text": "I will follow up with design.", "start": 6.1}],
        "risks": [],
    }

    markdown = report_to_markdown("job-456", report)

    assert "# Transcript Intelligence Review" in markdown
    assert "Score:" not in markdown
    assert "## Action Items" in markdown
    assert "Speaker 1" in markdown
