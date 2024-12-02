// pages/auth/signin.tsx
import { signIn } from "next-auth/react";
import React from 'react';
import { useRouter } from "next/router";
import DefaultLayout from "@/layouts/default";
import { Button } from "@nextui-org/react";
import { DiscordIcon } from "@/components/icons";
const SignIn: React.FC = () => {
    const router = useRouter();

    const handleSignIn = () => {
        signIn("discord", { callbackUrl: "/" }); // Discordでのサインイン
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

                    <Button
                        onClick={handleSignIn}
                        radius="full"
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
                        startContent={<DiscordIcon size={20} />}
                    >
                        login with Discord
                    </Button>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default SignIn;
