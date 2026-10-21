import json
from typing import Any


def report_to_markdown(job_id: str, report: dict[str, Any]) -> str:
    if report.get("workflow_type") == "generic_review":
        return _generic_report_to_markdown(job_id, report)

    lines = [
        "# Support QA Report",
        "",
        f"Job: `{job_id}`",
        f"Score: **{report['score']}/{report['max_score']}**",
        "",
        "## Scorecard",
    ]
    for item in report["items"].values():
        lines.extend(
            [
                "",
                f"### {item['label']} - {item['status']}",
                f"Points: {item['earned']}/{item['weight']}",
            ]
        )
        for evidence in item.get("evidence", []):
            lines.append(f"- {evidence['start']}s-{evidence['end']}s `{evidence['speaker']}`: {evidence['text']}")

    lines.extend(["", "## Coaching Notes"])
    for note in report.get("coaching_notes", []):
        lines.append(f"- {note}")
    return "\n".join(lines) + "\n"


def _generic_report_to_markdown(job_id: str, report: dict[str, Any]) -> str:
    lines = [
        "# Transcript Intelligence Review",
        "",
        f"Job: `{job_id}`",
        "",
        "## Summary",
        report.get("summary", "No summary available."),
        "",
        "## Speaker Summary",
    ]
    for speaker in report.get("speaker_summary", []):
        lines.append(f"- {speaker['speaker']}: {speaker['segments']} segment(s)")

    lines.extend(["", "## Key Moments"])
    for moment in report.get("key_moments", []):
        lines.append(f"- {moment.get('start')}s-{moment.get('end')}s `{moment.get('speaker')}`: {moment.get('text')}")

    lines.extend(["", "## Questions"])
    questions = report.get("questions", [])
    if questions:
        for question in questions:
            lines.append(
                f"- {question.get('start')}s-{question.get('end')}s `{question.get('speaker')}`: {question.get('text')}"
            )
    else:
        lines.append("- No direct questions detected.")

    lines.extend(["", "## Action Items"])
    actions = report.get("action_items", [])
    if actions:
        for action in actions:
            lines.append(f"- `{action.get('owner')}`: {action.get('text')}")
    else:
        lines.append("- No explicit action items detected.")

    return "\n".join(lines) + "\n"


def report_to_json(report: dict[str, Any]) -> str:
    return json.dumps(report, indent=2)
