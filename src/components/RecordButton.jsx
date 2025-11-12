import { useEffect, useRef, useState } from "react";

export default function RecordButton({
  onFileReady,
  onStart,
  onStop,
  recording,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const [duration, setDuration] = useState(0);

  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key?.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        toggleRecording();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRecording]);

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Check supported mime types
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm"; // fallback

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes("webm") ? "webm" : "m4a";
        const file = new File([blob], `recording-${Date.now()}.${ext}`, {
          type: mimeType,
        });
        onFileReady?.(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      onStart?.();

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (error) {
      console.error("Recording error:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
      setIsRecording(false);
      onStop?.();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!supported) {
    return (
      <div className="record-unsupported">
        ⚠️ Recording not supported in this browser
      </div>
    );
  }

  return (
    <div className="record-button-wrapper">
      <button
        className={`btn btn-primary ${isRecording ? "btn-recording" : ""}`}
        onClick={toggleRecording}
      >
        <span className="btn-icon">{isRecording ? "⏹️" : "🎤"}</span>
        {isRecording ? (
          <>
            Stop Recording
            <span className="record-duration">{formatDuration(duration)}</span>
          </>
        ) : (
          "Start Recording"
        )}
      </button>

      {!isRecording && (
        <p className="record-hint">Press R to toggle recording</p>
      )}
    </div>
  );
}
