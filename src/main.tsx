import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n";
import { initSentry } from "./lib/sentry";
import { initNative } from "./lib/native";

initSentry();
initNative();

createRoot(document.getElementById("root")!).render(<App />);

