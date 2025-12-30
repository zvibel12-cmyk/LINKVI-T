import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AdminTabs from '../components/AdminTabs';
import EventCard from '../components/EventCard';
import CreateEventForm from '../components/CreateEventForm';
import { Plus, Search, Download, Lock, LogOut } from 'lucide-react';

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
  id: string;
  event_id: string;
  event_name: string;
  device_id: string;
  full_name: string;
  driver_code: string;
  entry_time?: string;
  exit_time?: string;
}

const ADMIN_PASSWORD = '1221';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState<'events' | 'attendance' | 'export'>('events');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('adminAuth');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    loadEventsAndAttendance();
  }, []);

  const loadEventsAndAttendance = () => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }

    const userData = localStorage.getItem('userData');
    const parsedUserData = userData ? JSON.parse(userData) : null;

    const allAttendance: AttendanceRecord[] = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('attendance_')) {
        const record = JSON.parse(localStorage.getItem(key) || '{}');
        const eventId = record.event_id;
        const storedEventsData = localStorage.getItem('events');
        const allEvents = storedEventsData ? JSON.parse(storedEventsData) : [];
        const event = allEvents.find((e: Event) => e.id === eventId);
        
        if (event) {
          allAttendance.push({
            id: key,
            event_id: record.event_id,
            event_name: event.name,
            device_id: record.device_id,
            full_name: parsedUserData?.fullName || 'לא ידוע',
            driver_code: parsedUserData?.driverCode || 'לא ידוע',
            entry_time: record.entry_time,
            exit_time: record.exit_time
          });
        }
      }
    });

    setAttendanceRecords(allAttendance);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('סיסמה שגויה');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
  };

  const handleCreateEvent = (eventData: Omit<Event, 'id' | 'created_by'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      created_by: 'admin'
    };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    setShowCreateForm(false);
    loadEventsAndAttendance();
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
  };

  const handleToggleEventStatus = (id: string) => {
    const updatedEvents = events.map(event =>
      event.id === id ? { ...event, is_active: !event.is_active } : event
    );
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
  };

  const filteredAttendance = attendanceRecords.filter(record => {
    const matchesSearch = searchTerm === '' ||
      record.full_name.includes(searchTerm) ||
      record.driver_code.includes(searchTerm);
    const matchesEvent = selectedEventFilter === '' || record.event_id === selectedEventFilter;
    return matchesSearch && matchesEvent;
  });

  const exportToCSV = () => {
    const headers = ['שם', 'קוד כונן', 'אירוע', 'כניסה', 'יציאה', 'תאריך'];
    const csvContent = [
      headers.join(','),
      ...filteredAttendance.map(record => [
        record.full_name,
        record.driver_code,
        record.event_name,
        record.entry_time ? new Date(record.entry_time).toLocaleString('he-IL') : '',
        record.exit_time ? new Date(record.exit_time).toLocaleString('he-IL') : '',
        record.entry_time ? new Date(record.entry_time).toLocaleDateString('he-IL') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'attendance_records.csv';
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 card-entrance border border-orange-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                <Lock className="w-8 h-8" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">ממשק ניהול</h1>
            <p className="text-center text-gray-600 mb-8">הזן סיסמה כדי להמשיך</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest ${
                    passwordError ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-orange-200'
                  }`}
                  placeholder="••••"
                  dir="ltr"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-2 text-center font-medium">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl"
              >
                כניסה
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              זהו ממשק מוגן לניהול אירועים ורישומים
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderEventsTab = () => (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">ניהול אירועים</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          אירוע חדש
        </button>
      </div>

      {showCreateForm ? (
        <div className="mb-6">
          <CreateEventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.length > 0 ? (
            events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={handleDeleteEvent}
                onToggleStatus={handleToggleEventStatus}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg font-medium">אין אירועים עדיין</p>
              <p className="text-gray-500">לחץ על "אירוע חדש" כדי ליצור אירוע</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAttendanceTab = () => (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">רישומי נוכחות</h2>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-orange-50">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              חיפוש לפי שם או קוד כונן
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 hover:border-orange-200"
                placeholder="הכנס שם או קוד כונן"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              סינון לפי אירוע
            </label>
            <select
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 hover:border-orange-200"
            >
              <option value="">כל האירועים</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-50">
        {filteredAttendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-orange-100">
                <tr>
                  <th className="px-4 py-4 text-right text-sm font-bold text-gray-900">שם</th>
                  <th className="px-4 py-4 text-right text-sm font-bold text-gray-900">קוד כונן</th>
                  <th className="px-4 py-4 text-right text-sm font-bold text-gray-900">אירוע</th>
                  <th className="px-4 py-4 text-right text-sm font-bold text-gray-900">כניסה</th>
                  <th className="px-4 py-4 text-right text-sm font-bold text-gray-900">יציאה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttendance.map((record, idx) => (
                  <tr key={record.id} className={`hover:bg-orange-50 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{record.full_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{record.driver_code}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{record.event_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {record.entry_time ? new Date(record.entry_time).toLocaleString('he-IL') : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {record.exit_time ? new Date(record.exit_time).toLocaleString('he-IL') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg font-medium">אין רישומי נוכחות עדיין</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderExportTab = () => (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">ייצוא נתונים</h2>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mx-auto mb-6">
            <Download className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">ייצוא רישומי נוכחות</h3>
          <p className="text-gray-600 mb-8 text-lg">
            ייצא את כל רישומי הנוכחות לקובץ CSV
          </p>

          <button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all duration-200 font-bold text-lg flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5" />
            ייצוא לאקסל
          </button>

          <p className="text-sm text-gray-500 mt-6">
            הקובץ יכלול: שם, קוד כונן, אירוע, זמני כניסה ויציאה
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Header title="ניהול מערכת" />
      
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-end">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors font-semibold px-4 py-2 rounded-lg hover:bg-orange-50 active:scale-95 duration-200"
        >
          <LogOut className="w-4 h-4" />
          התנתקות
        </button>
      </div>

      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="py-6">
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'attendance' && renderAttendanceTab()}
        {activeTab === 'export' && renderExportTab()}
      </div>
    </div>
  );
}