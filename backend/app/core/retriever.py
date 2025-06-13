import faiss
import numpy as np

class TranscriptRetriever:
    def __init__(self, embeddings, chunks):
        self.chunks = chunks
        self.index = faiss.IndexFlatL2(embeddings.shape[1])
        self.index.add(embeddings)

    def retrieve(self, query_embedding, top_k=5):
        D, I = self.index.search(query_embedding, top_k)
        results = [self.chunks[i] for i in I[0]]
        return results
