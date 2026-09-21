import React from 'react';

interface GoogleLoginButtonProps {
  onLogin?: () => void;
  isAuthenticated?: boolean;
}

const API_BASE = 'http://localhost:3000';

export default function GoogleLoginButton({
  onLogin,
  isAuthenticated = false,
}: GoogleLoginButtonProps) {
  const handleLogin = () => {
    if (onLogin) {
      onLogin();
      return;
    }

    window.location.href = `${API_BASE}/auth/google`;
  };

  if (isAuthenticated) {
    return (
      <button
        type="button"
        className="google-login-button authenticated"
        disabled
      >
        ✓ Google Drive Connected
      </button>
    );
  }

  return (
    <button
      type="button"
      className="google-login-button"
      onClick={handleLogin}
    >
      <span className="google-icon">G</span>
      Connect Google Drive
    </button>
  );
}