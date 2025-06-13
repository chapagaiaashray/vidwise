# app/core/summarizer.py
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_segments(segments, max_chunk_words=120):
    grouped = []
    current_group = []
    current_words = 0

    for seg in segments:
        seg_words = len(seg["text"].split())
        current_group.append(seg)
        current_words += seg_words

        if current_words >= max_chunk_words:
            grouped.append(current_group)
            current_group = []
            current_words = 0

    if current_group:
        grouped.append(current_group)

    summaries = []
    for i, group in enumerate(grouped):
        start = group[0]["start"]
        end = group[-1]["end"]
        full_text = " ".join([seg["text"] for seg in group])

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You're an expert summarizer helping segment a video. "
                            "For the provided transcript section, return a short title and a concise summary.\n\n"
                            "Respond in this format:\n"
                            "**Title**: ...\n**Summary**: ..."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Transcript:\n{full_text}",
                    },
                ],
                temperature=0.5,
                max_tokens=200,
            )

            result = response.choices[0].message.content
            if "**Title**:" in result and "**Summary**:" in result:
                title = result.split("**Title**:")[1].split("**Summary**:")[0].strip()
                summary = result.split("**Summary**:")[1].strip()
            else:
                title = "Untitled Section"
                summary = result.strip()

        except Exception as e:
            title = "Error"
            summary = f"[Error summarizing: {str(e)}]"

        summaries.append({
            "start": start,
            "end": end,
            "title": title,
            "summary": summary,
        })

    return summaries
