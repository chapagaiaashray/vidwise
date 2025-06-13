from downloader import download_audio_from_youtube
from transcriber import transcribe_audio_file

url = input("Paste YouTube URL: ")
audio_path = download_audio_from_youtube(url)
print("Downloaded:", audio_path)

result = transcribe_audio_file(audio_path)
print("\n--- TRANSCRIPT START ---\n")
for seg in result['segments']:
    print(f"[{seg['start']:.2f} - {seg['end']:.2f}] {seg['text']}")
