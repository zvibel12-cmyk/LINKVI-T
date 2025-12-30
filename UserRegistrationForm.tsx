import React, { useState } from 'react';
import { User, Hash } from 'lucide-react';

interface UserRegistrationFormProps {
  onSubmit: (data: { fullName: string; driverCode: string }) => void;
  initialData?: { fullName: string; driverCode: string };
  isEditing?: boolean;
}

const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [driverCode, setDriverCode] = useState(initialData?.driverCode || '');
  const [errors, setErrors] = useState<{ fullName?: string; driverCode?: string }>({});

  const validateForm = () => {
    const newErrors: { fullName?: string; driverCode?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'שם מלא נדרש';
    }

    if (!driverCode.trim()) {
      newErrors.driverCode = 'קוד כונן נדרש';
    } else if (!/^\d+$/.test(driverCode)) {
      newErrors.driverCode = 'קוד כונן חייב להכיל ספרות בלבד';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ fullName: fullName.trim(), driverCode: driverCode.trim() });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mx-4 card-entrance border border-orange-50 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        {isEditing ? 'עריכת פרטים' : 'רישום משתמש חדש'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" />
            שם מלא
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 ${
              errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-orange-200'
            }`}
            placeholder="הכנס שם מלא"
            dir="rtl"
          />
          {errors.fullName && (
            <p className="text-red-600 text-sm mt-2 font-medium">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Hash className="w-5 h-5 text-orange-600" />
            קוד כונן
          </label>
          <input
            type="text"
            value={driverCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setDriverCode(value);
            }}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 ${
              errors.driverCode ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-orange-200'
            }`}
            placeholder="הכנס קוד כונן (ספרות בלבד)"
            dir="rtl"
            inputMode="numeric"
          />
          {errors.driverCode && (
            <p className="text-red-600 text-sm mt-2 font-medium">{errors.driverCode}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all duration-200 font-bold text-lg cta-pulse shadow-lg hover:shadow-xl"
        >
          {isEditing ? 'עדכון פרטים' : 'שמירה והמשך'}
        </button>
      </form>
    </div>
  );
};

export default UserRegistrationForm;