import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

// メモリキャッシュオブジェクト
const cache: { data: any, timestamp: number } = { data: null, timestamp: 0 };
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6時間


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { pageId } = req.query;

    if (!pageId || typeof pageId !== 'string') {
        return res.status(400).json({ error: 'Invalid pageId' });
    }

    const currentTime = Date.now();

    // キャッシュが有効か確認
    if (cache.data && (currentTime - cache.timestamp < CACHE_DURATION)) {
        return res.status(200).json({ markdown: cache.data });
    }

    try {
        const mdblocksPromise = n2m.pageToMarkdown(pageId);
        const mdblocks = await mdblocksPromise;
        const mdStringObject = n2m.toMarkdownString(mdblocks);

        // キャッシュに保存
        cache.data = mdStringObject.parent;
        cache.timestamp = currentTime;
        return res.status(200).json({ markdown: cache.data });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch markdown' });
    }
}