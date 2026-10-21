from typing import Any


RUBRIC = {
    "greeting": {"label": "Greeting", "weight": 10, "terms": ["hi", "hello", "thanks for calling", "good morning"]},
    "empathy": {
        "label": "Empathy",
        "weight": 10,
        "terms": ["sorry", "frustrating", "understand how", "i can imagine"],
    },
    "issue_confirmation": {
        "label": "Issue confirmation",
        "weight": 20,
        "terms": ["i understand", "you are saying", "billing", "issue", "problem", "failing"],
    },
    "resolution_explanation": {
        "label": "Resolution explanation",
        "weight": 20,
        "terms": ["resolve", "fix", "reset", "update", "explain"],
    },
    "timeline_clarity": {
        "label": "Timeline clarity",
        "weight": 15,
        "terms": ["today", "tomorrow", "within", "by email", "in 24 hours"],
    },
    "follow_up_owner": {
        "label": "Follow-up owner",
        "weight": 15,
        "terms": ["i will", "we will", "follow up", "send you"],
    },
    "closing_confirmation": {
        "label": "Closing confirmation",
        "weight": 10,
        "terms": ["anything else", "does that help", "have a great day"],
    },
}

QUESTION_STARTERS = ("who", "what", "when", "where", "why", "how", "can ", "could ", "should ", "would ", "do ", "does ", "did ")
ACTION_TERMS = ("i will", "we will", "need to", "follow up", "send", "schedule", "share", "publish", "prepare")


def score_support_call(transcript: dict[str, Any], speaker_map: dict[str, str]) -> dict[str, Any]:
    segments = transcript.get("segments", [])
    agent_speaker = speaker_map.get("agent")
    agent_segments = [segment for segment in segments if not agent_speaker or segment.get("speaker") == agent_speaker]
    items = {}
    score = 0

    for key, rule in RUBRIC.items():
        evidence = _find_evidence(agent_segments, rule["terms"])
        if evidence:
            status = "Pass"
            earned = rule["weight"]
            confidence = 0.85
        else:
            status = "Needs review"
            earned = 0
            confidence = 0.35
        score += earned
        items[key] = {
            "label": rule["label"],
            "status": status,
            "earned": earned,
            "weight": rule["weight"],
            "confidence": confidence,
            "evidence": evidence[:2],
        }

    risks = _find_risks(agent_segments)
    final_score = max(0, min(100, score - len(risks) * 5))
    return {
        "workflow_type": "support_qa",
        "score": final_score,
        "max_score": 100,
        "items": items,
        "risks": risks,
        "customer_pain_points": _customer_pain_points(segments, speaker_map.get("customer")),
        "coaching_notes": _coaching_notes(items, risks),
    }


def build_transcript_review(transcript: dict[str, Any]) -> dict[str, Any]:
    segments = transcript.get("segments", [])
    usable_segments = [segment for segment in segments if segment.get("text")]
    speaker_counts: dict[str, int] = {}
    for segment in usable_segments:
        speaker = segment.get("speaker") or "Unknown"
        speaker_counts[speaker] = speaker_counts.get(speaker, 0) + 1

    return {
        "workflow_type": "generic_review",
        "title": "Transcript Intelligence Review",
        "summary": f"{len(usable_segments)} transcript segments across {len(speaker_counts) or 1} speaker(s).",
        "speaker_summary": [
            {"speaker": speaker, "segments": count} for speaker, count in sorted(speaker_counts.items())
        ],
        "key_moments": usable_segments[:6],
        "questions": _find_questions(usable_segments),
        "action_items": _find_action_items(usable_segments),
        "risks": _find_risks(usable_segments),
    }


def _find_evidence(segments: list[dict[str, Any]], terms: list[str]) -> list[dict[str, Any]]:
    evidence = []
    for segment in segments:
        text = segment.get("text", "")
        lowered = text.lower()
        if any(term in lowered for term in terms):
            evidence.append(
                {
                    "start": segment.get("start"),
                    "end": segment.get("end"),
                    "speaker": segment.get("speaker"),
                    "text": text,
                    "reason": "Matched support QA rubric language",
                    "confidence": 0.85,
                }
            )
    return evidence


def _find_risks(segments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    risky_terms = ["guarantee", "definitely refund", "never happen again"]
    risks = []
    for segment in segments:
        text = segment.get("text", "")
        if any(term in text.lower() for term in risky_terms):
            risks.append(
                {
                    "text": text,
                    "start": segment.get("start"),
                    "end": segment.get("end"),
                    "reason": "Potential unsupported promise",
                }
            )
    return risks


def _find_questions(segments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    questions = []
    for segment in segments:
        text = segment.get("text", "")
        lowered = text.lower().strip()
        if "?" in text or lowered.startswith(QUESTION_STARTERS):
            questions.append(segment)
    return questions[:6]


def _find_action_items(segments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    actions = []
    for segment in segments:
        text = segment.get("text", "")
        lowered = text.lower()
        if any(term in lowered for term in ACTION_TERMS):
            actions.append(
                {
                    "owner": segment.get("speaker") or "Unknown",
                    "text": text,
                    "start": segment.get("start"),
                    "end": segment.get("end"),
                }
            )
    return actions[:8]


def _customer_pain_points(segments: list[dict[str, Any]], customer_speaker: str | None) -> list[str]:
    points = []
    for segment in segments:
        if customer_speaker and segment.get("speaker") != customer_speaker:
            continue
        text = segment.get("text", "")
        if any(term in text.lower() for term in ["broken", "failing", "can't", "issue", "problem"]):
            points.append(text)
    return points[:5]


def _coaching_notes(items: dict[str, Any], risks: list[dict[str, Any]]) -> list[str]:
    notes = []
    for item in items.values():
        if item["status"] != "Pass":
            notes.append(f"Review {item['label'].lower()} with the agent.")
    if risks:
        notes.append("Review risky promises before sharing commitments with customers.")
    return notes[:6]
