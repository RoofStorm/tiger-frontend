'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Notification } from '@/types';

export type PopupType = 'DAILY_LOGIN' | 'MONTHLY_RANK_WIN';

export interface MonthlyRankWinPayload extends Notification {
  metadata: {
    rank: number;
    month: string;
  };
}

export interface DailyLoginPayload {
  points: number;
  notificationId?: string;
}

export type PopupItem = 
  | { type: 'DAILY_LOGIN'; priority: number; payload: DailyLoginPayload }
  | { type: 'MONTHLY_RANK_WIN'; priority: number; payload: MonthlyRankWinPayload };

interface PopupContextType {
  enqueue: (item: PopupItem) => void;
  currentPopup: PopupItem | null;
  closeCurrent: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<PopupItem[]>([]);
  const [currentPopup, setCurrentPopup] = useState<PopupItem | null>(null);

  const enqueue = useCallback((item: PopupItem) => {
    setQueue(prev => {
      // Check if this specific item is already in queue or currently showing
      const isDuplicate = prev.some(p => p.type === item.type && JSON.stringify(p.payload) === JSON.stringify(item.payload)) ||
                         (currentPopup?.type === item.type && JSON.stringify(currentPopup.payload) === JSON.stringify(item.payload));
      
      if (isDuplicate) return prev;

      const newQueue = [...prev, item].sort((a, b) => b.priority - a.priority);
      return newQueue;
    });
  }, [currentPopup]);

  const closeCurrent = useCallback(() => {
    setCurrentPopup(null);
  }, []);

  // Effect to process the queue
  useEffect(() => {
    if (!currentPopup && queue.length > 0) {
      const next = queue[0];
      setCurrentPopup(next);
      setQueue(prev => prev.slice(1));
    }
  }, [currentPopup, queue]);

  return (
    <PopupContext.Provider value={{ enqueue, currentPopup, closeCurrent }}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}

