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
  count,
  change,
  trend,
  trendLabel,
  icon = 'chart',
  color = '#3b82f6', // Now used as base for gradient
  variant = 'primary'
}) => {
  const IconComponent = typeof icon === 'string' ? iconComponents[icon] : icon;
  const displayValue = count || value;

  // Modern color mapping for premium gradients
  const colorMap = {
    '#e3f2fd': { from: 'rgba(59, 130, 246, 0.15)', to: 'rgba(59, 130, 246, 0.05)', icon: '#2563eb' },
    '#f3e5f5': { from: 'rgba(168, 85, 247, 0.15)', to: 'rgba(168, 85, 247, 0.05)', icon: '#9333ea' },
    '#e8f5e9': { from: 'rgba(34, 197, 94, 0.15)', to: 'rgba(34, 197, 94, 0.05)', icon: '#16a34a' },
    '#fff3e0': { from: 'rgba(249, 115, 22, 0.15)', to: 'rgba(249, 115, 22, 0.05)', icon: '#ea580c' },
  };

  const colors = colorMap[color] || { from: 'rgba(59, 130, 246, 0.15)', to: 'rgba(59, 130, 246, 0.05)', icon: '#2563eb' };

  return (
    <motion.div
      className="group relative overflow-hidden"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{
        background: 'var(--card-bg, #ffffff)',
        borderRadius: '20px',
        padding: '1.25rem',
        border: '1px solid var(--border-color-light, #f1f5f9)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Background Accent Pattern */}
      <div className="absolute -right-2 -top-2 opacity-[0.03] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
        {IconComponent && <IconComponent size={80} />}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${colors.from}`
            }}
          >
            {IconComponent && <IconComponent size={20} color={colors.icon} strokeWidth={2.5} />}
          </div>
          
          {(change !== undefined || trend !== undefined) && (
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
              (change || trend) > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {(change || trend) > 0 ? '↑' : '↓'} {Math.abs(change || trend || 0)}%
            </div>
          )}
        </div>

        <div>
          <h3 style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--text-secondary, #94a3b8)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            {title}
          </h3>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            color: 'var(--text-main, #1e293b)',
            fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
            letterSpacing: '-0.02em',
            lineHeight: '1',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.25rem'
          }}>
            <span className="tabular-nums">{displayValue}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-400 italic">
          {trendLabel || 'vs previous'}
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
      </div>
    </motion.div>
  );
};

export default StatCardMini;