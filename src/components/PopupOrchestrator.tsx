'use client';

import { usePopup } from '@/contexts/PopupContext';
import { DailyLoginModal } from './DailyLoginModal';
import { MonthlyRankWinModal } from './MonthlyRankWinModal';
import { useNotifications } from '@/contexts/NotificationContext';

export function PopupOrchestrator() {
  const { currentPopup, closeCurrent } = usePopup();
  const { markAsRead } = useNotifications();

  if (!currentPopup) return null;

  const handleClose = async () => {
    if (currentPopup.type === 'MONTHLY_RANK_WIN' && currentPopup.payload.id) {
      await markAsRead(currentPopup.payload.id);
    } else if (currentPopup.type === 'DAILY_LOGIN' && currentPopup.payload.notificationId) {
      await markAsRead(currentPopup.payload.notificationId);
    }
    closeCurrent();
  };

  switch (currentPopup.type) {
    case 'DAILY_LOGIN':
      return (
        <DailyLoginModal
          isOpen={true}
          onClose={handleClose}
        />
      );
    case 'MONTHLY_RANK_WIN':
      return (
        <MonthlyRankWinModal
          isOpen={true}
          onClose={handleClose}
          rank={currentPopup.payload.metadata?.rank}
          month={currentPopup.payload.metadata?.month}
          notificationId={currentPopup.payload.id}
        />
      );
    default:
      return null;
  }
}

