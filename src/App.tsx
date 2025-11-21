

 // File: App.tsx
import { useEffect } from 'react';
import Layout from './components/Layout';
import { sdk } from '@farcaster/miniapp-sdk'; 

export default function App() {
  useEffect(() => {
   
    sdk.actions
      .ready()
      .then(() => {
        console.log("SDK is ready from root.");
        sdk.actions.addMiniApp().catch(e => console.warn("Failed to add MiniApp:", e));
      })
      .catch((e) => console.warn("SDK ready error in App.tsx:", e));
  }, []);
    
  return <Layout />;
}
  