
# 🔥 WARPUNK — AI-Fused Farcaster NFT Collection

Transform your Farcaster PFP into a next‑generation **AI-generated Warpunk**, then mint it as an NFT on Base.

<div align="center">
  <img src="public/warpunk.png" width="220" />
  <br/>
  <strong>Genesis Collection • 2000 Supply • Powered by AI + On-chain Identity</strong>
</div>

---

## ⚡ Overview

**WARPUNK** is a futuristic Farcaster MiniApp that allows users to:

- 🧬 Fetch their Farcaster PFP  
- 🤖 Fuse it through AI → produce a Warpunk visual  
- 🪙 Mint the final artwork as an on-chain NFT on Base  

This repository contains the full MiniApp frontend built with:

- ⚛️ React + TypeScript  
- 🌀 TailwindCSS  
- 🟣 Wagmi + Viem  
- ⚡ Farcaster MiniApp SDK  
- 🚀 Vite  
- 👛 Reown Appkit

Contract ABI: **`abi/warpunk.sol`**  
Generated ABI for frontend: **`abi/NFT.ts`**

---

## ✨ Features

### 🔗 Farcaster Integration
- Automatic FID, PFP, username fetch  
- Farcaster cast sharing after mint  

### 🤖 AI Fusion Engine
- Custom Warpunk generation based on the user PFP  
- Signature-based mint protection system  

### 🪙 On-Chain Minting
- Reads mint price, supply, minted count  
- Prevents double minting  
- IPFS image support  
- Base64‑encoded on-chain metadata  

### 💎 Genesis NFT Details
- **Name:** The Warpunk  
- **Ticker:** WRPK  
- **Max Supply:** 2000 NFTs  

---

## 🧩 Project Structure

```
 ├── api/
 │   ├── Cache.ts
 │   ├── Farcaster.ts
 │   └── Warpunk.ts
src/
 ├── components/
 │    ├── Layout.tsx
 │    ├── About.tsx
 │    └── Mint.tsx
 ├── abi/
 │    ├── warpunk.sol
 │    └── NFT.ts      # Parsed ABI here
 ├── public/
 │    └── warpunk.png
 ├── App.tsx
 └── main.tsx
```

---

## 🛠️ Installation

### 1️⃣ Clone the repo
```bash
git clone https://github.com/codethub/wrpk.git
cd wrpk
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Run development server
```bash
npm run dev
```

### 4️⃣ Build production bundle
```bash
npm run build
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```
NEYNAR_API_KEY=...
SERVER_PRIVATE_KEY=0x..
REPLICATE_API_TOKEN=...
IPFS_API_KEY=...
```

---

## 🧪 API Endpoints

| Route | Purpose |
|-------|---------|
| `/api/Farcaster` | Fetch user FID + PFP |
| `/api/Cache` | Get cached Warpunk image |
| `/api/Warpunk` | Generate AI art + backend signature |

---

## 📜 Smart Contract

- Located at: `abi/warpunk.sol`
- Base network  
- Deployment address used in frontend example:  
  `0x690eE1D87A6117468cC9bE7d075CeB17Aef939a9`

---

## 🚀 Deploying the Contract

### ▶ Remix
1. Open Remix  
2. Upload `warpunk.sol`  
3. Compile & Deploy to Base  
4. Verify contract

### ▶ Hardhat
```bash
npx hardhat run scripts/deploy.js --network base
```

Example `deploy.js`:
```js
const hre = require("hardhat");

async function main() {
  const Warpunk = await hre.ethers.deployContract("WARPUNK");
  await Warpunk.waitForDeployment();
  console.log("Deployed at:", await Warpunk.getAddress());
}

main();
```

---

## 🧭 Flow

1. User connects wallet  
2. System fetches Farcaster PFP  
3. User generates Warpunk (AI)  
4. Preview displayed  
5. User mints on Base  
6. Option to share on Farcaster  

---

## 🛡️ Security

- Backend signatures prevent unauthorized minting  
- Double-mint protection via contract  
- Validates FID + wallet match  

---

## 🤝 Contributing

PRs are welcome!  
Open an issue for feature requests or bugs.

---

## 🧟 Credits

Built by **tose** & Warpunk contributors. 
Cyberpunk x Farcaster inspired project.

[Farcaster](https://farcaster.xyz/tose)
[Github](https://github.com/codethub)

