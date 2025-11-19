// components/video-player.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
  fileUrl: string;
  contentId: string;
}

export function VideoPlayer({ fileUrl, contentId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Sauvegarder la progression
  const saveProgress = async (time: number) => {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId,
        currentTime: Math.floor(time),
        totalTime: Math.floor(duration),
      }),
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Sauvegarder toutes les 30 secondes
      if (Math.floor(video.currentTime) % 30 === 0) {
        saveProgress(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [contentId, duration]);

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={fileUrl}
        controls
        className="w-full h-auto max-h-96"
      />
      
      {/* Barre de progression personnalisée */}
      <div className="p-4 bg-gray-900 text-white">
        <div className="flex justify-between text-sm mb-2">
          <span>
            {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
          </span>
          <span>
            {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}