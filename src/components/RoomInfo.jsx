import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn, copyToClipboard } from '@/lib/utils';

const RoomInfo = ({ roomId, connectedUsers = [] }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  
  // Always use the current window's origin for sharing
  const shareableLink = `${window.location.origin}/room/${roomId}`;
  
  const handleCopyLink = async () => {
    try {
      await copyToClipboard(shareableLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with your friends"
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please try again or copy manually"
      });
    }
  };
  
  const handleCopyId = async () => {
    try {
      await copyToClipboard(roomId);
      setCopiedId(true);
      toast({
        title: "ID copied!",
        description: "Room ID copied to clipboard"
      });
      
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      console.error("Copy ID error:", error);
      toast({
        variant: "destructive",
        title: "Failed to copy ID",
        description: "Please try again or copy manually"
      });
    }
  };
  
  return (
    <Card className="mb-4 bg-card/50">
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Room ID:</p>
            <div className="flex items-center gap-2">
              <Input
                value={roomId}
                readOnly
                className="font-mono"
              />
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleCopyId}
                className="whitespace-nowrap"
              >
                {copiedId ? "Copied!" : "Copy ID"}
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Share Link:</p>
            <div className="flex items-center gap-2">
              <Input
                value={shareableLink}
                readOnly
                className="text-xs"
              />
              <Button 
                onClick={handleCopyLink} 
                size="sm"
                className={cn(
                  "whitespace-nowrap",
                  copied ? "bg-green-600 hover:bg-green-700" : ""
                )}
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
            
            <p className="text-xs text-green-500 mt-1">
              Using current window's origin - link will work on any device!
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm font-medium">Connected Users ({connectedUsers.length}):</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {connectedUsers.map((user) => (
              <span 
                key={user.id} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent-foreground"
              >
                {user.username || `User-${user.id.substring(0, 5)}`}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomInfo;
