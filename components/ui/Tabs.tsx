import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex border-b border-line gap-4 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors-fast relative flex items-center gap-2 cursor-pointer select-none ${
              isActive
                ? 'text-accent border-b-2 border-accent'
                : 'text-fg-secondary hover:text-fg'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && <span>{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
