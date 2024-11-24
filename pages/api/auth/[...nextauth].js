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
            session.highestRole = token.highestRole;
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

                if (token.isInTargetGuild) {
                    // 特定のギルドのメンバー情報を取得
                    const member = await fetch(`https://discord.com/api/guilds/${targetGuildId}/members/${user.id}`, {
                        headers: {
                            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                        },
                    }).then((res) => res.json());


                    // 最上位のロールを取得
                    const roles = member.roles;
                    const roleDetails = await Promise.all(roles.map(roleId =>
                        fetch(`https://discord.com/api/guilds/${targetGuildId}/roles/${roleId}`, {
                            headers: {
                                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                            },
                        }).then((res) => res.json())
                    ));
                    const highestRole = roleDetails.sort((a, b) => b.position - a.position)[0];
                    token.highestRole = highestRole;
                }
            }
            return token;
        },
    },
});