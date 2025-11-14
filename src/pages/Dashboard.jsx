import { useState } from "react";
import RecordButton from "../components/RecordButton";
import HistoryList from "../components/HistoryList";
import UserProfile from "../components/UserProfile";
import API_URL from "../config/api";

const Dashboard = () => {
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      setLoading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("audio", file);

      const response = await fetch(`${API_URL}/api/transcribe`, {
        method: "POST",
        body: uploadFormData,
        credentials: "include", // Include cookies for auth
      });

      const data = await response.json();

      if (data.success) {
        setTranscription(data.transcription || "");
      } else {
        throw new Error(data.error || "Transcription failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setTranscription(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyTranscription = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
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
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* User Profile Header */}
      <UserProfile />

      {/* Main Content - Your Existing Transcription UI */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Transcription Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload & Record Section */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">
                Record or Upload Audio
              </h2>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Upload Audio File
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  disabled={loading || recording}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-cyan-500 file:to-blue-500 file:text-white hover:file:from-cyan-600 hover:file:to-blue-600 file:cursor-pointer cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Record Button */}
              <RecordButton
                onTranscriptionUpdate={setTranscription}
                loading={loading}
                setLoading={setLoading}
                recording={recording}
                setRecording={setRecording}
              />
            </div>

            {/* Transcription Display */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Transcription</h2>
                {transcription && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyTranscription}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={downloadTranscription}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                  <p className="mt-4 text-gray-400">
                    Transcribing your audio...
                  </p>
                </div>
              )}

              {!loading && transcription && (
                <div className="bg-gray-700 rounded-lg p-6 text-gray-100 whitespace-pre-wrap font-mono text-sm min-h-[200px]">
                  {transcription}
                </div>
              )}

              {!loading && !transcription && (
                <div className="text-center py-12 text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                  <p>Your transcription will appear here.</p>
                  <p className="text-sm mt-2">
                    Upload an audio file or record to get started
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - History */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 sticky top-8">
              <HistoryList
                showAll={showAllHistory}
                onToggleShowAll={() => setShowAllHistory(!showAllHistory)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
