import React, { useState, useEffect } from 'react';
import { ViewState, Course, SelfieLog, UserProgress } from './types';
import { COURSES, STORAGE_KEYS, MOCK_COMMUNITY_POSTS } from './constants';
import { getDailyYogaTip } from './services/geminiService';
import { TabBar } from './components/TabBar';
import { CameraView } from './components/CameraView';
import { WorkoutView } from './components/WorkoutView';
import { CalendarCheckIn } from './components/CalendarCheckIn';
import { TransformationViewer } from './components/TransformationViewer';
import { Heart, PlayCircle, Share2, Award, Zap, Camera, Trash2, Layers, PlaySquare, Eye, EyeOff } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [selfies, setSelfies] = useState<SelfieLog[]>([]);
  const [dailyTip, setDailyTip] = useState<string>('Loading personalized tip...');
  const [progress, setProgress] = useState<UserProgress>({ streak: 1, totalWorkouts: 4 });
  const [showTransformation, setShowTransformation] = useState(false);
  const [galleryMode, setGalleryMode] = useState<'front' | 'side'>('front');

  // Load data on mount
  useEffect(() => {
    const savedSelfies = localStorage.getItem(STORAGE_KEYS.SELFIES);
    if (savedSelfies) {
      setSelfies(JSON.parse(savedSelfies));
    }
    
    // Get AI tip
    getDailyYogaTip().then(setDailyTip);
  }, []);

  const handleStartWorkout = (course: Course) => {
    setActiveCourse(course);
    setView(ViewState.WORKOUT);
  };

  const handleWorkoutComplete = () => {
    // Transition to camera for check-in
    setView(ViewState.CAMERA);
  };

  const handleSelfieCaptured = (images: { front: string, side: string }) => {
    const newSelfie: SelfieLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      images: images,
      courseId: activeCourse?.id || 'unknown'
    };
    
    const updatedSelfies = [newSelfie, ...selfies];
    setSelfies(updatedSelfies);
    saveSelfies(updatedSelfies);
    
    // Update progress mock
    setProgress(prev => ({ ...prev, totalWorkouts: prev.totalWorkouts + 1 }));

    // Back to home or gallery
    setActiveCourse(null);
    setView(ViewState.GALLERY);
  };

  const handleDeleteSelfie = (id: string) => {
    if (confirm('Delete this record?')) {
        const updatedSelfies = selfies.filter(s => s.id !== id);
        setSelfies(updatedSelfies);
        saveSelfies(updatedSelfies);
    }
  };

  const saveSelfies = (data: SelfieLog[]) => {
    try {
        localStorage.setItem(STORAGE_KEYS.SELFIES, JSON.stringify(data));
    } catch (e) {
        console.warn("Storage full or error", e);
        alert("Gallery is full! Oldest photos might not be saved.");
    }
  };

  // --- RENDER VIEWS ---

  const renderHome = () => {
    const categories = [
      { id: 'zone', title: '分区精修', subtitle: '眼周 · 中面部 · 下颌线' },
      { id: 'problem', title: '痛点改善', subtitle: '微笑唇 · 额头纹 · 咬肌' },
      { id: 'scenario', title: '生活场景', subtitle: '早安唤醒 · 午间放松 · 晚间修护' }
    ];

    // Extract dates for calendar
    const completedDates = selfies.map(s => s.date);

    return (
      <div className="pb-24 px-4 pt-12">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Hello, Beautiful</h1>
          <p className="text-gray-500 mt-1">今天也要坚持变美哦</p>
        </header>

        {/* New Calendar Section */}
        <CalendarCheckIn completedDates={completedDates} />

        {/* Small AI Tip Bar */}
        <div className="bg-pink-100 rounded-xl p-3 mb-8 flex items-start space-x-3">
            <Zap size={16} className="text-pink-500 mt-1 shrink-0" />
            <div>
                 <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider block">AI Daily Tip</span>
                 <p className="text-sm text-pink-900 font-medium leading-tight">"{dailyTip}"</p>
            </div>
        </div>

        {categories.map((cat) => (
          <div key={cat.id} className="mb-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">{cat.title}</h2>
              <span className="text-xs text-gray-400 font-medium">{cat.subtitle}</span>
            </div>
            
            <div className="space-y-4">
              {COURSES.filter(c => c.category === cat.id).map(course => (
                <div 
                  key={course.id}
                  onClick={() => handleStartWorkout(course)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4 active:scale-98 transition-transform cursor-pointer"
                >
                  <img src={course.image} alt={course.title} className="w-20 h-20 rounded-xl object-cover bg-gray-100" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{course.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{course.description}</p>
                    <div className="flex items-center mt-2 text-pink-500 text-sm font-medium">
                      <PlayCircle size={16} className="mr-1" />
                      {course.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGallery = () => (
    <div className="pb-24 px-4 pt-12">
      <header className="mb-6">
        <div className="flex justify-between items-end mb-4">
          <div>
              <h1 className="text-3xl font-bold text-gray-900">Progress</h1>
              <p className="text-gray-500 mt-1">{selfies.length} records so far</p>
          </div>
          
          {/* Play Transformation Button */}
          {selfies.length > 1 && (
              <button 
                  onClick={() => setShowTransformation(true)}
                  className="flex items-center space-x-2 bg-pink-500 text-white px-4 py-2 rounded-full shadow-lg shadow-pink-200 active:scale-95 transition-transform"
              >
                  <PlaySquare size={16} fill="currentColor" />
                  <span className="text-xs font-bold">对比变化</span>
              </button>
          )}
        </div>

        {/* View Toggle */}
        <div className="bg-gray-100 p-1 rounded-xl flex">
            <button 
                onClick={() => setGalleryMode('front')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    galleryMode === 'front' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Eye size={16} />
                <span>正脸</span>
            </button>
            <button 
                onClick={() => setGalleryMode('side')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    galleryMode === 'side' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Layers size={16} />
                <span>侧脸</span>
            </button>
        </div>
      </header>

      {selfies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Camera size={32} />
            </div>
            <p>No check-ins yet.</p>
            <button 
                onClick={() => setView(ViewState.HOME)}
                className="mt-4 text-pink-500 font-medium"
            >
                Start a workout
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {selfies.map((selfie) => {
            // Backward compatibility and mode logic
            let displayImage: string | undefined;
            if (galleryMode === 'front') {
                displayImage = selfie.images?.front || selfie.imageData;
            } else {
                displayImage = selfie.images?.side;
            }
            
            // If in side mode but no side image, we can show front image dimmed or a placeholder
            // For now, let's show a "missing" state if explicit side view is requested but missing
            const isMissingSide = galleryMode === 'side' && !displayImage;
            
            return (
              <div key={selfie.id} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shadow-sm group">
                {isMissingSide ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                        <EyeOff size={24} className="mb-2" />
                        <span className="text-[10px]">No side view</span>
                        {/* Optional: Show front blurred in background */}
                        { (selfie.images?.front || selfie.imageData) && 
                            <img src={selfie.images?.front || selfie.imageData} className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm" /> 
                        }
                    </div>
                ) : (
                    <img src={displayImage || ''} alt="Check-in" className="w-full h-full object-cover" />
                )}

                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 flex justify-between items-end">
                  <p className="text-white text-xs font-medium">
                      {new Date(selfie.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                  <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteSelfie(selfie.id); }}
                      className="text-white/70 hover:text-white bg-black/20 p-1.5 rounded-full backdrop-blur-sm"
                  >
                      <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Time Lapse Viewer Modal */}
      {showTransformation && (
          <TransformationViewer 
            selfies={selfies} 
            onClose={() => setShowTransformation(false)} 
            initialMode={galleryMode}
          />
      )}
    </div>
  );

  const renderCommunity = () => (
    <div className="pb-24 px-4 pt-12">
       <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Community</h1>
        <p className="text-gray-500 mt-1">Join 12k+ glowing faces</p>
      </header>

      <div className="space-y-6">
        {MOCK_COMMUNITY_POSTS.map(post => (
          <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-4 flex items-center space-x-3">
                <img src={post.avatar} alt={post.username} className="w-10 h-10 rounded-full" />
                <div>
                    <h4 className="font-bold text-sm text-gray-900">{post.username}</h4>
                    <p className="text-xs text-gray-500">{post.timeAgo}</p>
                </div>
            </div>
            <img src={post.image} alt="Post" className="w-full h-64 object-cover" />
            <div className="p-4">
                <p className="text-gray-700 text-sm mb-3">{post.message}</p>
                <div className="flex items-center space-x-6 text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-pink-500 transition-colors">
                        <Heart size={20} />
                        <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
                        <Share2 size={20} />
                        <span className="text-sm font-medium">Share</span>
                    </button>
                </div>
            </div>
          </div>
        ))}
        <div className="text-center py-4 text-gray-400 text-sm">
            You've caught up!
        </div>
      </div>
    </div>
  );

  // --- MAIN RENDER SWITCH ---

  if (view === ViewState.CAMERA) {
    return <CameraView onCapture={handleSelfieCaptured} onCancel={() => setView(ViewState.HOME)} />;
  }

  if (view === ViewState.WORKOUT && activeCourse) {
    return (
      <WorkoutView 
        course={activeCourse} 
        onComplete={handleWorkoutComplete} 
        onBack={() => setView(ViewState.HOME)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-pink-50/50 font-sans text-gray-900">
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        {view === ViewState.HOME && renderHome()}
        {view === ViewState.GALLERY && renderGallery()}
        {view === ViewState.COMMUNITY && renderCommunity()}
        
        <TabBar currentView={view} setView={setView} />
      </main>
    </div>
  );
};

export default App;