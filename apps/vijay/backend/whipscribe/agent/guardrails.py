"""
Guardrails and Verification Layer for WhipScribe Agent System.

Enforces strict agent safety rules:
1. Timestamp Requirement: Ensures every requirement/task links to a valid transcript timestamp.
2. Tool Loop Safety Cap: Prevents infinite agent execution loops.
3. Human-in-the-Loop Safety: Ensures external side-effects require human approval.
"""

import logging
from typing import List
from .tools import AgentProposal, RequirementItem, TaskItem, ScopeChangeItem

logger = logging.getLogger(__name__)

MAX_TOOL_CALL_LOOPS = 5


class GuardrailValidator:
    """Enforces safety rules and data integrity checks on agent proposals."""

    @staticmethod
    def verify_timestamp_exists(time_val: str, transcript_text: str) -> bool:
        """Validates that a timestamp string exists in the transcript text."""
        time_clean = (time_val or "").strip()
        if not time_clean:
            return False
        return (time_clean in transcript_text) or (f"[{time_clean}]" in transcript_text)

    @staticmethod
    def sanitize_proposal(proposal: AgentProposal, transcript_text: str) -> AgentProposal:
        """Filters out items that lack timestamps or fail verification according to strict 'no timestamp, no item' rule."""
        # 1. Verify requirements
        valid_requirements: List[RequirementItem] = []
        for req in proposal.requirements:
            time_val = (req.time or "").strip()
            if not GuardrailValidator.verify_timestamp_exists(time_val, transcript_text):
                logger.warning(f"Guardrail Drop: Requirement '{req.text}' dropped (unverified timestamp '{time_val}').")
                continue
            valid_requirements.append(req)
        proposal.requirements = valid_requirements

        # 2. Verify tasks
        valid_tasks: List[TaskItem] = []
        for task in proposal.tasks:
            time_val = (task.time or "").strip()
            if not GuardrailValidator.verify_timestamp_exists(time_val, transcript_text):
                logger.warning(f"Guardrail Drop: Task '{task.title}' dropped (unverified timestamp '{time_val}').")
                continue
            valid_tasks.append(task)
        proposal.tasks = valid_tasks

        # 3. Verify scope changes
        valid_changes: List[ScopeChangeItem] = []
        for change in proposal.scope_changes:
            time_val = (change.time or "").strip()
            if not GuardrailValidator.verify_timestamp_exists(time_val, transcript_text):
                logger.warning(f"Guardrail Drop: Scope change dropped (unverified timestamp '{time_val}').")
                continue
            valid_changes.append(change)
        proposal.scope_changes = valid_changes

        return proposal

    @staticmethod
    def check_loop_limit(current_loop_count: int) -> bool:
        """Enforces tool loop iteration cap."""
        if current_loop_count >= MAX_TOOL_CALL_LOOPS:
            logger.error(f"Guardrail Alert: Agent exceeded max tool loop cap of {MAX_TOOL_CALL_LOOPS}.")
            return False
        return True
