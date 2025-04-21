const http = require('http');
const { Server } = require('socket.io');
const { nanoid } = require('nanoid');
const ngrok = require('ngrok');
const path = require('path');

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('SyncCube server is running');
});

// Create active rooms map
const activeRooms = new Map();

// Socket.io instance with CORS configuration
const io = new Server(server, {
  cors: {
    origin: '*', // Allow connections from any origin
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

// Track the public URL for access
let publicUrl = '';

// Determine if running in production
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3001;

// Debug function to log current rooms
const logActiveRooms = () => {
  console.log('Active rooms:');
  activeRooms.forEach((room, roomId) => {
    console.log(`- Room ${roomId}: ${room.users.length} users, video: ${room.videoUrl}`);
  });
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Send the public URL to the client when they connect
  if (publicUrl) {
    socket.emit('public_url', { url: publicUrl });
  }
  
  // Create a new room
  socket.on('create_room', ({ videoUrl }) => {
    const roomId = nanoid(6); // Generate a 6 character room ID
    
    // Create room with initial state
    activeRooms.set(roomId, {
      videoUrl,
      hostId: socket.id,
      users: [{
        id: socket.id,
        username: `User-${socket.id.substring(0, 5)}`
      }],
      playerState: {
        isPlaying: false,
        currentTime: 0,
        lastUpdated: Date.now()
      }
    });
    
    // Join the socket to the room
    socket.join(roomId);
    
    // Tell client that room was created - now with public URL
    socket.emit('room_created', { 
      roomId, 
      videoUrl,
      publicUrl: publicUrl ? `${publicUrl}/room/${roomId}` : null
    });
    
    console.log(`Room created: ${roomId} with video: ${videoUrl}`);
    if (publicUrl) {
      console.log(`Shareable link: ${publicUrl}/room/${roomId}`);
    }
    logActiveRooms();
  });
  
  // Join an existing room
  socket.on('join_room', ({ roomId, username }) => {
    console.log(`User ${socket.id} attempting to join room: ${roomId}`);
    logActiveRooms();
    
    if (activeRooms.has(roomId)) {
      const room = activeRooms.get(roomId);
      
      // Add the user to the room
      const newUser = {
        id: socket.id,
        username: username || `User-${socket.id.substring(0, 5)}`
      };
      
      room.users.push(newUser);
      
      // Join the socket to the room
      socket.join(roomId);
      
      // Send room data to the joining user
      socket.emit('room_joined', {
        roomId,
        videoUrl: room.videoUrl,
        playerState: room.playerState,
        users: room.users,
        publicUrl: publicUrl ? `${publicUrl}/room/${roomId}` : null
      });
      
      // Notify others in the room that a new user joined
      socket.to(roomId).emit('user_joined', {
        userId: socket.id,
        username: newUser.username,
        users: room.users
      });
      
      console.log(`User ${socket.id} joined room: ${roomId}`);
      logActiveRooms();
    } else {
      console.log(`Room not found: ${roomId}`);
      socket.emit('room_not_found', { roomId });
    }
  });
  
  // Handle play/pause events
  socket.on('video_play', ({ roomId, currentTime }) => {
    if (activeRooms.has(roomId)) {
      const room = activeRooms.get(roomId);
      room.playerState.isPlaying = true;
      room.playerState.currentTime = currentTime;
      room.playerState.lastUpdated = Date.now();
      
      socket.to(roomId).emit('video_play', { currentTime });
    }
  });
  
  socket.on('video_pause', ({ roomId, currentTime }) => {
    if (activeRooms.has(roomId)) {
      const room = activeRooms.get(roomId);
      room.playerState.isPlaying = false;
      room.playerState.currentTime = currentTime;
      room.playerState.lastUpdated = Date.now();
      
      socket.to(roomId).emit('video_pause', { currentTime });
    }
  });
  
  // Handle seeking events
  socket.on('video_seek', ({ roomId, currentTime }) => {
    if (activeRooms.has(roomId)) {
      const room = activeRooms.get(roomId);
      room.playerState.currentTime = currentTime;
      room.playerState.lastUpdated = Date.now();
      
      socket.to(roomId).emit('video_seek', { currentTime });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Update all rooms the user was part of
    activeRooms.forEach((room, roomId) => {
      const userIndex = room.users.findIndex(user => user.id === socket.id);
      
      if (userIndex !== -1) {
        // Remove user from the room
        room.users.splice(userIndex, 1);
        
        // Notify others in the room
        socket.to(roomId).emit('user_left', {
          userId: socket.id,
          users: room.users
        });
        
        console.log(`User ${socket.id} left room ${roomId}, ${room.users.length} users remain`);
        
        // If the room is empty, remove it
        if (room.users.length === 0) {
          activeRooms.delete(roomId);
          console.log(`Room deleted: ${roomId} (empty)`);
        }
        // If the host left, assign a new host
        else if (room.hostId === socket.id && room.users.length > 0) {
          room.hostId = room.users[0].id;
          console.log(`New host assigned for room ${roomId}: ${room.hostId}`);
        }
      }
    });
    
    logActiveRooms();
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`SyncCube server is running on port ${PORT}`);
  console.log(`Server is accessible from any network interface`);
  
  // Set the public URL based on environment
  if (isProduction) {
    // In production, use the hosting platform's URL
    publicUrl = process.env.PUBLIC_URL || `https://${process.env.RENDER_EXTERNAL_URL || 'your-deployed-app.com'}`;
    console.log(`🔗 Production public URL: ${publicUrl}`);
  } else {
    // In development, use ngrok for local testing
    try {
      publicUrl = await ngrok.connect({
        addr: PORT,
        region: 'us',
        onStatusChange: status => {
          console.log(`Ngrok status changed: ${status}`);
        },
      });
      console.log(`🔗 Development public URL: ${publicUrl}`);
    } catch (err) {
      console.error('Ngrok tunnel error:', err);
      console.log('⚠️ Could not establish ngrok tunnel. Using local network only.');
    }
  }
  
  // Broadcast the public URL to all connected clients
  io.emit('public_url', { url: publicUrl });
});

// Server status endpoint
server.on('request', (req, res) => {
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      publicUrl: publicUrl || null,
      activeRooms: Array.from(activeRooms.keys()),
      connections: io.engine.clientsCount
    }));
  }
});
