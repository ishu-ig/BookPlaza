"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll main viewport
    window.scrollTo(0, 0);

    // If using a custom scroll container
    const content = document.querySelector(".content-area");
    if (content) content.scrollTo(0, 0);

  }, [pathname]);

  return null;
}