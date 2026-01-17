import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, Layers, Calendar } from 'lucide-react';
import { SelfieLog } from '../types';

interface TransformationViewerProps {
  selfies: SelfieLog[];
  onClose: () => void;
  initialMode?: 'front' | 'side';
}

export const TransformationViewer: React.FC<TransformationViewerProps> = ({ selfies, onClose, initialMode = 'front' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'front' | 'side'>(initialMode);

  // Sort selfies by date: Oldest -> Newest for timeline effect
  const timeline = useMemo(() => {
    return [...selfies].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selfies]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= timeline.length - 1) {
            setIsPlaying(false); // Stop at the end
            return prev;
          }
          return prev + 1;
        });
      }, 600); // 600ms per frame for a good viewing speed
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeline.length]);

  const currentLog = timeline[currentIndex];
  
  // Handle legacy data structure support
  const currentImage = viewMode === 'front' 
    ? (currentLog.images?.front || currentLog.imageData) 
    : (currentLog.images?.side || currentLog.imageData); // Fallback to main image if side doesn't exist

  // Check if current log actually has a side profile
  const hasSideProfile = !!currentLog.images?.side;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(Number(e.target.value));
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (currentIndex === timeline.length - 1) {
        setCurrentIndex(0); // Restart if at end
    }
    setIsPlaying(!isPlaying);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header with Safe Area */}
      <div 
        className="flex justify-between items-center px-4 pb-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="flex flex-col text-white">
            <span className="font-bold text-lg">时光机</span>
            <span className="text-xs text-gray-300 opacity-80">
                {currentIndex + 1} / {timeline.length} 记录
            </span>
        </div>
        
        <div className="flex items-center space-x-4">
             {/* View Mode Toggle */}
            <button 
                onClick={() => setViewMode(prev => prev === 'front' ? 'side' : 'front')}
                className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center space-x-1 border border-white/20"
            >
                <Layers size={14} />
                <span>{viewMode === 'front' ? '看正脸' : '看侧颜'}</span>
            </button>
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white">
                <X size={20} />
            </button>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gray-900">
        {currentImage ? (
            <img 
                src={currentImage} 
                alt="Timeline" 
                className="w-full h-full object-cover transition-opacity duration-200"
            />
        ) : (
            <div className="text-gray-500 text-sm">No image available for this mode</div>
        )}
        
        {/* Date Overlay */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-1 rounded-full text-white text-sm font-mono border border-white/10 flex items-center shadow-lg">
            <Calendar size={12} className="mr-2 opacity-70" />
            {formatDate(currentLog.date)}
        </div>

        {/* Warning if switching to side view but no data */}
        {viewMode === 'side' && !hasSideProfile && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 px-6 py-4 rounded-xl text-center">
                <p className="text-white text-sm">该日期暂无侧脸记录</p>
            </div>
        )}
      </div>

      {/* Controls Footer with Safe Area */}
      <div 
        className="bg-gray-900 px-6 pt-8 rounded-t-3xl border-t border-gray-800"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        {/* Slider */}
        <div className="mb-6 flex items-center space-x-3">
             <span className="text-[10px] text-gray-500 font-mono">START</span>
             <input 
                type="range" 
                min="0" 
                max={timeline.length - 1} 
                value={currentIndex} 
                onChange={handleSliderChange}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <span className="text-[10px] text-gray-500 font-mono">NOW</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center space-x-8">
            <button 
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                className="p-3 text-gray-400 hover:text-white transition-colors"
                disabled={currentIndex === 0}
            >
                <ChevronLeft size={24} />
            </button>

            <button 
                onClick={togglePlay}
                className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-900/50 active:scale-95 transition-transform"
            >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>

            <button 
                onClick={() => setCurrentIndex(Math.min(timeline.length - 1, currentIndex + 1))}
                className="p-3 text-gray-400 hover:text-white transition-colors"
                disabled={currentIndex === timeline.length - 1}
            >
                <ChevronRight size={24} />
            </button>
        </div>
        <p className="text-center text-gray-500 text-xs mt-4">
            {isPlaying ? 'Playing transformation...' : 'Tap play to see changes'}
        </p>
      </div>
    </div>
  );
};