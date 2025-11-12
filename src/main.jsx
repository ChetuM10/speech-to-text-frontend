import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
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
        minHeight: "100vh",
        gap: "1rem",
        color: "var(--text-secondary)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid var(--border-light)",
          borderTopColor: "var(--accent-primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      ></div>
      <p style={{ fontSize: "1rem", fontWeight: 500 }}>Loading interface…</p>
      <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>
        Tip: Press R to toggle recording.
      </p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<Loader />}>
      <App />
    </Suspense>
  </StrictMode>
);
