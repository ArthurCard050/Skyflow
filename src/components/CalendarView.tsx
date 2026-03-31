import { useState } from 'react';
import { Post } from '../types';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface CalendarViewProps {
  posts: Post[];
  onPostClick: (postId: string) => void;
  onDayClick?: (date: string) => void;
}

export function CalendarView({ posts, onPostClick, onDayClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  // Add empty days for start of month padding
  const startPadding = Array(getDay(firstDayOfMonth)).fill(null);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/40 dark:border-gray-700/50 overflow-hidden transition-colors">
      <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium text-sky-600 dark:text-sky-400 px-3 py-1 hover:bg-sky-50/50 dark:hover:bg-sky-900/20 rounded-md transition-colors">
            Hoje
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[120px]">
        {startPadding.map((_, i) => (
          <div key={`padding-${i}`} className="border-b border-r border-gray-200 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/10" />
        ))}
        
        {days.map(day => {
          const dayPosts = posts.filter(post => isSameDay(new Date(post.date), day));
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={day.toString()} 
              className={cn(
                "border-b border-r border-gray-200 dark:border-gray-700/50 p-2 transition-colors hover:bg-white/40 dark:hover:bg-gray-800/40 group relative",
                isToday && "bg-sky-50/30 dark:bg-sky-900/10"
              )}
              onClick={() => onDayClick && onDayClick(format(day, 'yyyy-MM-dd'))}
              style={{ cursor: onDayClick ? 'pointer' : 'default' }}
            >
              <span className={cn(
                "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                isToday ? "bg-sky-600 text-white" : "text-gray-700 dark:text-gray-300"
              )}>
                {format(day, 'd')}
              </span>

              <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                {dayPosts.map(post => (
                  <button 
                    key={post.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPostClick(post.id);
                    }}
                    className={cn(
                      "w-full text-left text-[10px] px-1.5 py-1 rounded border truncate font-medium flex items-center gap-1 transition-transform hover:scale-105",
                      post.status.includes('approved') && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800",
                      (post.status.includes('production') || post.status.includes('sent') || post.status === 'scheduling') && "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-100 dark:border-sky-800",
                      post.status.includes('changes') && "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800",
                      post.status === 'published' && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800"
                    )}
                  >
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full flex-shrink-0",
                      post.status.includes('approved') && "bg-green-500",
                      (post.status.includes('production') || post.status.includes('sent') || post.status === 'scheduling') && "bg-sky-500",
                      post.status.includes('changes') && "bg-orange-500",
                      post.status === 'published' && "bg-blue-500"
                    )} />
                    {post.platform}{post.format && <span className="text-[9px] opacity-75 font-normal ml-0.5">&bull; {post.format}</span>}
                  </button>
                ))}
              </div>
              
              {/* Add button on hover */}
              <button
                onClick={(e) => { e.stopPropagation(); onDayClick && onDayClick(format(day, 'yyyy-MM-dd')); }}
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-sky-100 dark:hover:bg-sky-900/30 rounded text-sky-400 dark:text-sky-500 transition-all"
                title="Adicionar post neste dia"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
