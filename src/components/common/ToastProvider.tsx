import React from 'react';
import Toast from './Toast';
import { useToastStore } from '../../stores/toastStore';

const ToastProvider: React.FC = () => {
  const { visible, type, title, message, duration, hideToast } = useToastStore();

  return (
    <Toast
      visible={visible}
      type={type}
      title={title}
      message={message}
      duration={duration}
      onHide={hideToast}
    />
  );
};

export default ToastProvider;