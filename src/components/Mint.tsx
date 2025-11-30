import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { BaseError, formatEther } from 'viem';
import { sdk } from "@farcaster/miniapp-sdk";
import { NFTAbi } from '../abi/NFT';

const CONTRACT_ADDRESS = '0x690eE1D87A6117468cC9bE7d075CeB17Aef939a9' as `0x${string}`;

interface FarcasterProfile {
  fid: number;
  username: string;
  pfpUrl: string;
}
interface GenerateResponse {
  url: string;
  signature: `0x${string}`;
}

const ipfsToHttps = (url: string) => {
  if (!url || !url.startsWith('ipfs://')) return url;
  const hash = url.substring(7);
  return `https://ipfs.io/ipfs/${hash}`;
};


const decodeTokenURI = (uri: string): { image: string, name: string } | null => {
    if (!uri.startsWith('data:application/json;base64,')) return null;
    try {
        const base64Data = uri.substring('data:application/json;base64,'.length);
        const jsonString = atob(base64Data);
        const metadata = JSON.parse(jsonString);
        return {
            image: metadata.image,
            name: metadata.name
        };
    } catch (e) {
        console.error("Failed to decode token URI:", e);
        return null;
    }
};

function PlaceholderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export default function Mint() {
  const { address, isConnected } = useAccount();

  const { data: hash, writeContract, isPending: isMinting, error: mintError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [profile, setProfile] = useState<FarcasterProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | undefined>(undefined);
  const [uiError, setUiError] = useState<string | null>(null);

  const [signature, setSignature] = useState<`0x${string}` | null>(null);
  const [urlToMint, setUrlToMint] = useState<string | null>(null);

  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isLoadingCache, setIsLoadingCache] = useState(false);

  const { data: mintPriceData = BigInt(0), isLoading: isLoadingMintPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFTAbi,
    functionName: 'mintPrice',
    query: { enabled: true }
  });
  
  const { data: totalMintedData = BigInt(0), isLoading: isLoadingTotalMinted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFTAbi,
    functionName: 'totalMinted',
    query: { enabled: true }
  });

  const { data: maxSupplyData = BigInt(2000), isLoading: isLoadingMaxSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFTAbi,
    functionName: 'MAX_SUPPLY',
    query: { enabled: true }
  });

  const { data: mintedTokenId = BigInt(0), isLoading: isLoadingMintedStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFTAbi,
    functionName: 'hasMinted',
    args: [address as `0x${string}`],
    query: { enabled: isConnected && !!address }
  });

  const { data: tokenURIData, isLoading: isLoadingTokenURI } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFTAbi,
    functionName: 'tokenURI',
    args: [mintedTokenId],
    query: { enabled: !!mintedTokenId && mintedTokenId > BigInt(0) }
  });

  const hasMinted = useMemo(() => mintedTokenId > BigInt(0), [mintedTokenId]);
  
  const isLoading = isLoadingProfile || isLoadingCache || isLoadingMintPrice || isLoadingTotalMinted || isLoadingMaxSupply || isLoadingMintedStatus || isLoadingTokenURI; 

  const mintPrice = useMemo(() => mintPriceData as bigint, [mintPriceData]);
  const formattedMintPrice = useMemo(() => formatEther(mintPrice), [mintPrice]);
  const isFreeMint = useMemo(() => mintPrice === BigInt(0), [mintPrice]);
  const isWarpunkReady = useMemo(() => !!generatedImage, [generatedImage]); 

  const refetchBalance = useCallback(() => console.log('Balance refetch bypassed.'), []);

  useEffect(() => {
    sdk.actions
      .ready()
      .then(() => console.log("SDK ready "))
      .catch((e) => console.warn("SDK ready check error in Mint", e));
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      setIsLoadingProfile(true);
      setProfile(null);
      setUiError(null);
      setSignature(null);
      setUrlToMint(null);
      setCachedUrl(null);
      refetchBalance();

      fetch(`/api/Farcaster?address=${address}`)
        .then(res => {
          if (!res.ok) throw new Error(`Farcaster profile not found`);
          return res.json();
        })
        .then((data: FarcasterProfile) => {
          setProfile(data);
        })
        .catch(err => setUiError((err as Error).message))
        .finally(() => setIsLoadingProfile(false));
    }
  }, [address, isConnected, refetchBalance]);

  
  useEffect(() => {
    if (hasMinted && tokenURIData) {
      setIsLoadingCache(true);
      setUiError(null);
      setSignature(null);
      setUrlToMint(null);
      
      try {
        const decoded = decodeTokenURI(tokenURIData);
        if (decoded && decoded.image) {
          setCachedUrl(decoded.image);
          setGeneratedImage(ipfsToHttps(decoded.image));
          setUiError("");
        } else {
          setUiError("Token Minted, but failed to decode image URI.");
        }
      } catch (err) {
        console.error("Token URI processing error:", err);
        setUiError("Token Minted, but an error occurred while loading image.");
      } finally {
        setIsLoadingCache(false);
      }
    }
  }, [hasMinted, tokenURIData]);
  
  useEffect(() => {
    if (profile && !hasMinted && !tokenURIData) {
      setIsLoadingCache(true);
      setGeneratedImage(undefined);
      
      fetch(`/api/Cache?fid=${profile.fid}`)
        .then(async (res) => {
          if (res.ok) {
            const data: { url: string } = await res.json();
            setCachedUrl(data.url);
            setGeneratedImage(ipfsToHttps(data.url));
            setUiError(""); 
          } else {
             setGeneratedImage(undefined);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingCache(false));
    }
  }, [profile, hasMinted, tokenURIData]);
  


  const handleGenerate = async () => {
    if (!profile || !address) return;

    if (hasMinted) {
      setUiError("You have already minted.");
      return;
    }

    if (cachedUrl) {
      setUiError("");
      return;
    }

    setIsGenerating(true);
    setUiError(null);
    setGeneratedImage(undefined);
    setSignature(null);
    setUrlToMint(null);

    try {
      const response = await fetch('/api/Warpunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          pfpUrl: profile.pfpUrl,
          fid: profile.fid,
          username: profile.username,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to generate');
      }

      const data: GenerateResponse = await response.json();
      setSignature(data.signature);
      setUrlToMint(data.url);
      setGeneratedImage(ipfsToHttps(data.url));
      setUiError(null); 

    } catch (err: any) {
      setUiError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMint = () => {
    if (!signature || !urlToMint || !profile) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: NFTAbi,
      functionName: 'mint',
      args: [
        BigInt(profile.fid),
        urlToMint,
        signature,
      ],
      value: mintPrice as bigint,
    });
  };

  const handleMintCached = async () => {
    if (!cachedUrl || !profile || !address) return;

    setIsGenerating(true);
    setUiError(null);

    try {
      const response = await fetch('/api/Warpunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          pfpUrl: profile.pfpUrl,
          fid: profile.fid,
          username: profile.username,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to prepare mint');
      }

      const data: GenerateResponse = await response.json();

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: NFTAbi,
        functionName: 'mint',
        args: [
          BigInt(profile.fid),
          data.url,
          data.signature,
        ],
        value: mintPrice as bigint,
      });

    } catch (err: any) {
      setUiError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (!generatedImage || !profile) {
      setUiError("Cannot share, image or profile not loaded.");
      return;
    }

    const appUrl = "https://farcaster.xyz/miniapps/6JbiYn6lRC_7/warpunk";
    const text = `I just generated my Warpunk by @tose and minted it into NFT. Let's generate your PFP and get a unique collection from Warpunk, limited to 2000 supplies.`;

    sdk.actions.composeCast({
      text: text,
      embeds: [
        appUrl,
        generatedImage
      ],
    });
  };
  
  const mintButtonText = useMemo(() => {
    if (isMinting) return "Check Wallet...";
    if (isConfirming) return "Minting...";
    if (isFreeMint) return "Free Mint";
    return `Mint NFT (${formattedMintPrice} HYPE)`;
  }, [isMinting, isConfirming, isFreeMint, formattedMintPrice]);

  return (
    <main className="flex-1 w-full flex flex-col items-center p-4 md:p-10 py-10 pt-20 pb-20">

      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-400 drop-shadow-[0_2px_0_rgba(34,213,238,0.8)]">
          MINT WARPUNK
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-sm mx-auto">
          Merge your Farcaster PFP through the Warpunk AI & Mint to NFT.
        </p>
      </div>

      <div className="flex items-center justify-center mb-6 px-6 py-3 bg-slate-800/70 border border-cyan-500/30 rounded-lg shadow-lg text-lg font-bold text-cyan-300">
          {totalMintedData.toString()} / {maxSupplyData.toString()} MINTED
      </div>

      <div className="relative flex flex-col items-center p-6 md:p-8 bg-slate-900/70 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        
        {!isConnected ? (
          <div className="py-10">
            <p className="text-xl text-yellow-400">Please connect your wallet to start.</p>
          </div>
        ) : (
          <div className="w-full text-center">

            {profile && (
              <div className="mb-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-center gap-4 shadow-inner">
                <img 
                  src={profile.pfpUrl} 
                  alt="PFP" 
                  className="w-12 h-12 rounded-full border-2 border-cyan-400 object-cover" 
                />
                <p className="text-xl font-extrabold text-white tracking-widest uppercase">
                  @{profile.username}
                </p>
              </div>
            )}
            
            {isLoading && !hasMinted && (
              <p className="animate-pulse text-slate-400 mb-6">Loading Your Warpunk Status...</p>
            )}

            {profile && !isLoading && !isWarpunkReady && !isGenerating && !hasMinted && (
                <button
                  onClick={handleGenerate}
                  className="w-full px-6 py-4 text-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] text-white flex items-center justify-center gap-2"
                >
                  Generate Warpunk
                </button>
            )}

            {(isWarpunkReady || isGenerating || hasMinted) && (
              <div className="w-full text-center">
                
                <div className="w-full aspect-square bg-slate-800/50 rounded-xl mb-6 relative overflow-hidden flex items-center justify-center transition-all duration-300 border border-slate-700">

                  {(isGenerating || isLoadingCache || (hasMinted && isLoadingTokenURI)) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10 backdrop-blur-sm">
                      <LoadingSpinner />
                      <p className="text-lg text-cyan-300 font-semibold mt-4 animate-pulse">
                        {isGenerating ? "Generating your Warpunk..." : "Loading NFT Metadata..."}
                      </p>
                      {isGenerating && <p className="text-sm text-slate-400">(This can take up to 30 seconds)</p>}
                    </div>
                  )}

                  {generatedImage ? (
                    <img src={generatedImage} alt="Generated AI" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 opacity-50">
                      <PlaceholderIcon />
                      <p className="text-lg font-medium mt-2">Your image will appear here</p>
                    </div>
                  )}
                </div>

                {profile && !isLoading && (
                  <div className="w-full">
                    
                    {(isConfirmed || hasMinted) && (
                      <div className="p-4 bg-green-900/50 rounded-lg text-center border border-green-700 shadow-xl mb-4">
                        <h3 className="text-xl mb-2 font-bold text-green-300">
                          {isConfirmed ? "Mint Successful! 🥳" : "Minted! 🏆"}
                        </h3>
                        {hash && (
                          <a href={`https://basescan.org/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline text-sm text-slate-300 hover:text-white">
                            View Transaction
                          </a>
                        )}
                        <button
                          onClick={handleShare}
                          className="w-full px-6 py-3 mt-4 text-lg bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-200 shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                        >
                          Share on Farcaster
                        </button>
                      </div>
                    )}
                    
                    {(signature || cachedUrl) && !isConfirmed && !hasMinted && (
                      <>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-left shadow-lg">
                            <p className="text-xs font-bold uppercase text-slate-400 mb-1">MINT PRICE</p>
                            <p className="text-xl font-black text-cyan-300">
                              {isFreeMint ? 'FREE' : `${formattedMintPrice} HYPE`}
                            </p>
                          </div>
                          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-left shadow-lg relative">
                            <p className="text-xs font-bold uppercase text-slate-400 mb-1">SUPPLY</p>
                            <p className="text-xl font-black text-cyan-300">
                              {totalMintedData.toString()}/{maxSupplyData.toString()}
                            </p>
                            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                              <div 
                                className="bg-cyan-400 h-2 rounded-full" 
                                style={{ width: `${(Number(totalMintedData) / Number(maxSupplyData) * 100).toFixed(2)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {(Number(totalMintedData) / Number(maxSupplyData) * 100).toFixed(1)}% MINTED
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={signature ? handleMint : handleMintCached}
                          disabled={isMinting || isConfirming || isGenerating}
                          className="w-full px-6 py-4 mt-6 text-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] text-white flex items-center justify-center gap-2"
                        >
                          {(isMinting || isConfirming || isGenerating) ? <LoadingSpinner /> : null} {mintButtonText}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {uiError && <p className="mt-4 p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-lg shadow-inner">{uiError}</p>}

            {mintError && (
              <p className="mt-4 p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-lg shadow-inner">
                Mint Error: {
                  (mintError instanceof BaseError)
                    ? mintError.shortMessage
                    : mintError.message
                }
              </p>
            )}

          </div>
        )}
      </div>
    </main>
  );
}