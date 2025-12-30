import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import UserRegistrationForm from '../components/UserRegistrationForm';
import LocationStatus from '../components/LocationStatus';
import { Edit } from 'lucide-react';

interface UserData {
  fullName: string;
  driverCode: string;
}

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

interface AttendanceRecord {
  event_id: string;
  device_id: string;
  entry_time?: string;
  exit_time?: string;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'denied' | 'outside' | 'inside'>('loading');
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    let storedDeviceId = localStorage.getItem('deviceId');
    if (!storedDeviceId) {
      storedDeviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }

    checkLocation();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      checkLocation();
    }
  }, [events]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const checkLocation = () => {
    setIsRefreshing(true);
    
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      setIsRefreshing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        const activeEvent = events.find(event => {
          if (!event.is_active) return false;
          const distance = calculateDistance(userLat, userLng, event.lat, event.lng);
          return distance <= event.radius_m;
        });

        if (activeEvent) {
          setCurrentEvent(activeEvent);
          setLocationStatus('inside');
          
          const storedAttendance = localStorage.getItem(`attendance_${activeEvent.id}_${deviceId}`);
          const record = storedAttendance ? JSON.parse(storedAttendance) : null;
          setAttendanceRecord(record || null);
        } else {
          setCurrentEvent(null);
          setLocationStatus('outside');
          setAttendanceRecord(null);
        }
        
        setIsRefreshing(false);
      },
      (error) => {
        setLocationStatus('denied');
        setIsRefreshing(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleUserRegistration = (data: UserData) => {
    setUserData(data);
    localStorage.setItem('userData', JSON.stringify(data));
    setIsEditing(false);
  };

  const handleAttendanceAction = () => {
    if (!currentEvent || !userData || !deviceId) return;

    const now = new Date().toISOString();
    
    if (!attendanceRecord) {
      const newRecord: AttendanceRecord = {
        event_id: currentEvent.id,
        device_id: deviceId,
        entry_time: now
      };
      setAttendanceRecord(newRecord);
      localStorage.setItem(`attendance_${currentEvent.id}_${deviceId}`, JSON.stringify(newRecord));
      alert('כניסה נרשמה בהצלחה!');
    } else if (currentEvent.mode === 'entry_exit' && attendanceRecord.entry_time && !attendanceRecord.exit_time) {
      const updatedRecord = {
        ...attendanceRecord,
        exit_time: now
      };
      setAttendanceRecord(updatedRecord);
      localStorage.setItem(`attendance_${currentEvent.id}_${deviceId}`, JSON.stringify(updatedRecord));
      alert('יציאה נרשמה בהצלחה!');
    }
  };

  const getActionText = (): string | undefined => {
    if (!currentEvent || !userData) return undefined;

    if (currentEvent.mode === 'entry_only') {
      return attendanceRecord?.entry_time ? undefined : 'ביצוע כניסה';
    } else {
      if (!attendanceRecord?.entry_time) {
        return 'כניסה';
      } else if (!attendanceRecord?.exit_time) {
        return 'יציאה';
      } else {
        return undefined;
      }
    }
  };

  const actionText = getActionText();
  const showSuccessMessage = currentEvent && attendanceRecord && 
    ((currentEvent.mode === 'entry_only' && attendanceRecord.entry_time) ||
     (currentEvent.mode === 'entry_exit' && attendanceRecord.exit_time));

  if (!userData || isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <Header title="רישום נוכחות" />
        <div className="py-8">
          <UserRegistrationForm
            onSubmit={handleUserRegistration}
            initialData={userData || undefined}
            isEditing={isEditing}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Header title="רישום נוכחות" showAdminLink />
      
      <div className="py-6">
        <div className="max-w-md mx-auto mb-6 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center justify-between border-2 border-orange-50 hover:shadow-xl transition-all duration-300 hover:border-orange-200">
            <div>
              <p className="text-gray-600 text-sm font-medium">שלום</p>
              <p className="font-bold text-gray-900 text-lg">{userData.fullName}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-all duration-200 p-3 rounded-lg active:scale-90"
              aria-label="עריכת פרטים"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showSuccessMessage ? (
          <div className="bg-white rounded-2xl shadow-lg mx-4 p-8 text-center border-2 border-green-100 hover:shadow-xl transition-shadow duration-300">
            <div className="text-green-500 text-7xl mb-4 animate-bounce">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">נרשמת בהצלחה</h2>
            <p className="text-gray-600 text-lg">תודה!</p>
          </div>
        ) : (
          <LocationStatus
            status={locationStatus}
            userName={userData.fullName}
            eventName={currentEvent?.name}
            onRefresh={checkLocation}
            onAction={actionText ? handleAttendanceAction : undefined}
            actionText={actionText}
            isRefreshing={isRefreshing}
          />
        )}
      </div>
    </div>
  );
}