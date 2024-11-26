// pages/auth/signin.tsx
import { signIn } from "next-auth/react";
import React from 'react';
import { useRouter } from "next/router";
import DefaultLayout from "@/layouts/default";

const SignIn: React.FC = () => {
    const router = useRouter();

    const handleSignIn = () => {
        signIn("discord", { callbackUrl: "/" }); // Discordでのサインイン
    };

    const handleServerJoin = () => {
        router.push("https://discord.gg/6wpa6ZQVzg"); // Discordサーバーに参加

    };

    return (
        <DefaultLayout>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '64px' }}>
                <h1 style={{ fontSize: '2rem' }}>共創をここから</h1>

                <img
                    src="/aBC-footer.svg" // ここに画像のパスを指定
                    alt="Discord Logo"
                    style={{ height: '400px', width: '800px', borderRadius: '0%', marginBottom: '40px' }}
                />

                <div style={{ display: 'flex', gap: '40px' }}>
                    {/* <button
                        onClick={handleServerJoin}
                        style={{
                            width: '100%',
                            padding: '12px 24px',
                            backgroundColor: '#6200ea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '16px',
                        }}
                    >
                        join our server!!
                    </button> */}

                    <button
                        onClick={handleSignIn}
                        style={{
                            width: '100%',
                            padding: '12px 24px',
                            backgroundColor: '#6200ea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '16px',
                        }}
                    >
                        login with Discord
                    </button>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default SignIn;
