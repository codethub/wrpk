import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function (req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const IPFS_API_KEY = process.env.IPFS_API_KEY;
    if (!IPFS_API_KEY) {
        return res.status(500).json({ message: 'Server error: IPFS API key not set' });
    }

    try {
        const uploadImg = await fetch("https://upload.lighthouse.storage/api/v0/add", {
            method: "POST",
            headers: { Authorization: `Bearer ${IPFS_API_KEY}` },
            body: req.body,
        });

        if (!uploadImg.ok) {
            const txt = await uploadImg.text();
            throw new Error(`Ipfs API (Image) error: ${txt}`);
        }

        const uploadImgData = await uploadImg.json(); 
        
        return res.status(200).json({ Hash: uploadImgData.Hash });

    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        return res.status(500).json({ message: "Error during IPFS upload", error: message });
    }
}