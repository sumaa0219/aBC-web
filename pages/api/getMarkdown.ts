import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

// メモリキャッシュオブジェクト
const cache: { [key: string]: string } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { pageId } = req.query;

    if (!pageId || typeof pageId !== 'string') {
        return res.status(400).json({ error: 'Invalid pageId' });
    }

    // キャッシュに存在するか確認
    if (cache[pageId]) {
        return res.status(200).json({ markdown: cache[pageId] });
    }

    try {
        const mdblocksPromise = n2m.pageToMarkdown(pageId);
        const mdblocks = await mdblocksPromise;
        const mdStringObject = n2m.toMarkdownString(mdblocks);

        // キャッシュに保存
        cache[pageId] = mdStringObject.parent;

        res.status(200).json({ markdown: mdStringObject.parent });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch markdown' });
    }
}