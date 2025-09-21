import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-base-100 rounded-2xl shadow-lg border border-slate-200/60 p-6 ${className}`}>
      {title && <h3 className="text-xl font-semibold text-neutral tracking-tight mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;