"use client";

import { useEffect } from "react";

/** Keeps existing MESH download bookmarks pointed at the dedicated page. */
export function MeshDownloadsRedirect() {
  useEffect(() => {
    if (window.location.hash === "#mesh-downloads") {
      window.location.replace("/mesh");
    }
  }, []);

  return null;
}
