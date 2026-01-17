import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { ChevronLeft, Play, Pause, FastForward } from 'lucide-react';

interface WorkoutViewProps {
  course: Course;
  onComplete: () => void;
  onBack: () => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({ course, onComplete, onBack }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Initialize with the duration of the first step
  const currentStep = course.steps[stepIndex];
  const [timeLeft, setTimeLeft] = useState(currentStep.duration);

  // When changing steps, reset the timer and sync video
  useEffect(() => {
    setTimeLeft(course.steps[stepIndex].duration);
    setIsPlaying(true); 
    
    // Reset video to start if it exists
    if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
            // Auto-play policies might block unmuted, but we are muted.
            console.log("Video autoplay prevented");
        });
    }
  }, [stepIndex, course.steps]);

  // Handle Video Play/Pause Sync
  useEffect(() => {
    if (videoRef.current) {
        if (isPlaying) {
            videoRef.current.play().catch(e => console.log("Play error", e));
        } else {
            videoRef.current.pause();
        }
    }
  }, [isPlaying]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const handleNext = () => {
    if (stepIndex < course.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete();
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const totalSteps = course.steps.length;
  // Progress bar for the whole workout
  const totalProgress = ((stepIndex) / totalSteps) * 100;
  
  // Circle progress for the CURRENT step
  const currentStepDuration = currentStep.duration;
  // r=56, circumference = 2 * pi * 56 ≈ 352
  const circumference = 352;
  const strokeDashoffset = circumference - (timeLeft / currentStepDuration) * circumference;

  return (
    <div className="flex flex-col h-screen bg-white pb-24">
      {/* Navbar with Safe Area */}
      <div 
        className="flex items-center px-4 border-b border-gray-100 z-10 bg-white/80 backdrop-blur-md sticky top-0"
        style={{ 
            height: 'calc(4rem + env(safe-area-inset-top))', 
            paddingTop: 'env(safe-area-inset-top)' 
        }}
      >
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft />
        </button>
        <span className="font-bold text-lg text-gray-800 ml-2 truncate">{course.title}</span>
      </div>

      {/* Visual Area */}
      <div className="relative w-full aspect-square bg-pink-50 flex items-center justify-center overflow-hidden">
        {/* Render Video if available, else Image */}
        {currentStep.videoUrl ? (
            <video 
                ref={videoRef}
                src={currentStep.videoUrl}
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-110' : 'scale-100 grayscale-[10%]'}`}
            />
        ) : (
            <img 
              src={course.image} 
              alt="Exercise" 
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-110' : 'scale-100 grayscale-[30%]'}`} 
            />
        )}
        
        {/* Overlay Gradient (Darker at bottom for text, lighter in middle) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

        {/* Central Timer / Breathing Animation */}
        <div className="relative z-10 flex flex-col items-center justify-center">
             {/* Breathing Ring */}
             <div className={`relative flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${isPlaying ? 'scale-105' : 'scale-100'}`}>
                {/* SVG Progress Circle */}
                <svg className="w-56 h-56 -rotate-90 transform" viewBox="0 0 120 120">
                    {/* Background track */}
                    <circle cx="60" cy="60" r="56" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                    {/* Active progress */}
                    <circle 
                        cx="60" cy="60" r="56" 
                        stroke="#ec4899" 
                        strokeWidth="4" 
                        fill="none" 
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>
                
                {/* Timer Text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col text-white drop-shadow-lg p-6 text-center">
                    <span className="text-6xl font-bold font-mono tracking-tighter mb-1">
                        {timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </span>
                    <span className="text-xs uppercase tracking-widest font-medium opacity-80">
                        Seconds
                    </span>
                </div>
             </div>
        </div>
        
        {/* Current Step Title Overlay on Image/Video */}
        <div className="absolute bottom-6 w-full px-6 text-center z-20">
             <h2 className="text-white text-2xl font-bold tracking-wide drop-shadow-md">{currentStep.title}</h2>
        </div>
      </div>

      {/* Details / Controls Area */}
      <div className="flex-1 flex flex-col p-6 bg-white rounded-t-3xl -mt-4 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="mb-4 flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>Step {stepIndex + 1} / {totalSteps}</span>
            <span>{currentStep.duration}s</span>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar mb-6">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {currentStep.description}
            </p>
        </div>

        {/* Progress Bar (Total Workout) */}
        <div className="w-full h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-pink-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${totalProgress}%` }}></div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center space-x-10 mt-auto">
            <button 
                onClick={togglePlay}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl shadow-pink-200 transition-all active:scale-95 ${
                    isPlaying 
                    ? 'bg-white text-gray-800 border-2 border-gray-100' 
                    : 'bg-pink-500 text-white'
                }`}
            >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>

            <button 
                onClick={handleNext}
                className="w-14 h-14 bg-gray-50 rounded-full text-gray-600 flex items-center justify-center active:bg-gray-100 hover:bg-gray-100 transition-colors"
            >
                <FastForward size={24} />
            </button>
        </div>
      </div>
    </div>
  );
};