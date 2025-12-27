'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { JoinChallengeModal } from '@/components/JoinChallengeModal';

interface JoinChallengeModalContextType {
  showModal: () => void;
  hideModal: () => void;
  isOpen: boolean;
}

const JoinChallengeModalContext = createContext<
  JoinChallengeModalContextType | undefined
>(undefined);

export function JoinChallengeModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const showModal = () => {
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
  };

  return (
    <JoinChallengeModalContext.Provider value={{ showModal, hideModal, isOpen }}>
      {children}
      <JoinChallengeModal isOpen={isOpen} onClose={hideModal} />
    </JoinChallengeModalContext.Provider>
  );
}

export function useJoinChallengeModal() {
  const context = useContext(JoinChallengeModalContext);
  if (context === undefined) {
    throw new Error(
      'useJoinChallengeModal must be used within a JoinChallengeModalProvider'
    );
  }
  return context;
}

