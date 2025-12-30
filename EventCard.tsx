import React from 'react';
import { MapPin, Trash2, Circle, Power } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius_m: number;
  mode: 'entry_only' | 'entry_exit';
  is_active: boolean;
  created_by?: string;
}

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onDelete, onToggleStatus }) => {
  const handleDelete = () => {
    if (window.confirm('בטוח למחוק את האירוע?')) {
      onDelete(event.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl p-5 border-2 border-orange-50 hover:border-orange-200 transition-all duration-300 active:scale-95">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-gray-900 text-lg">{event.name}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleStatus(event.id)}
            className={`p-2 rounded-lg transition-all duration-200 active:scale-90 ${
              event.is_active
                ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            aria-label={event.is_active ? 'כבה אירוע' : 'הדלק אירוע'}
          >
            <Power className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 active:scale-90"
            aria-label="מחק אירוע"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <Circle className={`w-3 h-3 ${event.is_active ? 'text-green-500 fill-current' : 'text-gray-400'}`} />
          <span className={`font-semibold ${event.is_active ? 'text-green-600' : 'text-gray-500'}`}>
            {event.is_active ? 'פעיל' : 'לא פעיל'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-orange-600" />
          <span className="text-gray-700 font-medium">רדיוס: {event.radius_m} מטר</span>
        </div>
        
        <div className="text-gray-700 font-medium">
          מצב: {event.mode === 'entry_only' ? 'כניסה בלבד' : 'כניסה + יציאה'}
        </div>
      </div>
    </div>
  );
};

export default EventCard;