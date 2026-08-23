"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function PreviewIsolator() {
  const searchParams = useSearchParams();
  const [editorMode, setEditorMode] = useState<string | null>(null);

  useEffect(() => {
    const mode = searchParams.get("editor");
    if (mode) {
      setEditorMode(mode);
      
      // Inject CSS to hide everything except the requested section
      const style = document.createElement("style");
      
      if (mode === "footer") {
        style.innerHTML = `
          /* Hide everything except the footer component */
          body > *:not(#ys-footer):not(script):not(style) { display: none !important; }
          
          /* Make the footer fill the screen and be scrollable */
          #ys-footer {
            height: 100vh !important;
            overflow-y: auto !important;
            margin: 0 !important;
          }
          body {
            overflow: hidden !important;
            background: #181818 !important;
          }
        `;
      } else if (mode === "header") {
        style.innerHTML = `
          /* Hide everything except the header component */
          body > *:not(#ys-header):not(script):not(style) { display: none !important; }
          
          /* Make the header fill the screen and be scrollable if needed */
          #ys-header {
            height: 100vh !important;
            overflow-y: auto !important;
            margin: 0 !important;
          }
          body {
            overflow: hidden !important;
            background: #050505 !important;
          }
        `;
      }
      
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [searchParams]);

  return null;
}
