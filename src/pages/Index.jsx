
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import HeaderNav from '@/components/HeaderNav';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { extractYouTubeId } from '@/lib/utils';
import VideoInput from '@/components/VideoInput';
import JoinRoomForm from '@/components/JoinRoomForm';

const Index = () => {
  const { isConnected } = useSocket();

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav />
      
      <main className="flex-1 container py-8 md:py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Watch Videos Together, In Perfect Sync
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Create a room, share the link, and enjoy synchronized video watching with friends from anywhere in the world.
          </p>
          
          {!isConnected && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 p-4 rounded-md">
                  <p className="font-medium">Server connection issue</p>
                  <p className="text-sm mt-1">Make sure your server is running on port 3001. Run <code>cd server && npm run dev</code> to start the server.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Start Watching</CardTitle>
            <CardDescription className="text-center">
              Paste a YouTube video URL to create a new watch room
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoInput />
          </CardContent>
        </Card>
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <div className="h-px bg-border flex-1" />
            <span className="px-4 text-muted-foreground text-sm">OR</span>
            <div className="h-px bg-border flex-1" />
          </div>
        </div>
        
        <JoinRoomForm />
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            title="Synchronized Playback" 
            description="Play, pause, and seek together in perfect sync, no matter where your friends are located."
            icon="🔄"
          />
          <FeatureCard 
            title="Easy to Share" 
            description="Generate a simple room link that you can share with anyone to join your watch party."
            icon="🔗"
          />
          <FeatureCard 
            title="No Account Needed" 
            description="Get started right away with no sign-up or login required."
            icon="🚀"
          />
        </div>
      </main>
      
      <footer className="border-t border-slate-800 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>SyncCube - Watch videos together, synchronized in real-time.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, description, icon }) => {
  return (
    <Card className="bg-card/50">
      <CardContent className="pt-6">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default Index;
