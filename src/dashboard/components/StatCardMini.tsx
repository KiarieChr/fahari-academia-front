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

const getTheme = (color) => {
  const normalized = (color || '').toLowerCase();

  // Emerald / Green theme
  if (normalized === '#e8f5e9' || normalized === '#10b981' || normalized === 'green' || normalized === 'emerald' || normalized.includes('green') || normalized.includes('emerald') || normalized.includes('teal')) {
    return {
      borderColor: '#10b981',
      iconBgColor: 'rgba(16,185,129,0.10)',
      iconTextColor: '#059669',
      glowColor: 'rgba(16,185,129,0.08)',
      trendColor: '#10b981',
    };
  }

  // Orange / Amber theme
  if (normalized === '#fff3e0' || normalized === '#f59e0b' || normalized === 'orange' || normalized === 'amber' || normalized.includes('orange') || normalized.includes('amber') || normalized.includes('yellow')) {
    return {
      borderColor: '#f59e0b',
      iconBgColor: 'rgba(245,158,11,0.10)',
      iconTextColor: '#d97706',
      glowColor: 'rgba(245,158,11,0.08)',
      trendColor: '#f59e0b',
    };
  }

  // Purple / Violet theme
  if (normalized === '#f3e5f5' || normalized === '#8b5cf6' || normalized === 'purple' || normalized === 'violet' || normalized.includes('purple') || normalized.includes('violet') || normalized.includes('fuchsia')) {
    return {
      borderColor: '#8b5cf6',
      iconBgColor: 'rgba(139,92,246,0.10)',
      iconTextColor: '#7c3aed',
      glowColor: 'rgba(139,92,246,0.08)',
      trendColor: '#8b5cf6',
    };
  }

  // Red / Rose theme
  if (normalized === '#ffebee' || normalized === '#ef4444' || normalized === '#f43f5e' || normalized === 'red' || normalized === 'rose' || normalized.includes('red') || normalized.includes('rose')) {
    return {
      borderColor: '#ef4444',
      iconBgColor: 'rgba(239,68,68,0.10)',
      iconTextColor: '#dc2626',
      glowColor: 'rgba(239,68,68,0.08)',
      trendColor: '#ef4444',
    };
  }

  // Default / Blue — uses the CSS-variable primary colour so it follows the active theme
  return {
    borderColor: 'var(--primary-color)',
    iconBgColor: 'rgba(63,81,181,0.08)',
    iconTextColor: 'var(--primary-color)',
    glowColor: 'rgba(63,81,181,0.06)',
    trendColor: 'var(--primary-color)',
  };
};

const StatCardMini = ({
  title,
  value,
  count,
  change,
  trend,
  trendLabel,
  icon = 'chart',
  color = '#3b82f6',
}) => {
  const IconComponent = typeof icon === 'string' ? iconComponents[icon] : icon;
  const displayValue = count || value;

  const isPositive = (change || trend || 0) > 0;
  const hasChange = change !== undefined || trend !== undefined;
  const theme = getTheme(color);

  // Helper to render the badge pill aligned with the value
  const renderBadge = () => {
    if (hasChange) {
      const val = Math.abs(change || trend || 0);
      const sign = isPositive ? '+' : '-';
      return (
        <span
          style={{
            background: isPositive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            color: isPositive ? '#10b981' : '#ef4444'
          }}
          className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide shadow-sm"
        >
          {sign}{val}% {trendLabel && <span className="opacity-90 font-medium ml-0.5">{trendLabel}</span>}
        </span>
      );
    }

    if (trendLabel) {
      // If trendLabel starts with a number or percentage like "64.6% rate", format it nicely
      const percentMatch = trendLabel.match(/^(\d+(?:\.\d+)?%?)\s+(.*)$/);
      if (percentMatch) {
        const [, numPart, textPart] = percentMatch;
        return (
          <span
            style={{
              background: theme.iconBgColor,
              color: theme.iconTextColor
            }}
            className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide shadow-sm"
          >
            {numPart} <span className="opacity-90 font-medium ml-0.5">{textPart}</span>
          </span>
        );
      }

      // Neutral label fallback pill
      return (
        <span
          style={{
            background: 'var(--bg-light)',
            color: 'var(--text-secondary)'
          }}
          className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide shadow-sm"
        >
          {trendLabel}
        </span>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color-light)',
        boxShadow: 'var(--shadow-card)',
      }}
      className="group relative flex flex-col justify-between p-4 pl-5 sm:p-5 sm:pl-6 rounded-[16px] sm:rounded-[20px] transition-all duration-300 h-full min-h-[95px] sm:min-h-[105px] overflow-hidden"
    >
      {/* Left accent border bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-300 group-hover:w-[6px]"
        style={{ background: theme.borderColor }}
      />

      {/* Subtle color glow in top-right corner */}
      <div
        className="absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:scale-150 transition-transform duration-700"
        style={{ background: theme.glowColor }}
      />

      {/* Top Row: Icon + Label (horizontal flow) */}
      <div className="flex items-center gap-2.5 w-full relative z-10">
        <div
          className="flex-shrink-0 w-7.5 h-7.5 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ background: theme.iconBgColor }}
        >
          {IconComponent && (
            <IconComponent
              className="w-4 h-4"
              size={15}
              style={{ color: theme.iconTextColor }}
              strokeWidth={2.5}
            />
          )}
        </div>
        <h3
          className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-tight mt-0.5 break-words flex-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          {displayValue}
        </h3>
      </div>

      {/* Bottom Row: Value + Pill Badge (flexible wrapping for narrow containers) */}
      <div className="flex items-center justify-between gap-2 flex-wrap mt-2 sm:mt-3 w-full relative z-10">
        <span
          className="text-[1.25rem] sm:text-[1.45rem] font-bold tracking-tight leading-none tabular-nums"
          style={{ color: 'var(--text-main)' }}
        >
          {title}
        </span>
        <div className="flex-shrink-0">
          {renderBadge()}
        </div>
      </div>

      {/* Subtle corner hover indicator */}
      <div
        className="absolute right-3 bottom-3 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: theme.borderColor }}
      />
    </motion.div>
  );
};

export default StatCardMini;