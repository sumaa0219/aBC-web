import type { AppProps } from "next/app";
import { SessionProvider, useSession } from 'next-auth/react';
import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { fontSans, fontMono } from "@/config/fonts";
import "@/styles/globals.css";

function Auth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isNavigating = useRef(false); // ナビゲーションを制限するためのフラグ

  useEffect(() => {
    if (status === "loading") return; // 読み込み中は何もしない
    if (!session && !isNavigating.current) {
      isNavigating.current = true; // ナビゲーションを開始
      router.push("/auth/signin").finally(() => {
        isNavigating.current = false; // ナビゲーションが完了したらフラグをリセット
      });
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>; // 読み込み中の表示
  }

  return <>{children}</>;
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <NextThemesProvider>
        <NextUIProvider>
          <Auth>
            <Component {...pageProps} />
          </Auth>
        </NextUIProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}