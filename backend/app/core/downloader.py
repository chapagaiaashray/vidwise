import os
import re
from yt_dlp import YoutubeDL

def sanitize_filename(title: str) -> str:
    # Remove characters not allowed in file names
    return re.sub(r'[\\/*?:"<>|]', '', title)

def download_audio_from_youtube(url: str, output_dir="data/audio") -> str:
    os.makedirs(output_dir, exist_ok=True)

    # Temporary template using ID to ensure fallback
    temp_outtmpl = os.path.join(output_dir, '%(id)s.%(ext)s')

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': temp_outtmpl,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True,
    }

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

        # Sanitize title
        safe_title = sanitize_filename(info.get("title", "audio"))
        audio_path = os.path.join(output_dir, f"{safe_title}.mp3")

        # Rename to the readable version
        temp_filename = os.path.join(output_dir, f"{info['id']}.mp3")
        if os.path.exists(temp_filename):
            os.rename(temp_filename, audio_path)
        else:
            raise FileNotFoundError(f"Downloaded file not found: {temp_filename}")

        print(f"✅ Downloaded and saved: {audio_path}")
        return audio_path
