# app/core/chatbot.py

import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_answer(question, context_chunks):
    context = "\n\n".join(
        [f"[{c['start']:.2f}-{c['end']:.2f}]: {c['text']}" for c in context_chunks]
    )

    system_prompt = (
        "You are an expert video analyst and writing coach.\n"
        "Your job is to deeply analyze YouTube video transcripts and give structured, thoughtful insight.\n\n"
        # "For each question, respond with:\n"
        # "- A bolded 1 to 2 sentence summary of the core message.\n"
        # "- Bullet-pointed key themes and examples from the transcript.\n"
        # "- Insightful takeaways: what it means and why it matters.\n"
        # "- A practical conclusion explaining how a viewer can apply the knowledge.\n\n"
        "Be clear, specific, and thoughtful. Do not repeat transcript lines verbatim. Avoid shallow or generic responses."
        "When providing summaries or answers, always include relevant timestamps **only** in YouTube format like 1:23 or 1:02:45 — never in raw seconds or brackets."
        "Use markdown links for timestamps like: [1:23](https://www.youtube.com/watch?v=VIDEO_ID&t=83)"
    )

    user_prompt = f"Context:\n{context}\n\nQuestion:\n{question}"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=700
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"❌ Error generating response: {str(e)}"
