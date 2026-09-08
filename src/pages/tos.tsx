import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/components/core/ThemeProvider";
import { ErrorBoundary } from "@/components/core/ErrorBoundary";
import TermsPage from "@/pages/TermsPage";
import "@/globals.css";
const rootElement = document.getElementById("root");
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <TermsPage />
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>);
}
