import React, { useRef, useState, useCallback, useEffect } from 'react';
import { RotateCcw, Check, X, ArrowRight, Camera as CameraIcon } from 'lucide-react';

interface CameraViewProps {
  onCapture: (images: { front: string; side: string }) => void;
  onCancel: () => void;
}

type CaptureStep = 'FRONT' | 'SIDE' | 'REVIEW';

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [step, setStep] = useState<CaptureStep>('FRONT');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setError('Unable to access camera. Please allow permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const capture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Flip horizontally for mirror effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        if (step === 'FRONT') {
            setFrontImage(dataUrl);
            setStep('SIDE');
        } else if (step === 'SIDE') {
            setSideImage(dataUrl);
            setStep('REVIEW');
        }
      }
    }
  }, [step]);

  const retakeAll = () => {
    setFrontImage(null);
    setSideImage(null);
    setStep('FRONT');
  };

  const save = () => {
    if (frontImage && sideImage) {
      onCapture({ front: frontImage, side: sideImage });
    }
  };

  // --- Silhouette Overlays ---

  const FrontSilhouette = () => (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
        <svg viewBox="0 0 100 150" className="w-full h-full" preserveAspectRatio="none">
            {/* Head */}
            <ellipse cx="50" cy="50" rx="22" ry="30" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" />
            {/* Shoulders */}
            <path d="M 15 150 Q 25 90 50 90 Q 75 90 85 150" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>
        <div className="absolute top-24 bg-black/40 px-4 py-1 rounded-full text-white text-sm font-medium backdrop-blur-sm">
            Step 1: 正面 (对准轮廓)
        </div>
    </div>
  );

  const SideSilhouette = () => (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
        <svg viewBox="0 0 100 150" className="w-full h-full" preserveAspectRatio="none">
             {/* Side Profile Guide (Looking Right) */}
            <path d="M 50 20 C 70 20, 75 40, 75 55 C 75 70, 60 80, 50 80" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" />
             {/* Jawline/Neck */}
            <path d="M 50 80 L 45 100" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" />
            {/* Shoulder */}
            <path d="M 20 150 Q 30 100 45 100 Q 70 100 80 150" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>
        <div className="absolute top-24 bg-black/40 px-4 py-1 rounded-full text-white text-sm font-medium backdrop-blur-sm">
            Step 2: 右侧面 (展示下颌线)
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div 
        className="absolute top-0 w-full p-4 flex justify-between items-center z-10 text-white bg-gradient-to-b from-black/50 to-transparent"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <button onClick={onCancel} className="p-2 bg-white/10 rounded-full backdrop-blur-md"><X size={20} /></button>
        <span className="font-semibold text-base tracking-wide">
            {step === 'REVIEW' ? 'Check-in Preview' : 'Daily Record'}
        </span>
        <div className="w-9"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6">
            <p>{error}</p>
            <button className="mt-4 bg-pink-500 px-4 py-2 rounded-full" onClick={onCancel}>Close</button>
          </div>
        ) : (
          <>
            {step !== 'REVIEW' ? (
              // --- Camera Feed ---
              <div className="relative w-full h-full">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {step === 'FRONT' && <FrontSilhouette />}
                  {step === 'SIDE' && <SideSilhouette />}
              </div>
            ) : (
              // --- Review Screen ---
              <div className="w-full h-full flex flex-col pt-20 pb-8 px-4 space-y-4">
                  <div className="flex-1 flex flex-col space-y-4 justify-center">
                    <div className="relative flex-1 bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                        <img src={frontImage!} alt="Front" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded">FRONT</span>
                    </div>
                    <div className="relative flex-1 bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                        <img src={sideImage!} alt="Side" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded">SIDE</span>
                    </div>
                  </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* Controls */}
      <div 
        className="bg-black flex items-center justify-center pb-6 pt-4"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        {step !== 'REVIEW' ? (
          // Capture Button
          <div className="flex flex-col items-center space-y-3">
              <button 
                onClick={capture}
                className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center bg-transparent active:scale-95 transition-all"
              >
                <div className="w-16 h-16 bg-white rounded-full"></div>
              </button>
              <span className="text-gray-400 text-xs uppercase tracking-widest">
                  {step === 'FRONT' ? 'Tap for Front' : 'Tap for Side'}
              </span>
          </div>
        ) : (
          // Review Buttons
          <div className="flex items-center space-x-12 w-full justify-center px-8">
            <button onClick={retakeAll} className="flex flex-col items-center text-gray-300 hover:text-white space-y-2 group">
              <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                  <RotateCcw size={22} />
              </div>
              <span className="text-xs font-medium">Retake All</span>
            </button>

            <button onClick={save} className="flex flex-col items-center text-white space-y-2 group">
              <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-900/50 group-hover:bg-pink-400 transition-colors">
                   <Check size={32} />
              </div>
              <span className="text-xs font-medium">Save & Done</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};