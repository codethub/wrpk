import { VercelRequest, VercelResponse } from '@vercel/node';
import { Ratelimit } from '@upstash/ratelimit'; 
import { kv } from '@vercel/kv';
import {
  createWalletClient,
  http,
  PrivateKeyAccount,
  keccak256,
  encodePacked,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

interface LighthouseResponse {
  Name: string;
  Hash: string;
  Size: string;
}

const BASE_CHARACTER_URL = "https://warpunk.vercel.app/warpunk.png";
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;
const RATELIMIT_WINDOW = '5s';
const RATELIMIT_COUNT = 1;

type ReplicateStatusResponse = {
  status?: "starting" | "processing" | "succeeded" | "failed" | string;
  output?: string[] | string;
  error?: string;
};

function getWalletClient() {
  const privateKey = process.env.SERVER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) throw new Error("SERVER_PRIVATE_KEY not set");

  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain: base,
    transport: http(),
  });
}

interface CachedGenData {
  imageIpfsUrl: string;
}

export default async function (req: VercelRequest, res: VercelResponse) {
  const { userAddress, pfpUrl, fid, username } = req.body as {
    userAddress: `0x${string}`;
    pfpUrl: string;
    fid: number;
    username: string;
  };

  if (!userAddress || !pfpUrl || !fid || !username) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const cacheKey = `gen_data:${fid}`;
  
  try {
    // 1. RATE LIMITING using Vercel KV with type assertion
    const ratelimit = new Ratelimit({
      // FIX: Cast kv to 'any' to satisfy Ratelimit type checking.
      // The VercelKV object implements the required methods at runtime.
      redis: kv as any, 
      limiter: Ratelimit.fixedWindow(RATELIMIT_COUNT, RATELIMIT_WINDOW),
      prefix: "ratelimit_nft",
    });

    const { success, reset } = await ratelimit.limit(fid.toString());

    if (!success) {
        const timeRemaining = Math.ceil((reset - Date.now()) / 1000);
        return res.status(429).json({ message: `Rate limit exceeded. Try again in ${timeRemaining} seconds.` });
    }

    // 2. CACHE CHECK using Vercel KV
    const cachedData = await kv.get(cacheKey);

    if (cachedData) {
        const data = cachedData as CachedGenData;
        
        // Skip AI generation and signing if data is cached.
        return res.status(200).json({ 
          url: data.imageIpfsUrl,
          signature: "0x0", // Placeholder if signature is not cached
          cached: true
        });
    }

    // --- Start Generation Process (If not cached) ---

    // Generate prompt (using existing logic)
    const aiPrompt = `A warpunk style fusion of a character with a Warpunk helmet and the following profile picture: ${pfpUrl}. The final image should be a blend of the warpunk aesthetic and the user's pfp details.`; 

    // 3. AI Generation
    const modelUrl = "https://api.replicate.com/v1/models/google/nano-banana/predictions";

    const createResp = await fetch(modelUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: {
          prompt: aiPrompt,
          aspect_ratio: "1:1",
          image_input: [BASE_CHARACTER_URL, pfpUrl]
        },
      }),
    });

    if (!createResp.ok) {
        const txt = await createResp.text();
        throw new Error(`Replicate API (Creation) error: ${txt}`);
    }

    const data = (await createResp.json()) as ReplicateStatusResponse;
    const outputUrl = Array.isArray(data.output) ? data.output[0] : data.output as string;
    
    if (!outputUrl) {
        throw new Error("Replicate output URL is missing.");
    }

    const generatedResp = await fetch(outputUrl);
    if (!generatedResp.ok) throw new Error("Failed to download generated image");
    const generatedBlob = await generatedResp.blob();

    // 4. Upload to IPFS
    const formDataImg = new FormData();
    formDataImg.append("file", generatedBlob, `Warpunk ${fid}.png`);

    const uploadImg = await fetch("https://upload.lighthouse.storage/api/v0/add", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.IPFS_API_KEY}` },
      body: formDataImg,
    });

    if (!uploadImg.ok) {
        const txt = await uploadImg.text();
        throw new Error(`Ipfs API (Image) error: ${txt}`);
    }

    const uploadImgData = (await uploadImg.json()) as LighthouseResponse;
    const imageIpfsUrl = `ipfs://${uploadImgData.Hash}`;

    // 5. Sign Message
    const walletClient = getWalletClient();
    const account = walletClient.account as PrivateKeyAccount;
    const tokenSymbol = "WRPK";

    const messageHash = keccak256(
      encodePacked(
        ["address", "string", "uint256", "string"],
        [userAddress, tokenSymbol, BigInt(fid), imageIpfsUrl]
      )
    );

    const signature = await walletClient.signMessage({
      account,
      message: { raw: messageHash },
    });
    
    // 6. CACHE WRITE using Vercel KV
    const cacheValue: CachedGenData = { imageIpfsUrl };
    await kv.set(cacheKey, cacheValue, { ex: SEVEN_DAYS_IN_SECONDS });

    // 7. Send Response
    return res.status(200).json({
      url: imageIpfsUrl,
      signature,
      cached: false
    });

  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message: "Error during generation", error: message });
  }
}