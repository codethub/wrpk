import { useAccount } from 'wagmi';
import { Zap, ArrowRight, HelpCircle } from 'lucide-react';

const FusionCard = ({
  title,
  badge,
  img,
  color = "cyan",
  isMystery = false
}: {
  title: string;
  badge: string;
  img: string;
  color?: "cyan" | "purple" | "pink";
  isMystery?: boolean;
}) => {
  const borderColors = {
    cyan: "border-cyan-500/30 shadow-cyan-500/20",
    purple: "border-purple-500/30 shadow-purple-500/20",
    pink: "border-pink-500/30 shadow-pink-500/20",
  };

  return (
    <div className={`relative z-10 w-24 h-24 md:w-32 md:h-32 bg-slate-900/80 backdrop-blur-md border rounded-2xl shadow-lg flex flex-col items-center justify-center p-2 transition-all hover:scale-105 ${borderColors[color]}`}>
      <div className="w-full h-full rounded-xl overflow-hidden bg-slate-800 relative flex items-center justify-center">
        {isMystery ? (
          <HelpCircle size={36} className="text-cyan-400 opacity-60 animate-pulse" />
        ) : (
          <img src={img} alt={title} className="w-full h-full object-cover" onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `https://placehold.co/128x128/0f172a/67e8f9?text=${badge}`;
          }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
      </div>

      <div className="absolute -bottom-3 bg-slate-950 border border-slate-700 text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-slate-300 shadow-sm">
        {badge}
      </div>
    </div>
  );
};

const FusionConnectorMerge = ({ label }: { label: string }) => {
  const gradientId = "grad-cyan";
  return (
    <div className="relative flex-1 h-[216px] md:h-[288px] min-w-[60px] max-w-[120px] flex items-center justify-center">
      <svg
        className="w-full h-full drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
          </linearGradient>
        </defs>

        <path d="M 0 25 C 50 25, 50 50, 100 50" stroke={`url(#${gradientId})`} strokeWidth="3" fill="none" className="animate-pulse" strokeLinecap="round" />
        <path d="M 0 75 C 50 75, 50 50, 100 50" stroke={`url(#${gradientId})`} strokeWidth="3" fill="none" strokeLinecap="round" />

        <circle r="2" fill="white"><animateMotion dur="2s" repeatCount="indefinite" path="M 0 25 C 50 25, 50 50, 100 50" /></circle>
        <circle r="2" fill="white"><animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 0 75 C 50 75, 50 50, 100 50" /></circle>
      </svg>

      <div className="absolute bg-slate-900/90 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-400 uppercase tracking-widest z-20 shadow-xl backdrop-blur">
        <span className="flex items-center gap-1"><Zap size={10} /> {label}</span>
      </div>
    </div>
  );
};

const FusionConnectorFinal = ({ label }: { label: string }) => {
  const gradientId = "grad-purple";
  return (
    <div
      className="relative flex-1 h-[216px] md:h-[288px] min-w-[60px] max-w-[120px] flex items-center justify-center"
      style={{ marginTop: '10%' }}
    >
      <svg
      className="w-full h-full drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
      >
      <defs>
        <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#d946ef" stopOpacity="1" />
        </linearGradient>
      </defs>

      <path d="M 0 25 C 50 25, 50 50, 100 50" stroke={`url(#${gradientId})`} strokeWidth="3" fill="none" className="animate-pulse" strokeLinecap="round" />
      <path d="M 0 75 C 50 75, 50 50, 100 50" stroke={`url(#${gradientId})`} strokeWidth="3" fill="none" strokeLinecap="round" />

      <circle r="2" fill="white"><animateMotion dur="2s" repeatCount="indefinite" path="M 0 25 C 50 25, 50 50, 100 50" /></circle>
      <circle r="2" fill="white"><animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 0 75 C 50 75, 50 50, 100 50" /></circle>
      </svg>

      <div className="absolute bg-slate-900/90 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-400 uppercase tracking-widest z-20 shadow-xl backdrop-blur">
      <span className="flex items-center gap-1"><Zap size={10} /> {label}</span>
      </div>
    </div>
  );
};


export default function About() {
  const { isConnected } = useAccount();
  const cardStackClasses = "flex flex-col gap-8 md:gap-16 py-10";
  const columnTwoMarginTop = '10%';
  const columnThreeMarginTop = '10%';

  const openseaLink = 'https://opensea.io/collection/warpunk-farcaster';

  return (
    <main className="flex-1 w-full flex flex-col items-center p-4 md:p-10 py-10 pt-20 pb-20">
      <div className="text-center mb-12 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          System Online
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          GENESIS <span className="text-cyan-400">WARPUNK</span>
        </h2>
        <p className="text-slate-400">
          Join the evolution. Merge your Farcaster PFP through the Warpunk AI & Mint to NFT.
        </p>
      </div>

      <div className="flex flex-row items-center justify-center min-w-[900px] pb-4 pt-4 overflow-x-auto scrollbar-hide">

        <div className={cardStackClasses}>
          <FusionCard
            title="Base Punk"
            badge="BasePunk"
            img="/basepunk.png"
            color="cyan"
          />
          <FusionCard
            title="Warlet"
            badge="Warlet"
            img="/warplets.png"
            color="cyan"
          />
        </div>

        <FusionConnectorMerge label="AI FUSION" />

        <div className={cardStackClasses} style={{ marginTop: columnTwoMarginTop }}>
          <FusionCard
            title="Warpunk"
            badge="WARPUNK"
            img="/warpunk.png"
            color="purple"
          />
          <FusionCard
            title="Farcaster"
            badge="USER PFP"
            img="/farcaster.png"
            color="pink"
            isMystery={true}
          />
        </div>

        <FusionConnectorFinal label="WARPUNK AI" />

        <div className="flex flex-col items-center justify-center" style={{ marginTop: columnThreeMarginTop }}>
          <FusionCard
            title="Final Form"
            badge="GENERATED"
            img="/final.png"
            color="pink"
            isMystery={true}
          />
        </div>

      </div>

      <p className="md:hidden text-xs text-slate-500 mt-4 flex items-center gap-1 animate-pulse">
          <ArrowRight size={12} /> Scroll sideways to view pipeline
      </p>

      <div className="mt-16 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center p-6 bg-slate-900/80 border border-cyan-500/30 rounded-xl shadow-xl max-w-md w-full">
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-yellow-500/10 rounded text-yellow-500">
              <Zap size={24} />
            </div>
            <h4 className="font-extrabold text-xl text-cyan-400 tracking-wider">
              NFT COLLECTION DETAILS
            </h4>
          </div>

          <div className="w-full space-y-3 p-4 bg-slate-950/50 border border-slate-700 rounded-lg shadow-inner">
              <div className="flex justify-between items-center text-sm md:text-base font-bold text-white uppercase border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-cyan-300">The Warpunk</span>
              </div>
              <div className="flex justify-between items-center text-sm md:text-base font-bold text-white uppercase border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Ticker:</span>
                  <span className="text-cyan-300">WRPK</span>
              </div>
              <div className="flex justify-between items-center text-sm md:text-base font-bold text-white uppercase">
                  <span className="text-slate-400">Supply:</span>
                  <span className="text-cyan-300">2000</span>
              </div>
          </div>
        </div>

        <a 
          href={openseaLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="group relative px-8 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-cyan-400 transition-all duration-300 shadow-[8px_8px_0_#0f172a] border-2 border-slate-800 hover:shadow-[4px_4px_0_#0f172a] hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          <span className="relative z-10 flex items-center gap-2">
            View on OpenSea <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </span>
        </a>

        {!isConnected && (
          <div className="text-red-400 text-sm font-bold p-2">
            * Please connect your wallet first.
          </div>
        )}
      </div>
    </main>
  );
}