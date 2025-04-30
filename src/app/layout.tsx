import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/providers/user-provider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/theme-provider";

const poppins = Be_Vietnam_Pro({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meting booking",
  description: "Powered by Next.js, TypeScript, Tailwind CSS, and Vercel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className}  antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>{children}</UserProvider>
        </ThemeProvider>
        <Toaster richColors position="top-center" duration={5000} closeButton />
      </body>
    </html>
  );
}
