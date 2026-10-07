import os
import json
import re

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types


# --------------------------------------------------
# Environment
# --------------------------------------------------

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL")


# --------------------------------------------------
# FastAPI Application
# --------------------------------------------------

app = FastAPI(
    title="CodePilot API",
    description="AI-powered code review platform",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Gemini Client
# --------------------------------------------------

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None


# --------------------------------------------------
# Request Models
# --------------------------------------------------

class ReviewRequest(BaseModel):
    code: str = Field(
        min_length=1,
        max_length=20000
    )

    language: str = Field(
        min_length=1,
        max_length=50
    )

    repository_url: str | None = Field(
        default=None,
        max_length=500
    )


# --------------------------------------------------
# Response Models
# --------------------------------------------------

class Issue(BaseModel):
    severity: str
    category: str
    title: str
    problem: str
    why_it_matters: str
    suggested_fix: str


class ReviewResponse(BaseModel):
    score: int = Field(
        ge=0,
        le=100
    )

    summary: str

    strengths: list[str]

    issues: list[Issue]

    recommendations: list[str]


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# --------------------------------------------------
# Root Endpoint
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to CodePilot API"
    }


# --------------------------------------------------
# AI Code Review
# --------------------------------------------------

@app.post(
    "/api/review",
    response_model=ReviewResponse
)
def review_code(request: ReviewRequest):

    # Check Gemini configuration
    if client is None:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured."
        )

    # Check code
    if not request.code.strip():
        raise HTTPException(
            status_code=400,
            detail="Code cannot be empty."
        )

    # --------------------------------------------------
    # AI Prompt
    # --------------------------------------------------

    prompt = f"""
You are CodePilot, an expert software engineer and professional code reviewer.

Review the following {request.language} source code.

Repository:
{request.repository_url or "Not provided"}

SOURCE CODE:
-------------------------
{request.code}
-------------------------

Analyze ONLY the code provided.

Look for:

- Bugs
- Security vulnerabilities
- Code smells
- Performance problems
- Maintainability problems
- Error handling problems
- Reliability problems
- Bad programming practices

Do not invent issues.

Be precise and practical.

Return ONLY valid JSON.

Use exactly this structure:

{{
  "score": 82,
  "summary": "Short professional summary.",
  "strengths": [
    "Positive aspect of the code."
  ],
  "issues": [
    {{
      "severity": "HIGH",
      "category": "Security",
      "title": "Short issue title",
      "problem": "Explain the problem.",
      "why_it_matters": "Explain why it matters.",
      "suggested_fix": "Explain how to fix it."
    }}
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}}

Severity MUST be exactly one of:

CRITICAL
HIGH
MEDIUM
LOW

Score must be an integer from 0 to 100.

Keep the review concise, professional, and actionable.
"""


    # --------------------------------------------------
    # Gemini Request
    # --------------------------------------------------

    try:

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=2000
            )
        )

        if not response.text:
            raise HTTPException(
                status_code=502,
                detail="Gemini returned an empty response."
            )


        # --------------------------------------------------
        # Clean Gemini Response
        # --------------------------------------------------

        result_text = response.text.strip()

        result_text = re.sub(
            r"^```json\s*",
            "",
            result_text,
            flags=re.IGNORECASE
        )

        result_text = re.sub(
            r"^```\s*",
            "",
            result_text
        )

        result_text = re.sub(
            r"\s*```$",
            "",
            result_text
        )

        result_text = result_text.strip()


        # --------------------------------------------------
        # Parse JSON
        # --------------------------------------------------

        try:

            result = json.loads(
                result_text
            )

        except json.JSONDecodeError:

            match = re.search(
                r"\{.*\}",
                result_text,
                re.DOTALL
            )

            if not match:
                raise HTTPException(
                    status_code=502,
                    detail="Gemini returned invalid JSON."
                )

            try:

                result = json.loads(
                    match.group(0)
                )

            except json.JSONDecodeError:

                raise HTTPException(
                    status_code=502,
                    detail="Gemini returned invalid JSON."
                )


        # --------------------------------------------------
        # Validate AI Response
        # --------------------------------------------------

        try:

            validated_result = ReviewResponse.model_validate(
                result
            )

        except Exception as error:

            print(
                "Validation error:",
                repr(error)
            )

            raise HTTPException(
                status_code=502,
                detail="Gemini returned an unexpected response format."
            )


        return validated_result


    # --------------------------------------------------
    # Error Handling
    # --------------------------------------------------

    except HTTPException:
        raise

    except Exception as error:

        print(
            "Gemini API error:",
            repr(error)
        )

        raise HTTPException(
            status_code=502,
            detail="Gemini API request failed."
        )