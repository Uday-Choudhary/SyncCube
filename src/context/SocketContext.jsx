
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useToast } from "@/hooks/use-toast";

const SocketContext = createContext(null);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Define the server URL based on environment
    // We'll use the deployed server URL regardless of environment now
    const serverUrl = "https://synccube-server.onrender.com";
    
    console.log("Attempting to connect to Socket.IO server at:", serverUrl);
    
    // Connect to the Socket.IO server with better configuration
    const socketInstance = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
      forceNew: true, // Force a new connection
    });

    setSocket(socketInstance);

    // Socket connection event listeners
    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to Socket.IO server with ID:', socketInstance.id);
      toast({
        title: "Connected",
        description: "Successfully connected to server"
      });
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log(`Disconnected from Socket.IO server: ${reason}`);
      toast({
        variant: "destructive",
        title: "Connection lost",
        description: "Trying to reconnect..."
      });
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Could not connect to server. Please try again later."
      });
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      toast({
        title: "Reconnected",
        description: "You're back online!",
      });
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      toast({
        variant: "destructive",
        title: "Socket Error",
        description: error.message || "An error occurred with the connection"
      });
    });

    // Handle receiving the public URL from ngrok
    socketInstance.on('public_url', ({ url }) => {
      console.log('Received public URL from server:', url);
      // Fix potential double https:// in the URL
      const formattedUrl = url.startsWith('https://https://') 
        ? url.replace('https://https://', 'https://') 
        : url;
      setPublicUrl(formattedUrl);
    });

    // Clean up on unmount
    return () => {
      console.log("Cleaning up socket connection");
      socketInstance.disconnect();
    };
  }, [toast]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, publicUrl }}>
      {children}
    </SocketContext.Provider>
  );
}
