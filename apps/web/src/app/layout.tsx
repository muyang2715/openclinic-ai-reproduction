import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://openclinic.site"),
  title: {
    default: "OpenClinic AI｜智能医疗前台",
    template: "%s｜OpenClinic AI",
  },
  description:
    "面向诊所与医院的智能前台，提供预约管理、患者咨询、知识库问答与急症分流。",
  keywords: ["智能医疗前台", "医院预约管理", "医疗语音助手", "患者服务"],
  authors: [{ name: "Hunain Asif", url: "https://github.com/hunainasif" }],
  creator: "Hunain Asif",
  openGraph: {
    type: "website",
    url: "https://openclinic.site",
    siteName: "OpenClinic AI",
    title: "OpenClinic AI — AI Voice Receptionist for Clinics",
    description:
      "An AI voice receptionist that books appointments, answers patient questions, and automates clinic front-desk workflows in real time.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenClinic AI — AI Voice Receptionist for Clinics",
    description:
      "An AI voice receptionist that books appointments, answers patient questions, and automates clinic front-desk workflows in real time.",
    creator: "@hunainasif1503",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
