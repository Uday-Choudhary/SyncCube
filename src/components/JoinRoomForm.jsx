
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSocket } from '@/context/SocketContext';

const JoinRoomForm = () => {
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  const { isConnected } = useSocket();

  const handleJoinRoom = (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Not connected",
        description: "Please wait until connected to the server",
      });
      return;
    }
    
    if (!roomId || roomId.length < 6) {
      toast({
        variant: "destructive",
        title: "Invalid Room ID",
        description: "Please enter a valid room ID",
      });
      return;
    }

    setIsJoining(true);

    // Navigate to the room with a small delay to show the loading state
    setTimeout(() => {
      window.location.href = `/room/${roomId}`;
    }, 500);
  };

  return (
    <Card className="max-w-lg mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-center text-xl">Join Existing Room</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoinRoom} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full"
              maxLength={6}
              disabled={!isConnected || isJoining}
            />
            <p className="text-sm text-muted-foreground text-center">
              Enter a 6-character room ID to join an existing watch session
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isJoining || !isConnected}
          >
            {isJoining ? "Joining..." : "Join Room"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JoinRoomForm;
