import { Box, Lock, Timer } from 'lucide-react';

export default function Airdrop() {
  return (
    <main className="flex-1 w-full flex flex-col items-center justify-center p-4 md:p-10 py-20">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <div className="relative p-8 bg-slate-900 ring-1 ring-slate-700/50 rounded-2xl flex items-center justify-center">
          <Box className="w-16 h-16 text-cyan-400 opacity-80" />
          <div className="absolute -bottom-2 -right-2 bg-slate-950 p-1.5 rounded-full border border-slate-700">
            <Lock className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="mt-10 text-center space-y-4 max-w-lg">
        <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-400">
          AIRDROP
        </h2>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-xs font-mono text-slate-400 uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
          Protocol Standby
        </div>

        <p className="text-slate-400 text-lg font-light leading-relaxed">
          The airdrop distribution module is currently locked. Access will be granted automatically once the Genesis Mint phase concludes.
        </p>

        <div className="pt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-cyan-500/80 font-mono text-sm">
            <Timer size={16} />
            <span>Awaiting Mint Completion</span>
          </div>
          <div className="w-full max-w-[200px] h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500/50 w-2/3 animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>
    </main>
  );
}