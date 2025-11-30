// api/getGeneratedData.ts

import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

interface CachedGenData {
  imageIpfsUrl: string;
}

export default async function (req: VercelRequest, res: VercelResponse) {
  const fid = req.query.fid as string;

  if (!fid) {
    return res.status(400).json({ message: "Missing fid" });
  }

  const cacheKey = `gen_data:${fid}`;

  try {
    // Replace env.RATE_LIMIT_KV.get(cacheKey) with kv.get(cacheKey)
    const cachedData = await kv.get(cacheKey);

    if (cachedData) {
      // Data from kv.get is usually string or JSON object depending on how it was stored
      const data = cachedData as CachedGenData;
      return res.status(200).json({ url: data.imageIpfsUrl });
    } else {
      return res.status(404).json({ message: "Not found" });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error fetching cache:", err);
    return res.status(500).json({ message: "Error fetching cache", error: message });
  }
}