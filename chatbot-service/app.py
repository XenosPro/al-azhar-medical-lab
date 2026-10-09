```python
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
                    detail=(
                        "The chatbot is temporarily busy. "
                        "Please try again shortly."
                    ),
                ) from exc

            import time
            time.sleep(2 * (attempt + 1))
```
