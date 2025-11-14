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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontSize: "1.5rem",
        color: "var(--accent-cyan)",
      }}
    >
      Loading...
    </div>
  );
}

// Main Dashboard Component
function Dashboard() {
  const { user, logout } = useAuth(); // ← FIXED: Changed from 'signout' to 'logout'
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [toast, setToast] = useState(null);

  // Toast helper function
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleFileUpload = async (files) => {
    // `files` may be a FileList from an <input>. Use the first file.
    const file = files && files[0] ? files[0] : null;
    if (!file) {
      showToast("No file selected", "error");
      return;
    }

    try {
      setLoading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("audio", file);

      const token = sessionStorage.getItem("accessToken");
      const response = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      setTranscription(data.transcription || data.text);
      showToast("✅ Transcription completed!", "success");
    } catch (error) {
      console.error("Upload error:", error);
      showToast(`❌ ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingComplete = async (audioBlob) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      const token = sessionStorage.getItem("accessToken");
      const response = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      setTranscription(data.transcription || data.text);
      showToast("✅ Recording transcribed!", "success");
    } catch (error) {
      console.error("Recording error:", error);
      showToast(`❌ ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
      showToast("📋 Copied to clipboard!", "success");
    }
  };

  const downloadTranscription = () => {
    if (transcription) {
      const blob = new Blob([transcription], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transcription-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("⬇️ Downloaded!", "success");
    }
  };

  // ✅ FIXED LOGOUT HANDLER
  const handleLogout = async () => {
    try {
      await logout(); // ← FIXED: Changed from 'signout()' to 'logout()'
      showToast("👋 Signed out successfully!", "success");
    } catch (error) {
      console.error("Logout error:", error);
      showToast(`❌ Logout failed`, "error");
    }
  };

  return (
    <div className="new-layout">
      {/* TOP NAVBAR */}
      <nav className="navbar">
        <div className="navbar__left">
          <div className="navbar__logo">
            <div className="navbar__icon">🎤</div>
            <div>
              <h1 className="navbar__title">Speech to Text</h1>
              <p className="navbar__subtitle">
                Upload audio and get instant transcripts
              </p>
            </div>
          </div>
        </div>

        <div className="navbar__right">
          {/* HISTORY BUTTON - Enhanced */}
          <button
            className="navbar__btn--modern"
            onClick={() => setShowAllHistory(true)}
          >
            <span className="btn-icon">📋</span>
            History
          </button>

          {/* USER INFO & SIGN OUT - Enhanced */}
          {user && (
            <>
              <div className="navbar__user-badge">
                <span className="status-dot"></span>
                <span>{user.name || user.email}</span>
              </div>

              <button className="navbar__btn--signout" onClick={handleLogout}>
                <span className="btn-icon">🚪</span>
                Sign Out
              </button>
            </>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT - TWO COLUMN LAYOUT */}
      <div className="main-content">
        {/* LEFT PANEL - INPUT METHODS */}
        <div className="left-panel">
          <div className="panel-card">
            <h2 className="panel-title">Choose Input Method</h2>
            <p className="panel-subtitle">Record live or upload audio file</p>

            {/* RECORD CARD */}
            <div className="icon-card icon-card--record">
              <div className="icon-card__icon">🎤</div>
              <h3 className="icon-card__title">Record Audio</h3>
              <p className="icon-card__subtitle">Live microphone recording</p>
              <div className="icon-card__action">
                <RecordButton
                  // RecordButton expects `onFileReady`, `onStart`, and `onStop`
                  onFileReady={handleRecordingComplete}
                  onStart={() => setRecording(true)}
                  onStop={() => setRecording(false)}
                />
              </div>
            </div>

            <div className="divider-or">OR</div>

            {/* UPLOAD CARD */}
            <div className="icon-card icon-card--upload">
              <div className="icon-card__icon">📁</div>
              <h3 className="icon-card__title">Upload File</h3>
              <p className="icon-card__subtitle">MP3, WAV, M4A supported</p>
              <div className="icon-card__action">
                <label htmlFor="file-upload" className="browse-btn">
                  Browse Files
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - TRANSCRIPTION */}
        <div className="right-panel">
          <div className="transcription-panel">
            <div className="transcription-header">
              <h2 className="transcription-title">Transcription</h2>
              {transcription && (
                <div className="transcription-actions">
                  <button className="action-btn" onClick={copyToClipboard}>
                    📋 Copy
                  </button>
                  <button
                    className="action-btn"
                    onClick={downloadTranscription}
                  >
                    ⬇️ Download
                  </button>
                </div>
              )}
            </div>

            <div className="transcription-content">
              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Transcribing your audio...</p>
                </div>
              )}

              {!loading && !transcription && (
                <div className="empty-state">
                  <div className="empty-icon">🎙️</div>
                  <p>Your transcription will appear here.</p>
                  <p className="empty-hint">
                    Upload an audio file or record to get started
                  </p>
                </div>
              )}

              {!loading && transcription && (
                <div className="transcription-text">{transcription}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HISTORY SIDEBAR */}
      <div
        className={`history-sidebar ${
          showAllHistory ? "history-sidebar--open" : ""
        }`}
      >
        <div className="history-sidebar__header">
          <h3 className="history-sidebar__title">📂 History</h3>
          <button
            className="history-sidebar__close"
            onClick={() => setShowAllHistory(false)}
          >
            ✕
          </button>
        </div>
        <div className="history-sidebar__content">
          <HistoryList onTranscriptionSelect={setTranscription} />
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
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

// Main App Router
export default function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/signin"
        element={
          <Suspense fallback={<PageLoader />}>
            <SignIn />
          </Suspense>
        }
      />
      <Route
        path="/signup"
        element={
          <Suspense fallback={<PageLoader />}>
            <SignUp />
          </Suspense>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<PageLoader />}>
            <ForgotPassword />
          </Suspense>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<PageLoader />}>
            <ResetPassword />
          </Suspense>
        }
      />

      {/* Protected Dashboard Route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
