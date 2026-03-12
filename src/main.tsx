import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";

// Global error handler to catch uncaught errors and display them
window.addEventListener("error", (event) => {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding:40px;font-family:Inter,sans-serif;">
        <h1 style="color:#ff4e00;font-size:24px;margin-bottom:16px;">Runtime Error</h1>
        <pre style="background:#f5f5f5;padding:16px;border-radius:8px;overflow:auto;font-size:14px;color:#333;">${event.message}\n\n${event.filename}:${event.lineno}</pre>
      </div>
    `;
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding:40px;font-family:Inter,sans-serif;">
        <h1 style="color:#ff4e00;font-size:24px;margin-bottom:16px;">Unhandled Promise Rejection</h1>
        <pre style="background:#f5f5f5;padding:16px;border-radius:8px;overflow:auto;font-size:14px;color:#333;">${event.reason}</pre>
      </div>
    `;
  }
});

try {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (err) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding:40px;font-family:Inter,sans-serif;">
        <h1 style="color:#ff4e00;font-size:24px;margin-bottom:16px;">Mount Error</h1>
        <pre style="background:#f5f5f5;padding:16px;border-radius:8px;overflow:auto;font-size:14px;color:#333;">${err}</pre>
      </div>
    `;
  }
}
