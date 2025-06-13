import { useState, useRef } from "react";
import AskAI from "./components/AskAI";
import YouTube from "react-youtube";

export default function App() {
  const [url, setUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [summarySegments, setSummarySegments] = useState([]);
  const [loading, setLoading] = useState(false);

  const playerRef = useRef(null);

  const handleSubmit = async () => {
    setLoading(true);
    setSummarySegments([]);
    setVideoUrl("");
    try {
      const response = await fetch("http://127.0.0.1:8000/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: url }),
      });
      const data = await response.json();
      setSummarySegments(data.summarySegments || []);
      setVideoUrl(data.video_url);
    } catch (err) {
      console.error("Error fetching transcript:", err);
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeId = (link) => {
    const match = link.match(/v=([^&]+)/);
    return match ? match[1] : "";
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
  };

  const seekTo = (seconds) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        VidWise: YouTube Transcript & AI Companion
      </h1>

      {/* Input Field */}
      <div className="max-w-3xl mx-auto mb-10 flex flex-col sm:flex-row gap-4">
        <input
          className="flex-1 p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded font-semibold"
        >
          Analyze
        </button>
      </div>

      {loading && (
        <p className="text-center text-gray-400 animate-pulse">
          ⏳ Transcribing your video...
        </p>
      )}

      {videoUrl && (
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {/* Video Player + Summarized Transcript */}
          <div className="md:col-span-2 space-y-6">
            <div className="w-full max-w-2xl aspect-[16/9] mx-auto rounded-md overflow-hidden border border-gray-700 shadow-md">
              <YouTube
                videoId={extractYouTubeId(videoUrl)}
                onReady={onPlayerReady}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: { autoplay: 0 },
                }}
                className="w-full h-full"
              />
            </div>



            <h2 className="text-xl font-semibold sticky top-0 z-10 bg-gray-950 py-2">
              Transcript Timeline
            </h2>

            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
              {summarySegments.map((seg, i) => (
                <div
                  key={i}
                  onClick={() => seekTo(seg.start)}
                  className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 cursor-pointer transition"
                >
                  <p className="text-sm text-purple-400 font-mono mb-1">
                    🕒 {formatTime(seg.start)} – {formatTime(seg.end)} | <span className="font-semibold text-blue-300">{seg.title}</span>
                  </p>
                  <p className="text-white">{seg.summary}</p>

                </div>
              ))}
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="bg-gray-900 p-5 rounded-lg shadow-lg h-fit">
            <AskAI videoUrl={videoUrl} onSeek={seekTo} />
          </div>
        </div>
      )}
    </div>
  );
}

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};
