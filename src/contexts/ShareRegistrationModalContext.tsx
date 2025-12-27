'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ShareRegistrationModal } from '@/app/nhip-song/components/ShareRegistrationModal';

interface ShareRegistrationModalContextType {
  showModal: (mode?: 'login' | 'register') => void;
  hideModal: () => void;
  isOpen: boolean;
}

const ShareRegistrationModalContext = createContext<
  ShareRegistrationModalContextType | undefined
>(undefined);

export function ShareRegistrationModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<'login' | 'register'>('register');

  const showModal = (mode: 'login' | 'register' = 'register') => {
    setInitialMode(mode);
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
  };

  const handleRegister = () => {
    hideModal();
  };

  const handleLogin = () => {
    hideModal();
  };

  return (
    <ShareRegistrationModalContext.Provider value={{ showModal, hideModal, isOpen }}>
      {children}
      <ShareRegistrationModal
        isOpen={isOpen}
        onClose={hideModal}
        onRegister={handleRegister}
        onLogin={handleLogin}
        initialMode={initialMode}
      />
    </ShareRegistrationModalContext.Provider>
  );
}

export function useShareRegistrationModal() {
  const context = useContext(ShareRegistrationModalContext);
  if (context === undefined) {
    throw new Error(
      'useShareRegistrationModal must be used within a ShareRegistrationModalProvider'
    );
  }
  return context;
}

