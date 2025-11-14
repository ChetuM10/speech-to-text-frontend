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
        minHeight: "100vh",
        gap: "1rem",
        color: "var(--text-secondary)",
        backgroundColor: "var(--bg-primary, #111827)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid var(--border-light, #374151)",
          borderTopColor: "var(--accent-primary, #06b6d4)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      ></div>
      <p style={{ fontSize: "1rem", fontWeight: 500 }}>Loading interface…</p>
      <p
        style={{ fontSize: "0.875rem", color: "var(--text-tertiary, #6b7280)" }}
      >
        Initializing authentication...
      </p>
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
        {/* Toast notifications for auth feedback */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--bg-secondary, #1f2937)",
              color: "var(--text-primary, #fff)",
              border: "1px solid var(--border-light, #374151)",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: {
                primary: "var(--accent-success, #10b981)",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--accent-danger, #ef4444)",
                secondary: "#fff",
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
