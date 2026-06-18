import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import "./styles/globals.css";

declare const __SERVER_START__: string;
const buildKey = "derma_build_ts";
if (localStorage.getItem(buildKey) !== __SERVER_START__) {
  ["derma_consult_konsile", "derma_consult_patients", "derma_consult_summaries",
   "derma_consult_data_requests", "derma_consult_invites", "derma_consult_patient_users"]
    .forEach((k) => localStorage.removeItem(k));
  // also clear any expert assessment drafts
  Object.keys(localStorage)
    .filter((k) => k.startsWith("derma_consult_draft_"))
    .forEach((k) => localStorage.removeItem(k));
  localStorage.setItem(buildKey, __SERVER_START__);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
