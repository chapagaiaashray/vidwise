import whisper

def transcribe_audio_file(file_path: str) -> dict:
    model = whisper.load_model("base")  # or "small", "medium", "large"
    result = model.transcribe(file_path)
    return result
