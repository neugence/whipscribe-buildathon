from app.qa_engine import build_transcript_review, score_support_call


def test_scores_support_call_with_evidence():
    transcript = {
        "segments": [
            {"start": 0.0, "end": 4.0, "speaker": "SPEAKER_00", "text": "Hi, thanks for calling Acme support."},
            {"start": 5.0, "end": 9.0, "speaker": "SPEAKER_01", "text": "My billing page is failing."},
            {
                "start": 10.0,
                "end": 18.0,
                "speaker": "SPEAKER_00",
                "text": "I understand the billing page is failing. I will follow up by email today.",
            },
        ]
    }

    report = score_support_call(transcript, {"agent": "SPEAKER_00", "customer": "SPEAKER_01"})

    assert report["score"] > 0
    assert report["items"]["greeting"]["status"] == "Pass"
    assert report["items"]["follow_up_owner"]["status"] == "Pass"
    assert report["items"]["timeline_clarity"]["status"] == "Pass"
    assert report["items"]["greeting"]["evidence"][0]["start"] == 0.0


def test_support_score_uses_full_rubric_and_flags_missing_empathy():
    transcript = {
        "segments": [
            {"start": 0.0, "end": 4.0, "speaker": "Agent", "text": "Hi, thanks for calling support."},
            {"start": 5.0, "end": 9.0, "speaker": "Customer", "text": "My invoice is broken."},
            {
                "start": 10.0,
                "end": 18.0,
                "speaker": "Agent",
                "text": "I understand the invoice issue. I will reset billing and send you an email within 24 hours.",
            },
            {"start": 19.0, "end": 22.0, "speaker": "Agent", "text": "Does that help?"},
        ]
    }

    report = score_support_call(transcript, {"agent": "Agent", "customer": "Customer"})

    assert report["max_score"] == 100
    assert report["score"] == 90
    assert report["items"]["empathy"]["status"] == "Needs review"
    assert "Review empathy with the agent." in report["coaching_notes"]


def test_generic_review_extracts_general_insights_without_qa_score():
    transcript = {
        "segments": [
            {"start": 0.0, "end": 3.0, "speaker": "Speaker 1", "text": "We need to publish the launch post tomorrow."},
            {"start": 3.1, "end": 6.0, "speaker": "Speaker 2", "text": "Can you send the final screenshots today?"},
            {"start": 6.1, "end": 9.0, "speaker": "Speaker 1", "text": "I will follow up with design before 5 pm."},
        ]
    }

    review = build_transcript_review(transcript)

    assert review["workflow_type"] == "generic_review"
    assert "score" not in review
    assert review["key_moments"][0]["text"] == "We need to publish the launch post tomorrow."
    assert review["questions"][0]["text"] == "Can you send the final screenshots today?"
    assert review["action_items"][0]["owner"] == "Speaker 1"
