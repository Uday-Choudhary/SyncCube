
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { extractYouTubeId } from '@/lib/utils';
import HeaderNav from '@/components/HeaderNav';
import YouTubePlayer from '@/components/YouTubePlayer';
import RoomInfo from '@/components/RoomInfo';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const RoomPage = () => {
  // Get roomId from URL params using React Router
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();
  
  const [roomData, setRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [joinAttempted, setJoinAttempted] = useState(false);
  
  // Reset socket event listeners when socket changes
  useEffect(() => {
    if (!socket) return;
    
    const clearSocketListeners = () => {
      socket.off('room_joined');
      socket.off('room_not_found');
      socket.off('user_joined');
      socket.off('user_left');
    };
    
    return clearSocketListeners;
  }, [socket]);
  
  // Handle socket events after username submission
  useEffect(() => {
    if (!socket || !isConnected || !roomId || showUsernamePrompt) return;
    
    console.log("Socket connected and ready to join room:", roomId);
    
    const handleRoomJoined = (data) => {
      console.log("Room joined successfully:", data);
      setRoomData(data);
      setConnectedUsers(data.users || []);
      setIsLoading(false);
      setRoomNotFound(false);
      
      toast({
        title: "Room joined",
        description: `Connected with ${data.users.length} users`,
      });
    };
    
    const handleRoomNotFound = () => {
      console.log("Room not found:", roomId);
      setRoomNotFound(true);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Room not found",
        description: "The room you're trying to join doesn't exist",
      });
    };
    
    const handleUserJoined = ({ users }) => {
      setConnectedUsers(users);
      toast({
        title: "New user joined",
        description: "Someone joined the watch party",
      });
    };
    
    const handleUserLeft = ({ users }) => {
      setConnectedUsers(users);
      toast({
        title: "User left",
        description: "Someone left the watch party",
      });
    };
    
    // Remove any existing listeners first
    socket.off('room_joined');
    socket.off('room_not_found');
    socket.off('user_joined');
    socket.off('user_left');
    
    // Set up event listeners
    socket.on('room_joined', handleRoomJoined);
    socket.on('room_not_found', handleRoomNotFound);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    
    // Return cleanup function to remove listeners
    return () => {
      socket.off('room_joined', handleRoomJoined);
      socket.off('room_not_found', handleRoomNotFound);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  }, [socket, isConnected, roomId, toast, showUsernamePrompt]);
  
  const handleJoinWithUsername = () => {
    if (!socket || !isConnected) {
      toast({
        variant: "destructive",
        title: "Not connected",
        description: "Please wait until connected to the server",
      });
      return;
    }
    
    const finalUsername = username.trim() || `Guest-${Math.floor(Math.random() * 1000)}`;
    console.log(`Joining room ${roomId} with username ${finalUsername}`);
    
    // Join the room with username
    socket.emit('join_room', { roomId, username: finalUsername });
    setShowUsernamePrompt(false);
    setJoinAttempted(true);
    
    // Set a timeout to handle if no response comes back
    setTimeout(() => {
      if (isLoading && joinAttempted) {
        setRoomNotFound(true);
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Join room failed",
          description: "Could not join the room. The server may be unavailable.",
        });
      }
    }, 5000);
  };
  
  // Extract video ID from room data
  const videoId = roomData?.videoUrl ? extractYouTubeId(roomData.videoUrl) : null;
  
  if (roomNotFound) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderNav />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="w-full max-w-md p-6 text-center">
            <h2 className="text-2xl font-semibold mb-4">Room Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The room you're trying to join doesn't exist. The room may have been closed or the ID is incorrect.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </Card>
        </main>
      </div>
    );
  }
  
  if (isLoading && isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderNav />
        <main className="flex-1 container py-8 flex items-center justify-center">
          {showUsernamePrompt ? (
            <Card className="w-full max-w-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-center">Join Watch Room</h2>
              <p className="text-muted-foreground mb-4 text-center">
                Enter a username to join the watch party
              </p>
              <div className="space-y-4">
                <Input
                  placeholder="Your display name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  className="w-full"
                />
                <Button 
                  onClick={handleJoinWithUsername}
                  className="w-full"
                >
                  Join Watch Party
                </Button>
              </div>
            </Card>
          ) : (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-4 text-lg">Joining room...</p>
            </div>
          )}
        </main>
      </div>
    );
  }
  
  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderNav />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="w-full max-w-md p-6 text-center">
            <h2 className="text-2xl font-semibold mb-4">Connection Lost</h2>
            <p className="text-muted-foreground mb-6">
              We're having trouble connecting to the server. Please check your internet connection.
            </p>
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" role="status">
              <span className="sr-only">Reconnecting...</span>
            </div>
            <p className="text-sm">Attempting to reconnect...</p>
          </Card>
        </main>
      </div>
    );
  }
  
  if (!videoId && roomData) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderNav />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="w-full max-w-md p-6 text-center">
            <h2 className="text-2xl font-semibold mb-4">Invalid Video</h2>
            <p className="text-muted-foreground mb-6">
              The video URL for this room is invalid or not supported.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav />
      
      <main className="flex-1 container py-8">
        <h1 className="text-2xl font-bold mb-6">Watch Room: {roomId}</h1>
        
        <RoomInfo 
          roomId={roomId} 
          connectedUsers={connectedUsers}
        />
        
        <YouTubePlayer 
          videoId={videoId}
          roomId={roomId}
          initialState={roomData?.playerState}
        />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            All viewers in this room will automatically stay in sync with each other.
            <br />
            When someone plays, pauses or seeks the video, everyone's player will update.
          </p>
        </div>
      </main>
    </div>
  );
};

export default RoomPage;
