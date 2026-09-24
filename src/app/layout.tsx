import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Star Pets Chandigarh | Vet clinic and online appointment booking",
    template: "%s | Star Pets Chandigarh",
  },
  description:
    "Star Pets is a veterinary clinic in Chandigarh for dogs, cats and exotic pets. Book a consultation, vaccination, dental care or surgery appointment online.",
};

export const viewport: Viewport = {
  themeColor: "#12305A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
