import React, { useMemo } from 'react';
import { Flame, Check, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarCheckInProps {
  completedDates: string[]; // Array of ISO date strings
}

export const CalendarCheckIn: React.FC<CalendarCheckInProps> = ({ completedDates }) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // Helper: Format date to YYYY-MM-DD for easy string comparison
  const toDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const todayStr = toDateString(today);
  
  // Create a Set of completed dates (normalized to local YYYY-MM-DD)
  const completedSet = useMemo(() => {
    return new Set(completedDates.map(d => toDateString(new Date(d))));
  }, [completedDates]);

  // --- Streak Calculation Logic ---
  const currentStreak = useMemo(() => {
    let streak = 0;
    // Check backwards from today
    let checkDate = new Date(today);
    
    // If today is not done, we start checking from yesterday for the "current active streak"
    // However, if today IS done, we count it.
    if (!completedSet.has(toDateString(checkDate))) {
       checkDate.setDate(checkDate.getDate() - 1);
       // If yesterday is also missing, streak is 0
       if (!completedSet.has(toDateString(checkDate))) return 0;
    }

    while (true) {
      const dateStr = toDateString(checkDate);
      if (completedSet.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [completedSet, todayStr]);

  // --- Calendar Grid Generation ---
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const days = [];
  // Padding for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isTodayDone = completedSet.has(todayStr);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-8">
      {/* Header with Streak */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">坚持打卡</h2>
          <p className="text-xs text-gray-400 mt-1">
             {isTodayDone ? "今天已完成，真棒！" : "今天还没有打卡哦"}
          </p>
        </div>
        
        <div className={`flex flex-col items-center justify-center p-2 rounded-2xl min-w-[70px] transition-all duration-500 ${currentStreak > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
            <div className={`relative ${currentStreak > 0 ? 'animate-bounce' : ''}`}>
                <Flame 
                    size={24} 
                    className={`${currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} 
                />
                {currentStreak > 0 && (
                     <div className="absolute top-0 left-0 w-full h-full bg-orange-400 blur-lg opacity-40 animate-pulse"></div>
                )}
            </div>
            <span className={`text-sm font-bold mt-1 ${currentStreak > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                {currentStreak} 天
            </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full">
        {/* Weekday Labels */}
        <div className="grid grid-cols-7 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-gray-400 font-medium">
                    {d}
                </div>
            ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-3 gap-x-1">
            {days.map((day, index) => {
                if (day === null) return <div key={`empty-${index}`} />;

                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isCompleted = completedSet.has(dateStr);
                const isToday = dateStr === todayStr;
                
                return (
                    <div key={day} className="flex flex-col items-center justify-center">
                        <div 
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                                ${isCompleted 
                                    ? 'bg-pink-500 text-white shadow-md shadow-pink-200 scale-105' 
                                    : isToday 
                                        ? 'bg-white border-2 border-pink-200 text-pink-500' 
                                        : 'text-gray-400 hover:bg-gray-50'
                                }
                            `}
                        >
                            {isCompleted ? <Check size={14} strokeWidth={4} /> : day}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};