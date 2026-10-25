"""
LLM Client Factory — Supports both Groq and Gemini API keys.

Reads GROQ_API_KEY or GEMINI_API_KEY from backend/.env.
If GROQ_API_KEY is present, uses Groq (default model: qwen/qwen3.8-27b).
Otherwise uses Gemini API (google-genai SDK).
"""

import logging
import json
from typing import Optional, Any, Dict
from pydantic import BaseModel

from whipscribe.settings import settings

logger = logging.getLogger(__name__)

try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False
    genai = None
    types = None

try:
    from groq import Groq
    HAS_GROQ = True
except ImportError:
    HAS_GROQ = False
    Groq = None


class VertexClientFactory:
    """
    LLM Client Factory supporting Groq and Gemini API key directly.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        project: Optional[str] = None,
        location: Optional[str] = None,
    ):
        self.groq_api_key = settings.effective_groq_api_key
        self.groq_model = settings.effective_groq_model

        self.gemini_api_key = api_key or settings.effective_gemini_api_key
        self.gemini_model = model_name or settings.effective_vertex_model

        self._genai_client: Optional[Any] = None
        self._groq_client: Optional[Any] = None

    def get_groq_client(self) -> Any:
        if not HAS_GROQ:
            raise ImportError("groq package is not installed. Run: pip install groq")
        if not self.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is not set in backend/.env")
        if self._groq_client is None:
            logger.info("Initialising Groq client.")
            self._groq_client = Groq(api_key=self.groq_api_key)
        return self._groq_client

    def get_gemini_client(self) -> Any:
        if not HAS_GENAI:
            raise ImportError("google-genai is not installed. Run: pip install google-genai")
        if not self.gemini_api_key:
            raise RuntimeError("Gemini API key not configured in backend/.env")
        if self._genai_client is None:
            logger.info("Initialising Gemini API client.")
            self._genai_client = genai.Client(api_key=self.gemini_api_key)
        return self._genai_client

    def generate_structured(
        self,
        prompt: str,
        response_schema: type[BaseModel],
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
    ) -> BaseModel:
        """Generates a structured JSON response conforming to a Pydantic model using Groq or Gemini."""
        # Primary: If Groq API key is present, use Groq
        if self.groq_api_key:
            try:
                return self._generate_groq(prompt, response_schema, system_instruction, temperature)
            except Exception as e:
                logger.warning(f"Groq API call failed: {e}. Falling back to Gemini if available...")

        # Fallback / Gemini
        if self.gemini_api_key:
            try:
                return self._generate_gemini(prompt, response_schema, system_instruction, temperature)
            except Exception as e:
                # If Gemini fails and Groq wasn't tried yet, try Groq
                if self.groq_api_key:
                    logger.warning(f"Gemini API failed: {e}. Trying Groq...")
                    return self._generate_groq(prompt, response_schema, system_instruction, temperature)
                raise e

        raise RuntimeError("No working LLM API key (GROQ_API_KEY or GEMINI_API_KEY) found in backend/.env")

    def _generate_groq(
        self,
        prompt: str,
        response_schema: type[BaseModel],
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
    ) -> BaseModel:
        client = self.get_groq_client()
        schema_json = json.dumps(response_schema.model_json_schema(), indent=2)

        sys_msg = (
            (system_instruction or "You are a helpful AI assistant.")
            + f"\n\nReturn ONLY a valid JSON object matching this schema:\n{schema_json}"
        )

        logger.info(f"Calling Groq API with model '{self.groq_model}'…")
        response = client.chat.completions.create(
            model=self.groq_model,
            messages=[
                {"role": "system", "content": sys_msg},
                {"role": "user", "content": prompt},
            ],
            temperature=temperature,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content or "{}"
        return response_schema.model_validate_json(content)

    def _generate_gemini(
        self,
        prompt: str,
        response_schema: type[BaseModel],
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
    ) -> BaseModel:
        client = self.get_gemini_client()

        config_args: Dict[str, Any] = {
            "temperature": temperature,
            "response_mime_type": "application/json",
            "response_schema": response_schema,
        }
        if system_instruction:
            config_args["system_instruction"] = system_instruction

        config = types.GenerateContentConfig(**config_args)

        logger.info(f"Calling Gemini API with model '{self.gemini_model}'…")
        response = client.models.generate_content(
            model=self.gemini_model,
            contents=prompt,
            config=config,
        )

        if hasattr(response, "parsed") and response.parsed is not None:
            return response.parsed

        return response_schema.model_validate_json(response.text)
