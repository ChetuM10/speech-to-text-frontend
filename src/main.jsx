import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// Lazy-load the main app for faster initial paint
const App = lazy(() => import("./App.jsx"));

// Full-screen loader styled to match chat console
function Loader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
        color: "#00d9ff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "2.5rem",
          marginBottom: "1rem",
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        🎤
      </div>
      <div style={{ fontSize: "1.25rem", fontWeight: "600" }}>
        Loading interface…
      </div>
      <div
        style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.5rem" }}
      >
        Initializing authentication...
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loader />}>
          <App />
        </Suspense>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
