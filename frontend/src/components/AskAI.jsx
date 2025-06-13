import { useState, useRef, useEffect } from "react";

const AskAI = ({ videoUrl, onSeek }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const textAreaRef = useRef(null);

  // Extract video ID (e.g. from full YouTube link)
  const getVideoId = (url) => {
    const match = url.match(/v=([^&]+)/);
    return match ? match[1] : "";
  };

  const videoId = getVideoId(videoUrl);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [question]);

  useEffect(() => {
  setMessages([]);
  setQuestion("");
}, [videoUrl]);


  const handleAsk = async () => {
    if (!question.trim()) return;
    const userMsg = { type: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setQuestion("");

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: videoUrl, question }),
      });
      const data = await response.json();
      const aiMsg = { type: "ai", text: data.answer || "No response from AI." };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "❌ Failed to fetch AI response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const parseTimestampToSeconds = (ts) => {
    const parts = ts.split(":").map(Number).reverse();
    return parts.reduce((acc, val, i) => acc + val * Math.pow(60, i), 0);
  };

  const formatWithTimestamps = (text) => {
    const timestampRegex = /(?<!\d)(\d{1,2}:\d{2}(?::\d{2})?)(?!\d)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = timestampRegex.exec(text)) !== null) {
      const index = match.index;
      const timestamp = match[1];
      const seconds = parseTimestampToSeconds(timestamp);

      if (index > lastIndex) {
        parts.push(<span key={lastIndex}>{text.slice(lastIndex, index)}</span>);
      }

      parts.push(
        <span
          key={index}
          onClick={() => onSeek && onSeek(seconds)}
          className="text-blue-400 hover:underline cursor-pointer"
        >
          <a
            href={`https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => onSeek ? e.preventDefault() : null}
          >
            {timestamp}
          </a>
        </span>
      );

      lastIndex = index + timestamp.length;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
    }

    return parts;
  };

  const clearChat = () => {
    setMessages([]);
    setQuestion("");
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] overflow-hidden border-t border-gray-700 pt-4 mt-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-white">
          💬 Ask Anything About This Video
        </h2>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs text-gray-400 hover:text-red-400 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`whitespace-pre-wrap px-4 py-2 rounded-lg max-w-[75%] text-sm ${
                msg.type === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-700 text-white rounded-bl-none"
              }`}
            >
              {msg.type === "ai" ? formatWithTimestamps(msg.text) : msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg animate-pulse">
              AI is thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Ask bar */}
      <div className="flex items-end gap-2 mt-2">
        <textarea
          ref={textAreaRef}
          rows={1}
          className="flex-1 resize-none px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          placeholder="Ask something like 'What’s the speaker’s take on education reform?'"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ minHeight: "48px", maxHeight: "160px", lineHeight: "1.5rem" }}
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-50"
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>
    </div>
  );
};

export default AskAI;
