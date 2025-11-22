import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Ghost, Copy, LogOut, HelpCircle, Aperture } from 'lucide-react';
import About from './About';
import Mint from './Mint';

type Page = 'about' | 'mint';



function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = () => {
    if (address) {
      const el = document.createElement('textarea');
      el.value = address;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
      } catch (e) {
        console.error("Failed to copy text: ", e);
      }
      document.body.removeChild(el);
      setIsOpen(false);
    }
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  if (isConnected) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-xs font-mono uppercase tracking-wider border border-slate-600 shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          {shortAddress}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-3 text-xs text-slate-400 border-b border-slate-700">
              Connected: {shortAddress}
            </div>
            <button
              onClick={handleCopy}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
            >
              <Copy size={14} /> Copy Address
            </button>
            <button
              onClick={() => { disconnect(); setIsOpen(false); }}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
            >
              <LogOut size={14} /> Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => connect({ connector: connectors[0] })}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider border border-blue-400 shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

const Header = () => (
  <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.5)]">
          <Ghost size={20} className="text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 drop-shadow-[0_2px_0_rgba(37,99,235,0.8)]">
          WARPUNK
        </h1>
      </div>

      <ConnectMenu />
    </div>
  </header>
);

const NavItem = ({ icon: Icon, label, active, onClick }: { page: Page, icon: typeof Ghost, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center p-2 rounded-lg transition-colors text-xs font-mono tracking-widest uppercase ${
      active
        ? 'text-cyan-400 shadow-md bg-slate-800/50'
        : 'text-slate-500 hover:text-cyan-300 hover:bg-slate-900'
    }`}
  >
    <Icon size={24} className={active ? 'drop-shadow-[0_0_5px_rgba(34,213,238,0.6)]' : ''} />
    <span className="mt-1">{label}</span>
  </button>
);

const Footer = ({ currentPage, setPage }: { currentPage: Page, setPage: (page: Page) => void }) => (
  <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/90 backdrop-blur-md z-50">
    <div className="container mx-auto flex justify-around p-3">
      <NavItem 
        page="about" 
        icon={HelpCircle} 
        label="ABOUT" 
        active={currentPage === 'about'} 
        onClick={() => setPage('about')} 
      />
      <NavItem 
        page="mint" 
        icon={Aperture} 
        label="MINT" 
        active={currentPage === 'mint'} 
        onClick={() => setPage('mint')} 
      />
    </div>
  </footer>
);


export default function Layout() {
  const [currentPage, setCurrentPage] = useState<Page>('about'); 

 
  const contentStyle = "min-h-[calc(100vh-100px)] pt-16 pb-20"; 

  

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-950 text-white font-mono selection:bg-cyan-500/30 overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <Header />

      <div className={contentStyle}>
        {currentPage === 'about' ? <About /> : <Mint />}
      </div>

      <Footer currentPage={currentPage} setPage={setCurrentPage} />
    </div>
  );
}