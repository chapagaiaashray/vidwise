// src/components/TranscriptWithVideo.jsx
import YouTube from "react-youtube";
import { useRef } from "react";

const TranscriptWithVideo = ({ videoId, segments }) => {
  const playerRef = useRef(null);

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
    <div className="grid md:grid-cols-3 gap-6">
      {/* YouTube Player */}
      <div className="md:col-span-2">
        <YouTube
          videoId={videoId}
          onReady={onPlayerReady}
          opts={{
            width: "100%",
            playerVars: { autoplay: 0 },
          }}
        />
        <div className="mt-6 space-y-4">
          {segments.map((seg, i) => (
            <div
              key={i}
              className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 cursor-pointer"
              onClick={() => seekTo(seg.start)}
            >
              <p className="text-sm text-purple-400 font-mono mb-1">
                {formatTime(seg.start)} - {formatTime(seg.end)}
              </p>
              <p className="text-white">{seg.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="bg-gray-900 p-4 rounded-lg h-fit shadow-lg">
        <h2 className="text-xl font-semibold mb-3 text-white">💬 Ask AI About This Video</h2>
        <AskAI videoUrl={`https://www.youtube.com/watch?v=${videoId}`} />
      </div>
    </div>
  );
};

const formatTime = (s) => {
  const minutes = Math.floor(s / 60);
  const seconds = Math.floor(s % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export default TranscriptWithVideo;
