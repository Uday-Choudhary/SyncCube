
# SyncCube Setup Guide

This document provides detailed instructions for setting up and running the SyncCube application.

## Prerequisites

- Node.js (version 14.x or higher) - [Download from nodejs.org](https://nodejs.org/)
- npm (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge, etc.)

## Local Development Setup

### Step 1: Install Dependencies

First, we need to install the dependencies for both the frontend and backend:

```bash
# Install frontend dependencies
npm install

# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Return to project root
cd ..
```

### Step 2: Start the Backend Server (Development)

In a terminal window:

```bash
# Navigate to server directory
cd server

# Start the server
npm run dev
```

The server will start on port 3001. You should see a message: "SyncCube server is running on port 3001"

### Step 3: Start the Frontend Development Server

In a new terminal window (keeping the backend server running):

```bash
# Start the frontend development server
npm run dev
```

The development server will start and the application will be available at http://localhost:8080

## Deploying the Application

To deploy SyncCube and make it available online, you need to deploy both the frontend and backend separately.

### Deploying the Backend Server

The server is already deployed at https://synccube-server.onrender.com. If you need to deploy your own version:

1. Create a [Render account](https://dashboard.render.com/register)
2. Click "New+" and select "Web Service"
3. Connect your GitHub repository or upload your code
4. Configure your service:
   - Name: synccube-server
   - Runtime: Node
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node index.js`
   - Select the free plan

5. Click "Create Web Service"

### Deploying the Frontend

You can deploy the frontend to Vercel:

1. Create a [Vercel account](https://vercel.com/signup) if you don't have one
2. Install the Vercel CLI: `npm i -g vercel`
3. From the project root, run: `vercel`
4. Follow the prompts and deploy your application

The `vercel.json` file in the project root ensures that client-side routing works correctly by redirecting all routes to the index.html file. This is crucial for allowing direct access to rooms via URLs like `/room/ROOM_ID`.

After deployment, your app will be available at the Vercel-provided URL. Users will be able to access it from anywhere and create rooms that work globally.

## Troubleshooting

### Connection Issues in Deployed App

If you experience connection issues with the deployed app:

1. Make sure your browser isn't blocking WebSocket connections
2. Try a different browser or device
3. Check if there are any console errors in your browser developer tools
4. Try refreshing the page

### Video Synchronization Issues

- Check the browser console for any error messages
- Ensure all users have a stable internet connection
- Try refreshing the page if synchronization seems off

### 404 Errors on Direct Room URLs

If users encounter 404 errors when accessing room URLs directly (e.g., `/room/ABC123`):
1. Verify that the `vercel.json` file is present in your project root
2. Make sure it contains the proper rewrite rule: `{ "source": "/(.*)", "destination": "/index.html" }`
3. Redeploy your application to Vercel
