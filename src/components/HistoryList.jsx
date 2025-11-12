import { useState, useEffect } from "react";

export default function HistoryList() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/api/history");
      if (!response.ok) throw new Error("Failed to fetch history");

      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transcription? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/history/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setHistory(history.filter((item) => item._id !== id));
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting transcription");
    }
  };

  const handleDownload = (item) => {
    const blob = new Blob([item.transcription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = extractFilename(item.filename);
    a.download = `${filename}-transcription.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper function to extract filename from full path
  const extractFilename = (fullPath) => {
    if (!fullPath) return "recording";

    // Handle Windows paths (backslash)
    if (fullPath.includes("\\")) {
      const parts = fullPath.split("\\");
      return parts[parts.length - 1];
    }

    // Handle Unix/Mac paths (forward slash)
    if (fullPath.includes("/")) {
      const parts = fullPath.split("/");
      return parts[parts.length - 1];
    }

    // If no path separators, return as-is
    return fullPath;
  };

  // Helper function to get file extension
  const getFileExtension = (filename) => {
    const name = extractFilename(filename);
    const parts = name.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1].toUpperCase();
    }
    return "FILE";
  };

  if (loading) {
    return (
      <div className="history-loading">
        <div className="loading__spinner"></div>
        <p className="loading__text">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-error">
        <p>⚠️ Error: {error}</p>
        <button onClick={fetchHistory} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="history-empty">
        <p className="history-empty__icon">📝</p>
        <p className="history-empty__text">No transcription history yet</p>
        <p className="history-empty__hint">
          Upload an audio file or record to get started
        </p>
      </div>
    );
  }

  return (
    <div className="history__grid">
      {history.map((item) => {
        const filename = extractFilename(item.filename);
        const fileType = getFileExtension(item.filename);

        return (
          <div key={item._id} className="history-card">
            {/* Card Header with filename and badge */}
            <div className="history-card__header">
              <h4 className="history-card__name">{filename}</h4>
              <span className="history-card__badge">{fileType}</span>
            </div>

            {/* Date */}
            <div className="history-card__date">
              {new Date(item.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </div>

            {/* Preview */}
            <div className="history-card__preview">{item.transcription}</div>

            {/* Actions */}
            <div className="history-card__actions">
              <button
                className="history-card__btn history-card__btn--download"
                onClick={() => handleDownload(item)}
                title="Download"
              >
                ⬇️
              </button>
              <button
                className="history-card__btn history-card__btn--delete"
                onClick={() => handleDelete(item._id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
