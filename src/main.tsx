import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import i18n from "./lib/i18n";
import { initSentry } from "./lib/sentry";
import { initNative } from "./lib/native";

initSentry();
initNative();

// Wait for i18n to finish loading before rendering, so translation keys
// (e.g. "running.distance") never appear as raw strings on first paint.
const render = () => createRoot(document.getElementById("root")!).render(<App />);
if (i18n.isInitialized) {
  render();
} else {
  i18n.on("initialized", render);
  // Safety net — render anyway after a short delay so the app never blocks
  setTimeout(() => {
    if (!document.getElementById("root")?.hasChildNodes()) render();
  }, 800);
}

