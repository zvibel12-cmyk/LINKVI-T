import React from 'react';
import { MapPin, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface LocationStatusProps {
  status: 'loading' | 'denied' | 'outside' | 'inside';
  userName?: string;
  eventName?: string;
  onRefresh: () => void;
  onAction?: () => void;
  actionText?: string;
  isRefreshing?: boolean;
}

const LocationStatus: React.FC<LocationStatusProps> = ({
  status,
  userName,
  eventName,
  onRefresh,
  onAction,
  actionText,
  isRefreshing = false
}) => {
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 rounded-full mx-auto mb-4 spinner-orange"></div>
            <p className="text-gray-700 font-semibold text-lg">מאתר מיקום...</p>
          </div>
        );

      case 'denied':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <p className="text-gray-900 font-bold text-lg mb-2">בלי מיקום אי אפשר להירשם</p>
            <p className="text-gray-600 text-base mb-6">לחץ לאישור מיקום</p>
            <button
              onClick={onRefresh}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
            >
              אישור מיקום
            </button>
          </div>
        );

      case 'outside':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-gray-900 font-bold text-lg mb-2">אין כרגע אירוע פעיל במיקום שלך</p>
            <p className="text-gray-600 text-base">אם אתה בטוח שאתה ליד האירוע — בדוק שהמיקום מופעל</p>
          </div>
        );

      case 'inside':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ברוכים הבאים {userName}!
            </h2>
            <p className="text-gray-700 text-lg mb-8">אתה נמצא באירוע: <span className="font-bold text-orange-600">{eventName}</span></p>
            {onAction && actionText && (
              <button
                onClick={onAction}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all duration-200 font-bold text-xl cta-pulse shadow-lg hover:shadow-xl"
              >
                {actionText}
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg mx-4 mb-4 card-entrance border-2 border-orange-50 hover:shadow-xl transition-shadow duration-300">
      {renderContent()}

      {status !== 'loading' && status !== 'denied' && (
        <div className="border-t-2 border-orange-50 p-6 text-center">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 mx-auto text-orange-600 hover:text-orange-700 transition-all duration-200 disabled:opacity-50 font-semibold px-4 py-2 rounded-lg hover:bg-orange-50 active:scale-95"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            רענון מיקום
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationStatus;