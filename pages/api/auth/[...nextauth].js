// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export default NextAuth({
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: "identify guilds" // 必要なスコープを指定
                },
            },
        }),
    ],
    // pages: {
    //     signIn: "/auth/signin",  // カスタムサインインページのパス
    // },
    callbacks: {
        async session({ session, token }) {
            // 特定のギルドに所属しているかどうかの情報のみセッションに追加
            session.isInTargetGuild = token.isInTargetGuild;
            session.userID = token.userID;
            return session;
        },
        async jwt({ token, account }) {
            if (account) {
                // DiscordのAPIからギルド情報を取得
                const guilds = await fetch("https://discord.com/api/users/@me/guilds", {
                    headers: {
                        Authorization: `Bearer ${account.access_token}`,
                    },
                }).then((res) => res.json());

                const user = await fetch("https://discord.com/api/users/@me", {
                    headers: {
                        Authorization: `Bearer ${account.access_token}`,
                    },
                }).then((res) => res.json());
                console.log('user', user);
                token.userID = user.id;

                // 特定のギルドIDに属しているか確認
                const targetGuildId = "1270650390303473714";
                token.isInTargetGuild = guilds.some(guild => guild.id === targetGuildId);
            }
            return token;
        },
    },
});