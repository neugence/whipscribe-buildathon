"""
Unit Tests for Server-Side Auth Verification, User Scoping, and Guardrail Rules.
"""

import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from whipscribe.agent.models import AgentProposal, RequirementItem, TaskItem
from whipscribe.agent.guardrails import GuardrailValidator


class TestSecurityAndGuardrails(unittest.TestCase):

    def test_guardrail_drops_items_without_timestamps(self):
        proposal = AgentProposal(
            intent="discovery",
            summary="Test proposal",
            requirements=[
                RequirementItem(id="r1", category="must_have", text="Sync calendar", time="01:24"),
                RequirementItem(id="r2", category="nice_to_have", text="Dark mode", time=""),
                RequirementItem(id="r3", category="goal", text="Fast loading", time="00:00"),
            ],
            tasks=[
                TaskItem(id="t1", title="Calendar API", description="", effort="M", estimated_hours=5.0, time="01:45"),
                TaskItem(id="t2", title="Unverified task", description="", effort="S", estimated_hours=2.0, time=""),
            ],
        )

        transcript_text = "[01:24] CLIENT: Need calendar sync. [01:45] FREELANCER: I will build Calendar API."

        sanitized = GuardrailValidator.sanitize_proposal(proposal, transcript_text)

        # Requirement r2 (empty time) and r3 (unverified 00:00) should be dropped!
        self.assertEqual(len(sanitized.requirements), 1)
        self.assertEqual(sanitized.requirements[0].id, "r1")

        # Task t2 (empty time) should be dropped!
        self.assertEqual(len(sanitized.tasks), 1)
        self.assertEqual(sanitized.tasks[0].id, "t1")

    @patch.dict(os.environ, {"DEBUG": "false", "ALLOW_UNAUTHENTICATED_DEV": "false"})
    def test_unauthenticated_request_rejected_in_production(self):
        from fastapi import HTTPException
        from main import get_current_user_id

        # Calling without authorization header in non-DEBUG mode must raise 401 HTTPException
        with self.assertRaises(HTTPException) as ctx:
            get_current_user_id(authorization=None, x_user_id=None, db=MagicMock())

        self.assertEqual(ctx.exception.status_code, 401)

    @patch.dict(os.environ, {"CLERK_SECRET_KEY": "sk_test_Wq3h1EOjfL1KjdymAlksTAGvClhGLOijON8e7HCSZ9"})
    def test_verify_clerk_token_extracts_user_id(self):
        import time, jwt
        from main import verify_clerk_token

        # Create a valid Clerk JWT session token payload
        now = int(time.time())
        token = jwt.encode(
            {
                "sub": "user_2r2yVL_test_freelancer",
                "exp": now + 3600,
                "iat": now,
                "iss": "https://clerk.test.dev",
            },
            "dummy_rsa_or_secret",
            algorithm="HS256",
        )

        user_id = verify_clerk_token(token)
        self.assertEqual(user_id, "user_2r2yVL_test_freelancer")

    def test_verify_clerk_token_rejects_expired_token(self):
        import time, jwt
        from main import verify_clerk_token

        now = int(time.time())
        expired_token = jwt.encode(
            {
                "sub": "user_2r2yVL_test_freelancer",
                "exp": now - 3600,  # Expired 1 hour ago
                "iat": now - 7200,
            },
            "dummy_secret",
            algorithm="HS256",
        )

        user_id = verify_clerk_token(expired_token)
        self.assertIsNone(user_id)

    def test_webhook_handles_null_or_empty_payload(self):
        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        headers = {
            "svix-id": "msg_test_123",
            "svix-timestamp": "1234567890",
            "svix-signature": "v1,dummy_signature",
        }

        # Test empty body
        resp = client.post("/api/webhooks/clerk", headers=headers, content=b"")
        self.assertEqual(resp.status_code, 400)

        # Test null json payload
        resp = client.post("/api/webhooks/clerk", headers=headers, content=b"null")
        self.assertEqual(resp.status_code, 400)

    def test_webhook_missing_svix_headers(self):
        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        resp = client.post("/api/webhooks/clerk", json={"type": "user.created"})
        self.assertEqual(resp.status_code, 400)

    def test_webhook_handles_valid_clerk_user_created_payload(self):
        from fastapi.testclient import TestClient
        from main import app

        client = TestClient(app)
        headers = {
            "svix-id": "msg_test_user_created",
            "svix-timestamp": "1790452943989",
            "svix-signature": "v1,dummy_signature",
        }
        payload = {
            "type": "user.created",
            "data": {
                "id": "user_3JsbuFC6RPOo8MuVZxaOs1tP0DT",
                "first_name": "Vijay",
                "last_name": "Singh",
                "image_url": "https://img.clerk.com/dummy.jpg",
                "email_addresses": [
                    {
                        "id": "idn_3JsbtWJqp0tV250Qi9NBthdRE3O",
                        "email_address": "vijaysingh.handler@gmail.com",
                    }
                ],
                "primary_email_address_id": "idn_3JsbtWJqp0tV250Qi9NBthdRE3O",
            },
        }
        resp = client.post("/api/webhooks/clerk", headers=headers, json=payload)
        self.assertEqual(resp.status_code, 200)
        json_data = resp.json()
        self.assertEqual(json_data["status"], "success")
        self.assertIn("user_3JsbuFC6RPOo8MuVZxaOs1tP0DT", json_data["message"])


if __name__ == "__main__":
    unittest.main()



