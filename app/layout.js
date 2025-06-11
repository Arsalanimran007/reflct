// app/layout.js or app/layout.tsx

import Header from "@/components/header";
import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Reflct",
  description: "A Journaling App",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={inter.className}>
        {/* Background image */}
        <div className="inset-0 bg-[url('/bgc.jpg')] opacity-50 fixed -z-10" />
        <Header />
        {/* Main content */}
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster richColors/>

        <footer className="bg-orange-300/10 py-12 ">
            <div className="container mx-auto px-4 text-center text-gray-900">
              <p>Made with 💗 by Arsalan Imran</p>
            </div>
          </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
