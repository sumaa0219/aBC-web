import type { AppProps } from "next/app";
import { SessionProvider, useSession } from 'next-auth/react';
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useTheme } from 'next-themes';
import { fontSans, fontMono } from "@/config/fonts";
import "@/styles/globals.css";
import { ReactNode } from 'react';


interface ThemedComponentProps {
  children: ReactNode;
}

function Auth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isNavigating = useRef(false); // ナビゲーションを制限するためのフラグ

  useEffect(() => {
    if (status === "loading") return; // 読み込み中は何もしない
    if (!session && !isNavigating.current && router.pathname !== '/join') {
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
        <HeroUIProvider>
          <Auth>
            <ThemedComponent>
              <Component {...pageProps} />
            </ThemedComponent>
          </Auth>
        </HeroUIProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}
const ThemedComponent: React.FC<ThemedComponentProps> = ({ children }) => {
  const { resolvedTheme } = useTheme();

  const styledTheme = {
    colors: {
      text: resolvedTheme === 'dark' ? '#ffffff' : '#000000', // テーマに応じた色を設定
    },
  };

  return <StyledThemeProvider theme={styledTheme}>{children}</StyledThemeProvider>;
};