// solana.ts
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";

const solanaWeb3JsAdapter = new SolanaAdapter();

const projectId = "e92cd95903697faa0452d626c1b1a673"; // get your project id on reown.com dashboard
 
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [solana, solanaTestnet, solanaDevnet],
  ssr: true,
  connectors: [],
});


createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  projectId,
  metadata: {
    name: "Warpunk",
    description: "AI-Fused Farcaster NFT Collection",
    url: "https://warpunk.dev.pages/",
    icons: ["https://warpunk.dev.pages/warpunk.png"],
  },
  themeMode: "dark",
});

export const config = wagmiAdapter.wagmiConfig;
