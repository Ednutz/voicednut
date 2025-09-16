import React, { useEffect } from 'react';
import { useTelegram } from '../../../hooks/useTelegram';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  const { showBackButton, hideBackButton, hapticFeedback } = useTelegram();

  useEffect(() => {
    if (isOpen) {
      showBackButton(() => {
        hapticFeedback('impact');
        onClose();
      });
    } else {
      hideBackButton();
    }

    return () => {
      hideBackButton();
    };
  }, [isOpen, showBackButton, hideBackButton, hapticFeedback, onClose]);

  if (!isOpen) return null;

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className={`modal-container ${size}`} onClick={e => e.stopPropagation()}>
        <div className='modal-header'>
          <h3 className='modal-title'>{title}</h3>
          <button className='modal-close' onClick={onClose}>
            ✕
          </button>
        </div>
        <div className='modal-content'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
