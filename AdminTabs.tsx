import React from 'react';
import { Calendar, Users, Download } from 'lucide-react';

interface AdminTabsProps {
  activeTab: 'events' | 'attendance' | 'export';
  onTabChange: (tab: 'events' | 'attendance' | 'export') => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'events' as const, label: 'אירועים', icon: Calendar },
    { id: 'attendance' as const, label: 'רישומים', icon: Users },
    { id: 'export' as const, label: 'ייצוא', icon: Download },
  ];

  return (
    <div className="bg-white shadow-md border-b-2 border-orange-100">
      <div className="max-w-4xl mx-auto">
        <nav className="flex overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-2 px-6 py-4 font-bold transition-all duration-200 whitespace-nowrap active:scale-95 ${
                activeTab === id
                  ? 'text-orange-600 border-b-4 border-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminTabs;