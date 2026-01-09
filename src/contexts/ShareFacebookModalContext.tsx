'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ShareFacebookModal } from '@/components/ShareFacebookModal';

interface ShareFacebookModalContextType {
  showModal: (hideButton?: boolean) => void;
  hideModal: () => void;
  isOpen: boolean;
}

const ShareFacebookModalContext = createContext<
  ShareFacebookModalContextType | undefined
>(undefined);

export function ShareFacebookModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hideButton, setHideButton] = useState(false);

  const showModal = (hideButtonParam: boolean = false) => {
    setHideButton(hideButtonParam);
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
  };

  return (
    <ShareFacebookModalContext.Provider value={{ showModal, hideModal, isOpen }}>
      {children}
      <ShareFacebookModal isOpen={isOpen} onClose={hideModal} hideButton={hideButton} />
    </ShareFacebookModalContext.Provider>
  );
}

export function useShareFacebookModal() {
  const context = useContext(ShareFacebookModalContext);
  if (context === undefined) {
    throw new Error(
      'useShareFacebookModal must be used within a ShareFacebookModalProvider'
    );
  }
  return context;
}

