// components/StatCardMini.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Import icons - you can change these to your actual icon components
const IconWrapper = ({ children, color }) => (
  <div style={{ color }}>{children}</div>
);

// Define icon components or use strings/emojis
const UsersIcon = () => <IconWrapper>👥</IconWrapper>;
const BookIcon = () => <IconWrapper>📚</IconWrapper>;
const DollarIcon = () => <IconWrapper>💰</IconWrapper>;
const ChartIcon = () => <IconWrapper>📈</IconWrapper>;
const ClockIcon = () => <IconWrapper>⏰</IconWrapper>;
const CheckIcon = () => <IconWrapper>✅</IconWrapper>;

// Map icon names to components
const iconComponents = {
  users: UsersIcon,
  book: BookIcon,
  dollar: DollarIcon,
  chart: ChartIcon,
  clock: ClockIcon,
  check: CheckIcon,
  // Add more icons as needed
};

const StatCardMini = ({ 
  title, 
  value, 
  change, 
  icon = 'chart', // Default icon
  color = '#3f51b5',
  variant = 'primary'
}) => {
  // Get the icon component
  const IconComponent = typeof icon === 'string' ? iconComponents[icon] : icon;
  
  const getIconColor = () => {
    if (variant === 'secondary') return '#64748b';
    if (variant === 'compact') return '#94a3b8';
    return '#ffffff';
  };
  
  const getBgColor = () => {
    if (variant === 'secondary') return 'rgba(100, 116, 139, 0.1)';
    if (variant === 'compact') return 'rgba(148, 163, 184, 0.05)';
    return `rgba(63, 81, 181, 0.1)`;
  };

  return (
    <motion.div 
      className="stat-card-mini"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--card-bg)',
        borderRadius: 'var(--border-radius)',
        padding: '1rem',
        border: '1px solid var(--border-color-light)',
        transition: 'all var(--transition-fast)',
        height: '100%',
        minHeight: '100px',
        cursor: 'pointer'
      }}
      whileHover={{ 
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <div 
        className="stat-icon"
        style={{ 
          background: getBgColor(),
          color: color,
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem'
        }}
      >
        {IconComponent ? <IconComponent size={20} color={getIconColor()} /> : icon}
      </div>
      
      <div className="stat-content">
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          marginBottom: '0.25rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--text-main)',
          margin: '0.25rem 0',
          lineHeight: '1.2'
        }}>
          {value}
        </div>
        
        {change !== undefined && (
          <div style={{ 
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginTop: '0.25rem',
            color: change > 0 ? '#10b981' : '#ef4444'
          }}>
            {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
            <span style={{ 
              color: 'var(--text-secondary)',
              fontSize: '0.7rem'
            }}>
              from last period
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCardMini;