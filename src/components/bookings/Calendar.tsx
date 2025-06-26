'use client';

import { useState } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/Button';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

export function Calendar({ onDateSelect, selectedDate }: CalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };
  
  const prevWeek = () => {
    const prevWeekStart = subWeeks(currentWeekStart, 1);
    // Don't allow going to past weeks
    if (prevWeekStart >= startOfWeek(new Date(), { weekStartsOn: 1 })) {
      setCurrentWeekStart(prevWeekStart);
    }
  };
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Select Date</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevWeek}
            className="px-2 py-1"
          >
            &lt; Prev
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextWeek}
            className="px-2 py-1"
          >
            Next &gt;
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`
                p-2 text-center rounded-md transition-colors
                ${isToday ? 'bg-blue-100 text-blue-800' : ''}
                ${isSelected ? 'bg-blue-600 text-white' : ''}
                ${!isToday && !isSelected ? 'hover:bg-gray-100' : ''}
              `}
            >
              <div className="text-xs font-medium">{format(day, 'EEE')}</div>
              <div className="text-sm">{format(day, 'd')}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
