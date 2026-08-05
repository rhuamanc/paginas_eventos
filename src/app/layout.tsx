import type { Metadata } from "next";
import { Manrope, Playfair_Display, Dancing_Script, Great_Vibes, Pacifico, Satisfy, Lora } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  weight: "400",
  subsets: ["latin"],
});

const satisfy = Satisfy({
  variable: "--font-satisfy",
  weight: "400",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Huaman Studio",
  description: "Crea invitaciones personalizadas para bodas, cumpleanos y mas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${playfair.variable} ${dancingScript.variable} ${greatVibes.variable} ${pacifico.variable} ${satisfy.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProviderWrapper>
          <TopNav />
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
