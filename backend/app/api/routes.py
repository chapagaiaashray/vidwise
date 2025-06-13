from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.downloader import download_audio_from_youtube
from app.core.transcriber import transcribe_audio_file
from app.core.embedder import chunk_transcript, embed_chunks, model
from app.core.retriever import TranscriptRetriever
from app.core.chatbot import generate_answer
from app.core.summarizer import summarize_segments
import numpy as np
import traceback
import os

router = APIRouter()

# === /transcribe route ===
class TranscribeRequest(BaseModel):
    youtube_url: str

@router.post("/transcribe")
def transcribe_youtube_video(request: TranscribeRequest):
    audio_path = None
    try:
        audio_path = download_audio_from_youtube(request.youtube_url)
        transcript = transcribe_audio_file(audio_path)
        summary_segments = summarize_segments(transcript.get("segments", []))

        return {
            "video_url": request.youtube_url,
            "summarySegments": summary_segments,
        }

    except Exception as e:
        print("❌ Transcribe error:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)
            print(f"🧹 Deleted: {audio_path}")

# === /ask route ===
class AskRequest(BaseModel):
    youtube_url: str
    question: str

@router.post("/ask")
def ask_question(request: AskRequest):
    audio_path = None
    try:
        audio_path = download_audio_from_youtube(request.youtube_url)
        result = transcribe_audio_file(audio_path)

        segments = result["segments"]
        chunks = chunk_transcript(segments)
        embeddings, chunk_data = embed_chunks(chunks)

        question_embedding = model.encode([request.question])
        retriever = TranscriptRetriever(embeddings, chunk_data)
        context = retriever.retrieve(np.array(question_embedding))

        answer = generate_answer(request.question, context)
        return {"answer": answer}

    except Exception as e:
        print("❌ Ask error:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if audio_path and os.path.exists(audio_path):
            os.remove(audio_path)
            print(f"🧹 Deleted: {audio_path}")
