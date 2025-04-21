
# SyncCube - Synchronized Video Watching Application

SyncCube is a web application that allows users to watch videos together in perfect synchronization, regardless of their location. This project demonstrates real-time communication using Socket.io to keep video playback in sync across multiple clients.

## Features

- Video input system that accepts YouTube links
- Auto-generated room IDs and shareable links
- Synchronized playback (play, pause, seek) across all users in a room
- Connected users indicator 
- Responsive design

## Tech Stack

- **Frontend**: React with Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js
- **Real-time Communication**: Socket.io
- **Deployment**: Local development with ngrok for tunneling

## Getting Started

### Prerequisites

- Node.js (version 14.x or higher)
- npm (version 6.x or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd synccube-watcher
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:8080`

### Making your server accessible from the internet using ngrok

1. Install ngrok: https://ngrok.com/download

2. Start ngrok to expose your local server:
```bash
ngrok http 3001
```

3. This will give you a public URL that will forward to your local server. Take note of this URL.

4. Update the Socket.io connection in `src/context/SocketContext.jsx` to use your ngrok URL:
```javascript
// Change this line
const socketInstance = io('http://localhost:3001', {
  // to
const socketInstance = io('https://your-ngrok-url.ngrok.io', {
```

5. Restart the frontend development server.

## How Video Synchronization Works

SyncCube uses Socket.io to establish real-time communication between clients:

1. **Room Creation**: When a user submits a video URL, the server creates a new room with a unique ID and stores the video URL.

2. **Joining a Room**: Users can join a room via a shareable link or by entering the room ID.

3. **Synchronization Events**: The application emits events for play, pause, and seek actions:
   - When a user plays the video, a `video_play` event is emitted
   - When a user pauses the video, a `video_pause` event is emitted
   - When a user seeks to a specific time, a `video_seek` event is emitted

4. **State Management**: The server keeps track of the current state of each room (playing/paused, current time) to ensure new users joining can instantly synchronize.

5. **Buffering Handling**: The application accounts for buffering differences by seeking to the correct timestamp when there's a significant time difference between users.

## Project Structure

```
/
├── server/                  # Backend server code
│   ├── index.js             # Socket.io server implementation
│   └── package.json         # Server dependencies
├── src/                     # Frontend React application
│   ├── components/          # Reusable components
│   ├── context/             # React contexts
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components
│   ├── App.jsx              # Main App component
│   └── main.jsx             # Application entry point
├── index.html               # HTML entry point
└── package.json             # Frontend dependencies
```

## Limitations and Future Improvements

- Currently only supports YouTube videos. Future versions could support more video sources
- No persistent database storage - rooms are lost when the server restarts
- No chat functionality between users (could be added in future versions)
- No user authentication system
