import { Box, CheckCircle, Wallet, Coins, XCircle, Users } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';
import { DropAbi } from '../abi/DROP';

const AIRDROP_CONTRACT_ADDRESS: Address = "0x36238691178d30EDC3791a817eB34E1807058959"; 
const CHAIN_ID = 8453;
const TOTAL_AIRDROP_SUPPLY = "30,000,000,000";

export default function Airdrop() {
    const { isConnected, chainId } = useAccount();

    const { data: currentFeeWei } = useReadContract({
        abi: DropAbi,
        address: AIRDROP_CONTRACT_ADDRESS,
        functionName: 'claimFee',
        chainId: CHAIN_ID,
        query: { enabled: isConnected && chainId === CHAIN_ID }
    });

    const { data: hash, writeContract, isPending: isClaimPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isClaimError } = 
        useWaitForTransactionReceipt({ hash });

    const handleClaim = () => {
        if (!currentFeeWei) return;

        writeContract({
            abi: DropAbi,
            address: AIRDROP_CONTRACT_ADDRESS,
            functionName: 'claim',
            value: currentFeeWei, 
            chainId: CHAIN_ID,
        });
    };
    
    const isChainCorrect = chainId === CHAIN_ID;
    
    const claimDisabled = 
        !isConnected || 
        !isChainCorrect || 
        isClaimPending || 
        isConfirming ||
        isConfirmed;

    const getButtonText = () => {
        if (!isConnected) return "Connect Wallet to Start";
        if (!isChainCorrect) return `Switch to Chain ID ${CHAIN_ID}`;
        if (isClaimPending) return "Awaiting Wallet Confirmation...";
        if (isConfirming) return "Transaction Processing...";
        if (isConfirmed) return "Claim Successful!";
        return `Claim 1,000,000 WPRK`;
    };

    return (
        <main className="flex-1 w-full flex flex-col items-center justify-center p-4 md:p-10 py-20">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <div className="relative p-8 bg-slate-900 ring-1 ring-slate-700/50 rounded-2xl flex items-center justify-center">
                    <Box className="w-16 h-16 text-cyan-400 opacity-80" />
                    <div className="absolute -bottom-2 -right-2 bg-slate-950 p-1.5 rounded-full border border-slate-700">
                        <Coins className="w-6 h-6 text-yellow-500" />
                    </div>
                </div>
            </div>

            <div className="mt-10 text-center space-y-4 max-w-lg">
                <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-400">
                    WPRK Airdrop Program
                </h2>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-xs font-mono text-slate-400 uppercase tracking-widest">
                    <span className="relative flex h-2 w-2">
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected && isChainCorrect ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </span>
                    {isConnected && isChainCorrect ? 'Network Ready' : 'Network Mismatch'}
                </div>

                <div className="pt-4 space-y-3 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center text-slate-300">
                        <div className="flex items-center gap-2">
                            <Users size={18} className="text-pink-400" />
                            <span className="font-semibold">Total Airdrop Supply</span>
                        </div>
                        <span className="text-lg font-mono text-pink-400">{TOTAL_AIRDROP_SUPPLY} WPRK</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-400" />
                            <span className="font-semibold">Token Reward per Wallet</span>
                        </div>
                        <span className="text-lg font-mono text-cyan-400">1,000,000 WPRK</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-slate-500 text-sm italic pt-2">
                        <div className="flex items-center gap-2">
                            <Wallet size={16} className="text-slate-500" />
                            <span>*A minimal Network Gas Fee is required for the transaction.</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-slate-300 pt-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-blue-500" />
                            <span className="font-semibold">Claim Limit</span>
                        </div>
                        <span className={`text-lg font-mono text-blue-400`}>
                            One per Wallet
                        </span>
                    </div>
                    
                    <p className="text-slate-500 text-sm italic pt-2">
                        Each wallet is restricted to a single claim transaction.
                    </p>
                </div>
                
                <button
                    onClick={handleClaim}
                    disabled={claimDisabled}
                    className={`
                        mt-6 w-full py-3 px-6 rounded-lg text-lg font-bold transition-all duration-300 
                        ${claimDisabled
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/50 animate-pulse-once'
                        }
                    `}
                >
                    {getButtonText()}
                </button>

                {(isConfirmed || isClaimError || isClaimPending || isConfirming) && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm 
                        ${isConfirmed ? 'bg-green-900/50 text-green-400 border border-green-700' : 
                          isClaimError ? 'bg-red-900/50 text-red-400 border border-red-700' : 
                          'bg-blue-900/50 text-blue-400 border border-blue-700'}`}>
                        
                        {isConfirmed && (<><CheckCircle size={18} /><span>Success! Your 1M WPRK tokens have been transferred.</span></>)}
                        {isClaimError && (<><XCircle size={18} /><span>Claim failed. Check transaction status. If already claimed, the transaction will revert.</span></>)}
                        {isClaimPending && !isClaimError && !isConfirmed && <span>Waiting for wallet signature...</span>}
                        {isConfirming && !isClaimError && !isConfirmed && <span>Transaction sent, confirming on blockchain...</span>}
                    </div>
                )}
            </div>
        </main>
    );
}