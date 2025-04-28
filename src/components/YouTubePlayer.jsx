import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/utils';
import { useSocket } from '@/context/SocketContext';
import { Maximize, Minimize } from 'lucide-react';

const YouTubePlayer = ({ videoId, roomId, initialState = {} }) => {
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const { socket } = useSocket();
  
  const [playerReady, setPlayerReady] = useState(false);
  const [playerState, setPlayerState] = useState({
    isPlaying: initialState.isPlaying || false,
    currentTime: initialState.currentTime || 0,
    duration: 0,
    isSeeking: false,
    isBuffering: false,
    isSyncing: false,
    error: null,
  });
  
  const [seekValue, setSeekValue] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    console.log("Initializing YouTube player with videoId:", videoId);
    if (!videoId) {
      console.error("No video ID provided");
      return;
    }
    
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }
    
    function initializePlayer() {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (err) {
          console.error('Error destroying previous YouTube player:', err);
        }
      }
      
      try {
        console.log("Creating YouTube player with element:", playerRef.current);
        playerInstanceRef.current = new window.YT.Player(playerRef.current, {
          videoId: videoId,
          height: '100%',
          width: '100%',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            modestbranding: 1,
            rel: 0,
            fs: 1,
            iv_load_policy: 3
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: onPlayerError,
          },
        });
        console.log("YouTube player instance created:", playerInstanceRef.current);
      } catch (err) {
        console.error("Error creating YouTube player:", err);
        setPlayerState(prev => ({
          ...prev,
          error: "Failed to create YouTube player"
        }));
      }
    }
    
    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
        } catch (err) {
          console.error('Error destroying YouTube player:', err);
        }
      }
    };
  }, [videoId]);
  
  useEffect(() => {
    if (!playerReady || !playerInstanceRef.current) return;
    
    const progressInterval = setInterval(() => {
      if (
        playerInstanceRef.current &&
        !playerState.isSeeking &&
        playerState.isPlaying
      ) {
        try {
          const currentTime = playerInstanceRef.current.getCurrentTime();
          setPlayerState(prev => ({ ...prev, currentTime }));
          setSeekValue(currentTime);
        } catch (err) {
          console.error('Error getting current time:', err);
        }
      }
    }, 1000);
    
    return () => clearInterval(progressInterval);
  }, [playerReady, playerState.isPlaying, playerState.isSeeking]);
  
  const onPlayerReady = (event) => {
    console.log("YouTube player ready:", event);
    setPlayerReady(true);
    
    try {
      const duration = event.target.getDuration();
      setPlayerState(prev => ({
        ...prev,
        duration,
        error: null,
      }));
      
      setSeekValue(initialState.currentTime || 0);
      
      if (initialState.currentTime > 0) {
        event.target.seekTo(initialState.currentTime, true);
      }
      
      if (initialState.isPlaying) {
        event.target.playVideo();
      }
    } catch (err) {
      console.error('Error in onPlayerReady:', err);
    }
  };
  
  const onPlayerStateChange = (event) => {
    if (!window.YT) return;
    
    try {
      switch (event.data) {
        case window.YT.PlayerState.PLAYING:
          if (!playerState.isSyncing) {
            socket.emit('video_play', { 
              roomId,
              currentTime: event.target.getCurrentTime() 
            });
          }
          setPlayerState(prev => ({
            ...prev,
            isPlaying: true,
            isBuffering: false,
            isSyncing: false,
            error: null,
          }));
          break;
          
        case window.YT.PlayerState.PAUSED:
          if (!playerState.isSyncing) {
            socket.emit('video_pause', { 
              roomId,
              currentTime: event.target.getCurrentTime()
            });
          }
          setPlayerState(prev => ({
            ...prev,
            isPlaying: false,
            isSyncing: false
          }));
          break;
          
        case window.YT.PlayerState.BUFFERING:
          setPlayerState(prev => ({
            ...prev,
            isBuffering: true
          }));
          break;
          
        case window.YT.PlayerState.ENDED:
          setPlayerState(prev => ({
            ...prev,
            isPlaying: false,
            currentTime: prev.duration,
          }));
          setSeekValue(playerState.duration);
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error('Error in onPlayerStateChange:', err);
    }
  };
  
  const onPlayerError = (error) => {
    console.error('YouTube player error:', error);
    setPlayerState(prev => ({
      ...prev,
      error: `Video playback error: ${error.data}`
    }));
  };
  
  useEffect(() => {
    if (!socket || !playerReady) return;
    
    const handleVideoPlay = ({ currentTime }) => {
      console.log("Received play event with time:", currentTime);
      setPlayerState(prev => ({ ...prev, isSyncing: true }));
      
      try {
        if (playerInstanceRef.current) {
          const playerTime = playerInstanceRef.current.getCurrentTime();
          if (Math.abs(playerTime - currentTime) > 2) {
            playerInstanceRef.current.seekTo(currentTime, true);
          }
          
          playerInstanceRef.current.playVideo();
        }
      } catch (err) {
        console.error('Error handling video_play event:', err);
      }
    };
    
    const handleVideoPause = ({ currentTime }) => {
      console.log("Received pause event with time:", currentTime);
      setPlayerState(prev => ({ ...prev, isSyncing: true }));
      
      try {
        if (playerInstanceRef.current) {
          const playerTime = playerInstanceRef.current.getCurrentTime();
          if (Math.abs(playerTime - currentTime) > 2) {
            playerInstanceRef.current.seekTo(currentTime, true);
          }
          
          playerInstanceRef.current.pauseVideo();
        }
      } catch (err) {
        console.error('Error handling video_pause event:', err);
      }
    };
    
    const handleVideoSeek = ({ currentTime }) => {
      console.log("Received seek event with time:", currentTime);
      setPlayerState(prev => ({ ...prev, isSyncing: true }));
      
      try {
        if (playerInstanceRef.current) {
          setSeekValue(currentTime);
          playerInstanceRef.current.seekTo(currentTime, true);
        }
      } catch (err) {
        console.error('Error handling video_seek event:', err);
      }
    };
    
    socket.off('video_play');
    socket.off('video_pause');
    socket.off('video_seek');
    
    socket.on('video_play', handleVideoPlay);
    socket.on('video_pause', handleVideoPause);
    socket.on('video_seek', handleVideoSeek);
    
    return () => {
      socket.off('video_play', handleVideoPlay);
      socket.off('video_pause', handleVideoPause);
      socket.off('video_seek', handleVideoSeek);
    };
  }, [socket, roomId, playerReady]);
  
  const togglePlayPause = () => {
    if (!playerReady || !playerInstanceRef.current) return;
    
    try {
      if (playerState.isPlaying) {
        playerInstanceRef.current.pauseVideo();
      } else {
        playerInstanceRef.current.playVideo();
      }
    } catch (err) {
      console.error('Error toggling play/pause:', err);
    }
  };
  
  const handleSeekStart = () => {
    setPlayerState(prev => ({ ...prev, isSeeking: true }));
  };
  
  const handleSeekChange = (value) => {
    setSeekValue(value[0]);
  };
  
  const handleSeekEnd = () => {
    const newTime = seekValue;
    
    if (playerInstanceRef.current) {
      try {
        socket.emit('video_seek', { 
          roomId,
          currentTime: newTime
        });
        
        playerInstanceRef.current.seekTo(newTime, true);
        
        setPlayerState(prev => ({ 
          ...prev, 
          isSeeking: false,
          currentTime: newTime
        }));
      } catch (err) {
        console.error('Error seeking:', err);
        setPlayerState(prev => ({ ...prev, isSeeking: false }));
      }
    }
  };
  
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
    } else {
      document.exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch(err => {
          console.error('Error attempting to exit fullscreen:', err);
        });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(false);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (playerState.error) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6 text-center text-red-500">
          <p>Error: {playerState.error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Reload Page
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <div 
        ref={containerRef} 
        className="relative w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-video">
          <div ref={playerRef} className="absolute inset-0" />
          
          {!playerReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                <span className="sr-only">Loading player...</span>
              </div>
            </div>
          )}
        </div>
        
        <div 
          className={`px-4 py-3 flex flex-col gap-2 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-4">
            <Button 
              onClick={togglePlayPause} 
              variant="ghost" 
              size="icon" 
              disabled={!playerReady}
              className="h-10 w-10 text-white hover:text-white hover:bg-white/20"
            >
              {playerState.isPlaying ? "⏸️" : "▶️"}
            </Button>
            
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm font-mono text-white">
                {formatTime(playerState.currentTime)}
              </span>
              
              <Slider
                value={[seekValue]}
                min={0}
                max={playerState.duration || 100}
                step={1}
                onValueChange={handleSeekChange}
                onValueCommit={handleSeekEnd}
                onPointerDown={handleSeekStart}
                disabled={!playerReady}
                className="flex-1"
              />
              
              <span className="text-sm font-mono text-white">
                {formatTime(playerState.duration)}
              </span>
            </div>

            <Button
              onClick={handleFullscreen}
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize /> : <Maximize />}
            </Button>
          </div>
          
          {playerState.isBuffering && (
            <div className="text-xs text-white/80 animate-pulse">
              Buffering...
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default YouTubePlayer;
