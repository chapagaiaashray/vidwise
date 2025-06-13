import os
from sentence_transformers import SentenceTransformer
import numpy as np

CHUNK_SIZE = 500  # characters per chunk (adjustable)
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"

model = SentenceTransformer(EMBED_MODEL_NAME)

def chunk_transcript(segments, chunk_size=CHUNK_SIZE):
    chunks = []
    current_chunk = ""
    current_start = segments[0]['start']

    for seg in segments:
        current_chunk += seg['text'].strip() + " "
        if len(current_chunk) >= chunk_size:
            chunks.append({
                "text": current_chunk.strip(),
                "start": current_start,
                "end": seg['end']
            })
            current_chunk = ""
            current_start = seg['end']
    
    if current_chunk:
        chunks.append({
            "text": current_chunk.strip(),
            "start": current_start,
            "end": segments[-1]['end']
        })

    return chunks

def embed_chunks(chunks):
    texts = [chunk["text"] for chunk in chunks]
    embeddings = model.encode(texts, show_progress_bar=False)
    return np.array(embeddings), chunks
