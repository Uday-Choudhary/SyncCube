
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Function to extract YouTube video ID from various YouTube URL formats
export function extractYouTubeId(url) {
  if (!url) return null;
  
  // Handle youtu.be links
  const shortLinkRegex = /youtu\.be\/([^?]+)/;
  const shortMatch = url.match(shortLinkRegex);
  if (shortMatch) return shortMatch[1];
  
  // Handle standard youtube.com links
  const standardRegex = /youtube\.com\/watch\?v=([^&]+)/;
  const standardMatch = url.match(standardRegex);
  if (standardMatch) return standardMatch[1];
  
  // Handle youtube.com/embed links
  const embedRegex = /youtube\.com\/embed\/([^?]+)/;
  const embedMatch = url.match(embedRegex);
  if (embedMatch) return embedMatch[1];
  
  // If no match was found, return null
  return null;
}

// Function to format time in seconds to MM:SS format
export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const secondsStr = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
  
  return `${minutesStr}:${secondsStr}`;
}

// Function to copy text to clipboard
export async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    // For secure contexts
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Make the textarea invisible
    textArea.style.position = "absolute";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.select();
    
    return new Promise((resolve, reject) => {
      try {
        const successful = document.execCommand('copy');
        if (!successful) {
          reject(new Error('Failed to copy text'));
        }
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textArea);
      }
    });
  }
}
