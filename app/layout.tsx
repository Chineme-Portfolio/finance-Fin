import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FINBUDDY",
  description: "See what you actually own, in plain words.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Lucide UMD, required by the Icon component (ui-tokens.md §5).
            It defines window.lucide, which Icon polls for. Pinned version. */}
        <script
          src="https://unpkg.com/lucide@0.544.0/dist/umd/lucide.js"
          async
        />
      </body>
    </html>
  );
}
