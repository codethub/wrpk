// src/abi/NFT.ts
export const NFTAbi = [
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'mintPrice',
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'MAX_SUPPLY', 
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
  stateMutability: 'view',
  type: 'function',
  inputs: [{ name: 'tokenId', type: 'uint256' }],
  name: 'tokenURI',
  outputs: [{ name: '', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'totalMinted',
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    name: 'hasMinted',
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'inputFid', type: 'uint256' },
      { name: 'url', type: 'string' },
      { name: 'signature', type: 'bytes' },
    ],
    name: 'mint',
    outputs: [],
  },
] as const;