import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            background: "#0f172a",
            color: "#e2e8f0",
          }}
        >
          <div style={{ maxWidth: 480 }}>
            <h1 style={{ fontSize: 18, marginBottom: 12 }}>App failed to load</h1>
            <pre
              style={{
                padding: 16,
                background: "#1e293b",
                borderRadius: 8,
                overflow: "auto",
                fontSize: 13,
              }}
            >
              {this.state.error.message}
            </pre>
            <p style={{ marginTop: 12, fontSize: 14 }}>
              Check the browser Console (F12) for more details.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
