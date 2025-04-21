
import React from 'react';
import { useSocket } from '@/context/SocketContext';

const HeaderNav = () => {
  const { isConnected } = useSocket();
  
  return (
    <header className="border-b border-slate-800">
      <div className="container flex items-center justify-between py-4">
        <a href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="font-bold text-white">SC</span>
          </div>
          <span className="font-bold text-xl">SyncCube</span>
        </a>
        
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
          <span className="text-sm mr-4">{isConnected ? 'Connected' : 'Disconnected'}</span>
          
          <a href="/" className="px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent/50">Home</a>
          
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent/50">GitHub</a>
        </div>
      </div>
    </header>
  );
};

export default HeaderNav;
