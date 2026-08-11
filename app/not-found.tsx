"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "80px 20px", textAlign: "center" }}>
      <h2>404 — Page Not Found</h2>
      <p>
        <Link href="/" style={{ color: "#A91B18", fontWeight: 600 }}>
          Return to Home
        </Link>
      </p>
    </div>
  );
}
