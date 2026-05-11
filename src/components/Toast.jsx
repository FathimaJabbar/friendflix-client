import React, { useEffect } from "react";
import "./Toast.css";

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto close after 4 seconds
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="toast-notification glass-panel" onClick={onClose}>
      <div className="toast-content">
        <div className="toast-icon">🔔</div>
        <div className="toast-text">
          <h4>New Message</h4>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Toast;
