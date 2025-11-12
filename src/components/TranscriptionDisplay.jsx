export default function TranscriptionDisplay({
  text,
  onCopy,
  onDownload,
  onClear,
}) {
  if (!text) {
    return null;
  }

  return (
    <section className="transcription">
      <div className="transcription__header">
        <h2 className="transcription__title">Transcription</h2>
        <div className="transcription__actions">
          <button
            className="icon-btn"
            onClick={onCopy}
            title="Copy to clipboard"
          >
            📋
          </button>
          <button
            className="icon-btn"
            onClick={onDownload}
            title="Download as text file"
          >
            ⬇️
          </button>
          <button
            className="icon-btn"
            onClick={onClear}
            title="Clear transcription"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="transcription__content">{text}</div>
    </section>
  );
}
