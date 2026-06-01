import React from 'react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({
  size = 'md',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-primary-500/20 border-t-primary-500 rounded-full animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center p-2.5">
          <img src="/images/logo.png" alt="Yodha Nets" className="w-full h-full object-contain opacity-80" />
        </div>
      </div>
      {text && <p className="text-sm font-medium tracking-widest uppercase text-surface-500 animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
