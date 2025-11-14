import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useState } from "react";
import "./App.css";
import ProtectedRoute from "./context/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import RecordButton from "./components/RecordButton";
import HistoryList from "./components/HistoryList";
import Toast from "./components/Toast";

// Lazy load auth pages
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

// Loading fallback component
function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-primary)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </div>
    </div>
  );
}

// Main Dashboard Component (extracted from first App.js)
function Dashboard() {
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [toast, setToast] = useState(null);

  // Toast helper function
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setLoading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("audio", file);

      const response = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();
      if (data.success) {
        setTranscription(data.transcription || "");
        showToast("Transcription completed!", "success");
      } else {
        throw new Error(data.error || "Transcription failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setTranscription(`Error: ${error.message}`);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const copyTranscription = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
      showToast("Copied to clipboard!", "success");
    }
  };

  const downloadTranscription = () => {
    if (!transcription) return;
    const blob = new Blob([transcription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcription-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Download started!", "success");
  };

  return (
    <div className="new-layout">
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="navbar__left">
          <div className="navbar__logo">
            <span className="navbar__icon">🎤</span>
            <div>
              <h1 className="navbar__title">Speech to Text</h1>
              <p className="navbar__subtitle">
                Upload audio and get instant transcripts
              </p>
            </div>
          </div>
        </div>
        <div className="navbar__right">
          <button
            className="navbar__btn"
            onClick={() => setShowAllHistory(!showAllHistory)}
          >
            📜 History
          </button>
          <div className="navbar__status">
            <span className="status-dot"></span>
            Powered by AssemblyAI
          </div>
        </div>
      </nav>

      {/* Main Content - Two Columns */}
      <main className="main-content">
        {/* Left Column - Record & Upload */}
        <aside className="left-panel">
          <div className="panel-card">
            <h2 className="panel-title">Choose Input Method</h2>
            <p className="panel-subtitle">Record live or upload audio file</p>

            {/* RECORD CARD - TOP */}
            <div className="icon-card icon-card--record">
              <div className="icon-card__icon">🎤</div>
              <h3 className="icon-card__title">Record Audio</h3>
              <p className="icon-card__subtitle">Live microphone recording</p>
              <div className="icon-card__action">
                <RecordButton
                  onFileReady={handleFileUpload}
                  onStart={() => setRecording(true)}
                  onStop={() => setRecording(false)}
                  recording={recording}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="divider-or">
              <span>OR</span>
            </div>

            {/* UPLOAD CARD - BOTTOM */}
            <label
              htmlFor="file-upload"
              className="icon-card icon-card--upload"
            >
              <div className="icon-card__icon">📁</div>
              <h3 className="icon-card__title">Upload File</h3>
              <p className="icon-card__subtitle">MP3, WAV, M4A supported</p>
              <div className="icon-card__action">
                <span className="browse-btn">Browse Files</span>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".mp3,.wav,.m4a,.webm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                style={{ display: "none" }}
              />
            </label>

            {/* Status Badge */}
            <div className="status-badge">
              <span className="status-badge__dot"></span>
              Powered by AssemblyAI
            </div>
          </div>
        </aside>

        {/* Right Column - Transcription */}
        <section className="right-panel">
          <div className="transcription-panel">
            <div className="transcription-header">
              <h2 className="transcription-title">Transcription</h2>
              {transcription && (
                <div className="transcription-actions">
                  <button
                    className="action-btn"
                    onClick={copyTranscription}
                    title="Copy"
                  >
                    📋 Copy
                  </button>
                  <button
                    className="action-btn"
                    onClick={downloadTranscription}
                    title="Download"
                  >
                    ⬇️ Download
                  </button>
                </div>
              )}
            </div>

            <div className="transcription-content">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Transcribing your audio...</p>
                </div>
              ) : transcription ? (
                <div className="transcription-text">{transcription}</div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">✨</span>
                  <p>Your transcription will appear here.</p>
                  <p className="empty-hint">
                    Upload an audio file or record to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* RIGHT SIDEBAR - HISTORY */}
      <aside
        className={`history-sidebar ${
          showAllHistory ? "history-sidebar--open" : ""
        }`}
      >
        <div className="history-sidebar__header">
          <h2 className="history-sidebar__title">📜 Transcription History</h2>
          <button
            className="history-sidebar__close"
            onClick={() => setShowAllHistory(false)}
            title="Close History"
          >
            ✕
          </button>
        </div>

        <div className="history-sidebar__content">
          <HistoryList />
        </div>
      </aside>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// Main App Component with routing
export default function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loader while checking authentication
  if (loading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes - Redirect to dashboard if already authenticated */}
        <Route
          path="/signin"
          element={isAuthenticated ? <Navigate to="/" replace /> : <SignIn />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" replace /> : <SignUp />}
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />
          }
        />
        <Route
          path="/reset-password"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <ResetPassword />
          }
        />

        {/* Protected Routes - Require authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
