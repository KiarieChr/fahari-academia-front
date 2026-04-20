// components/StatCardMini.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  CreditCard,
  AlertTriangle,
  UserPlus,
  FileText,
  Bell,
  BookOpen,
  DollarSign,
  BarChart2,
  Clock,
  CheckCircle,
  ClipboardList,
  Repeat,
  ArrowRightLeft
} from 'lucide-react';

// Map icon names to lucide-react components
const iconComponents = {
  'users': Users,
  'user-check': UserCheck,
  'credit-card': CreditCard,
  'alert-triangle': AlertTriangle,
  'user-plus': UserPlus,
  'file-text': FileText,
  'bell': Bell,
  'book': BookOpen,
  'dollar': DollarSign,
  'chart': BarChart2,
  'clock': Clock,
  'check': CheckCircle,
  'clipboard-list': ClipboardList,
  'repeat': Repeat,
  'arrow-right-left': ArrowRightLeft,
};

const StatCardMini = ({
  title,
  value,
  count, // Backend sends 'count' instead of 'value'
  change,
  trend,
  trendLabel,
  icon = 'chart', // Default icon
  color = '#e3f2fd', // Background color
  iconColor = '#3f51b5', // Icon color - darker for visibility
  variant = 'primary'
}) => {
  // Get the icon component
  const IconComponent = typeof icon === 'string' ? iconComponents[icon] : icon;

  // Use count or value (backend sends count)
  const displayValue = count || value;

  return (
    <motion.div
      className="stat-card-mini"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--card-bg, #ffffff)',
        borderRadius: 'var(--border-radius, 12px)',
        padding: '1rem',
        border: '1px solid var(--border-color-light, #e5e7eb)',
        transition: 'all var(--transition-fast, 0.2s)',
        height: '100%',
        minHeight: '100px',
        cursor: 'pointer'
      }}
      whileHover={{
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))'
      }}
    >
      <div
        className="stat-icon"
        style={{
          background: color,
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem'
        }}
      >
        {IconComponent ? <IconComponent size={20} color={iconColor} /> : icon}
      </div>

      <div className="stat-content">
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary, #6b7280)',
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
          color: 'var(--text-main, #1f2937)',
          margin: '0.25rem 0',
          lineHeight: '1.2'
        }}>
          {displayValue}
        </div>

        {(change !== undefined || trend !== undefined) && (
          <div style={{
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginTop: '0.25rem',
            color: (change || trend) > 0 ? '#10b981' : (change || trend) < 0 ? '#ef4444' : '#6b7280'
          }}>
            {(change || trend) > 0 ? '↗' : (change || trend) < 0 ? '↘' : '→'} {Math.abs(change || trend || 0)}%
            <span style={{
              color: 'var(--text-secondary, #6b7280)',
              fontSize: '0.7rem'
            }}>
              {trendLabel || 'from last period'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCardMini;