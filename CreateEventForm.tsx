import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Save, Locate, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface CreateEventFormProps {
  onSubmit: (eventData: {
    name: string;
    lat: number;
    lng: number;
    radius_m: number;
    mode: 'entry_only' | 'entry_exit';
    is_active: boolean;
  }) => void;
  onCancel: () => void;
}

const MapClickHandler: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    lat: 32.0853,
    lng: 34.7818,
    radius_m: 80,
    mode: 'entry_only' as 'entry_only' | 'entry_exit',
    is_active: true
  });
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'שם האירוע נדרש';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        name: formData.name.trim()
      });
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
        },
        () => {
          alert('לא ניתן לקבל מיקום נוכחי');
        }
      );
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 card-entrance mx-2 border-2 border-orange-50 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">יצירת אירוע חדש</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-90"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-3">
            שם האירוע
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 ${
              errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-orange-200'
            }`}
            placeholder="הכנס שם אירוע"
            dir="rtl"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-2 font-medium">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-3">
            מצב רישום
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-orange-200 hover:bg-orange-50 transition-all duration-200 cursor-pointer">
              <input
                type="radio"
                value="entry_only"
                checked={formData.mode === 'entry_only'}
                onChange={(e) => setFormData(prev => ({ ...prev, mode: e.target.value as 'entry_only' }))}
                className="w-5 h-5 accent-orange-600"
              />
              <span className="font-semibold text-gray-800">כניסה בלבד</span>
            </label>
            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-orange-200 hover:bg-orange-50 transition-all duration-200 cursor-pointer">
              <input
                type="radio"
                value="entry_exit"
                checked={formData.mode === 'entry_exit'}
                onChange={(e) => setFormData(prev => ({ ...prev, mode: e.target.value as 'entry_exit' }))}
                className="w-5 h-5 accent-orange-600"
              />
              <span className="font-semibold text-gray-800">כניסה + יציאה</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-3">
            בחירת מיקום במפה
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={useCurrentLocation}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-semibold px-3 py-2 rounded-lg hover:bg-orange-50 active:scale-95 duration-200"
              >
                <Locate className="w-5 h-5" />
                השתמש במיקום הנוכחי שלי
              </button>
              <div className="text-xs text-gray-500 font-medium">לחצו על המפה כדי לסמן נקודה</div>
            </div>

            <div className="map-container mt-3 rounded-xl overflow-hidden border-2 border-orange-100">
              <MapContainer
                center={[formData.lat, formData.lng]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={[formData.lat, formData.lng]} />
                <Circle
                  center={[formData.lat, formData.lng]}
                  radius={formData.radius_m}
                  pathOptions={{
                    color: '#f97316',
                    weight: 2,
                    opacity: 0.7,
                    fillColor: '#fef3e2',
                    fillOpacity: 0.35,
                  }}
                />
                <MapClickHandler onMapClick={handleMapClick} />
              </MapContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <input
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 hover:border-orange-200"
                placeholder="קו רוחב"
              />
              <input
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 hover:border-orange-200"
                placeholder="קו אורך"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-3">
            רדיוס (מטרים): <span className="text-orange-600">{formData.radius_m}</span>
          </label>
          <input
            type="range"
            min="10"
            max="500"
            value={formData.radius_m}
            onChange={(e) => setFormData(prev => ({ ...prev, radius_m: parseInt(e.target.value) }))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
            <span>10</span>
            <span>500</span>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all duration-200 font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Save className="w-5 h-5" />
            שמירת אירוע
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 font-bold"
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;