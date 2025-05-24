import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = true,
  hover = false,
}) => {
  const classes = [
    'bg-white rounded-lg shadow-sm border border-gray-200',
    padding && 'p-6',
    hover && 'hover:shadow-md transition-shadow',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
};
