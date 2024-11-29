import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, name, code } = req.body;

        // Nodemailerの設定
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '登録完了とDiscordサーバー招待URL',
            text: `
            ${name}さん、登録が完了しました。\n
            ようこそaBCDAOへ\n
            Discordサーバー招待URL: https://discord.gg/${code}\n\n
            
            これからサーバー内での体験があなたにとってすばらしいものになることを願っています。\n
            aBCDAO運営チーム一同\n
            ※このメールは自動送信です。返信はできません。
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Email sent successfully' });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Error sending email' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}