import React, { useState, useRef, useEffect } from 'react';
import { MediaItem } from '../types';
import { ChevronLeft, ChevronRight, Play, Maximize2, Pause } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface MediaCarouselProps {
  media: MediaItem[];
  className?: string;
  onExpand?: () => void;
  expandable?: boolean;
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({ media, className, onExpand, expandable = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  if (!media || media.length === 0) return null;

  const currentMedia = media[currentIndex];

  // Helper to get aspect ratio class
  const getAspectRatioClass = (format?: string) => {
    switch (format) {
      case 'portrait': return 'aspect-[4/5]';
      case 'story': return 'aspect-[9/16]';
      case 'landscape': return 'aspect-video';
      default: return 'aspect-square';
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < media.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRefs.current[currentIndex];
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  // Ensure only the current video plays
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex && isPlaying) {
          video.play().catch(() => setIsPlaying(false));
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex, isPlaying]);

  return (
    <div 
      className={cn(
        "relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 group shadow-inner w-full flex items-center justify-center cursor-default",
        getAspectRatioClass(currentMedia.format),
        className
      )}
      onClick={expandable && onExpand ? onExpand : undefined}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 w-full h-full"
        >
          {currentMedia.type === 'video' ? (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                ref={el => videoRefs.current[currentIndex] = el}
                src={currentMedia.url}
                className="w-full h-full object-contain outline-none"
                controls
                controlsList="nodownload"
                loop
                muted
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
             <img
              src={currentMedia.url}
              alt="Post media"
              className={cn("w-full h-full object-contain transition-transform duration-700", expandable && "group-hover:scale-105 cursor-zoom-in")}
              referrerPolicy="no-referrer"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Expand Overlay */}
      {expandable && onExpand && currentMedia.type === 'image' && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
           <div className="bg-white/20 backdrop-blur-md p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
             <Maximize2 className="text-white w-6 h-6" />
           </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 z-10",
              currentIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentIndex === media.length - 1}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 z-10",
              currentIndex === media.length - 1 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/20 backdrop-blur-md px-2.5 py-1.5 rounded-full">
            {media.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  i === currentIndex ? "w-3 bg-white" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
