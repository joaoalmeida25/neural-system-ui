import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "neural-system-ui/style.css";

import { App } from "./app/app.component";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
