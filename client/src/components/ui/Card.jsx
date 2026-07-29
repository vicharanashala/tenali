import React from 'react';
import './Card.css';

/**
 * Card component for Tenali.
 * 
 * Supports interactive states (hover animation) and customizable tags.
 */
export default function Card({
  children,
  className = '',
  interactive = false,
  tag: Tag = 'div',
  ...props
}) {
  const cardClass = [
    'tenali-card',
    interactive ? 'tenali-card--interactive' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Tag className={cardClass} {...props}>
      {children}
    </Tag>
  );
}
