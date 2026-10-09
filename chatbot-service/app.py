import os
import time
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).with_name(".env"))

API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

SYSTEM_PROMPT = """
You are the virtual assistant for Al-Azhar Medical Lab in Cherchell, Algeria.
Help visitors with general information about laboratory services, appointments,
opening hours, location, and contact details.

The laboratory is located at Rue Freres Saadoun, Cherchell, Algeria 42002.
Phone and WhatsApp: +213 671 33 33 71.
Email: labmabizari@gmail.com.

Be concise, clear, and professional. Do not diagnose conditions, prescribe
treatments, or interpret individual laboratory results. Explain that CKD AI
screening is not a medical diagnosis. Encourage users to consult a qualified
healthcare professional for medical questions. Never invent test prices,
appointment availability, or services not confirmed by the laboratory.
"""

app = FastAPI(title="Al-Azhar Medical Lab Chatbot", version="1.0.0")

origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGIN",
        "http://localhost:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "api_key_configured": bool(API_KEY),
        "provider": "gemini",
        "model": MODEL,
    }


@app.post("/chat")
def chat(request: ChatRequest):
    if not API_KEY:
        raise HTTPException(
            status_code=503,
            detail="The chatbot API key is not configured.",
        )

    contents = [
        types.Content(
            role="user" if message.role == "user" else "model",
            parts=[types.Part.from_text(text=message.content)],
        )
        for message in request.messages
    ]

    client = genai.Client(api_key=API_KEY)

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    max_output_tokens=500,
                ),
            )

            reply = response.text
            if not reply:
                raise HTTPException(
                    status_code=502,
                    detail="Gemini returned an empty response.",
                )

            return {"reply": reply}

        except HTTPException:
            raise
        except Exception as exc:
            print(
                f"Gemini chatbot error (attempt {attempt + 1}/3): "
                f"{type(exc).__name__}: {exc}",
                flush=True,
            )

            if attempt == 2:
                raise HTTPException(
                    status_code=503,
                    detail="The chatbot is temporarily busy. Please try again shortly.",
                ) from exc

            time.sleep(2 * (attempt + 1))
