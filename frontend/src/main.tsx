import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Mark when running inside JavaFX WebView (file:// protocol)
if (typeof window !== "undefined" && window.location.protocol === "file:") {
  document.documentElement.setAttribute("data-embed", "javafx");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
