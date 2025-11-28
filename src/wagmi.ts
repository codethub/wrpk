// wagmi.ts
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base } from 'wagmi/chains'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'


const projectId = "e92cd95903697faa0452d626c1b1a673"; // get your project id on reown.com
 
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [base],
  ssr: true,
  connectors: [miniAppConnector()],
});


createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  projectId,
  metadata: {
    name: "Warpunk",
    description: "AI-Fused Farcaster NFT Collection",
    url: "https://warpunk.dev.pages/",
    icons: ["https://warpunk.dev.pages/warpunk.png"],
  },
  features: {
    
  },
  themeMode: "dark",
});

export const config = wagmiAdapter.wagmiConfig;
