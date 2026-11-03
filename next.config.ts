import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (see Dockerfile).
  // Opt-in via NEXT_OUTPUT=standalone so Vercel builds are unchanged.
  ...(process.env.NEXT_OUTPUT === "standalone"
    ? { output: "standalone" as const }
    : {}),
}

export default nextConfig
