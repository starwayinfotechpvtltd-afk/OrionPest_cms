// components/ScriptLoader.jsx
"use client";
import Script from "next/script";
import { useState } from "react";

export default function ScriptLoader() {
  const [jqueryLoaded, setJqueryLoaded] = useState(false);
  const [bootstrapLoaded, setBootstrapLoaded] = useState(false);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"
        strategy="afterInteractive"
        onLoad={() => setJqueryLoaded(true)}
      />
      {jqueryLoaded && (
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
          onLoad={() => setBootstrapLoaded(true)}
        />
      )}
      {bootstrapLoaded && (
        <Script
          src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-bs5.min.js"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
