
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv/config");

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const RPC_URL = process.env.RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";


module.exports = {
  solidity: "0.8.20",
  networks: {
    base: {
      url: RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 8453, 
    },
  },
  etherscan: {
    apiKey: {
      base: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=8453",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
};