import React from 'react';
import './TabNavigation.css';

interface Tab {
  id: string;
  label: string;
  count?: number | null;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className='tab-navigation'>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
          {tab.count !== null && tab.count !== undefined && (
            <span className='tab-count'>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
