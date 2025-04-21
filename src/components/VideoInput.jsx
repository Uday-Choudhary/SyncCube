
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { extractYouTubeId } from '@/lib/utils';

const VideoInput = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { socket, isConnected, publicUrl } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVideoSubmit = (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Not connected",
        description: "Please wait until connected to the server",
      });
      return;
    }
    
    if (!videoUrl) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a video URL",
      });
      return;
    }

    // Validate YouTube URL
    const youtubeId = extractYouTubeId(videoUrl);
    if (!youtubeId) {
      toast({
        variant: "destructive",
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube video URL",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Emitting create_room with videoUrl:", videoUrl);

    // Make sure we don't have multiple handlers
    socket.off('room_created');

    // Create a new room with the video URL
    socket.emit('create_room', { videoUrl });

    // Listen for room creation confirmation
    socket.once('room_created', ({ roomId, publicUrl: roomPublicUrl }) => {
      console.log("Room created with ID:", roomId);
      setIsSubmitting(false);
      
      // Show appropriate toast message based on whether we have a public URL
      if (publicUrl || roomPublicUrl) {
        toast({
          title: "Room created!",
          description: "Public link created that works on any device",
        });
      } else {
        toast({
          title: "Room created!",
          description: `Room ID: ${roomId}`,
        });
      }
      
      // Navigate to the room page using React Router
      navigate(`/room/${roomId}`);
    });
    
    // Handle room creation error (timeout after 5 seconds)
    const timeoutId = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false);
        toast({
          variant: "destructive",
          title: "Room creation failed",
          description: "Server did not respond. Please try again.",
        });
      }
    }, 5000);
    
    // Clean up timeout if component unmounts
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="max-w-lg mx-auto w-full">
      <form onSubmit={handleVideoSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter YouTube video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full"
            disabled={!isConnected || isSubmitting}
          />
          <p className="text-sm text-muted-foreground">
            Paste a YouTube video URL to start watching with friends
          </p>
          
          {publicUrl && (
            <div className="p-2 bg-green-500/10 border border-green-500/30 text-green-600 rounded-md">
              <p className="text-xs">
                Public URL active - your link will be accessible from anywhere!
              </p>
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || !isConnected}
        >
          {isSubmitting ? "Creating room..." : "Create Watch Room"}
        </Button>
      </form>
    </div>
  );
};

export default VideoInput;
