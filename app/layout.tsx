import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FINBUDDY spike",
  description: "Plaid read spike. Local only, never deploy.",
};

// Deliberately unstyled. Spec 0001 keeps this page undesigned so it does not
// pre-empt the open design decisions (foundation.md sections 12 Q8 and the
// aesthetic direction in design-handoff.md).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
