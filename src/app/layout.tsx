import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import gitInfo from "../../generated_git_info.json"

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Convert Shopify CSV to Drop & Go Format",
  description: "This tool for seamlessly converting Shopify order CSV files to the Drop & Go CSV format. Our intuitive platform simplifies the process of transitioning your Shopify order data into a format compatible with Drop & Go services, saving you time and effort. ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
                window.about = {
                  hash: '${gitInfo.gitCommitHash}'
                };
              `,
          }}
        />
      </body>
    </html>
  );
}
