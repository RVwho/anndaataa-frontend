import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!showSuggestions || location.trim().length <= 2) {
      setLocationResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const response = await fetch(`http://localhost:8000/api/locations?q=${encodeURIComponent(location)}`);
        if (response.ok) {
          const data = await response.json();
          setLocationResults(data);
        }
      } catch (err) {
      } finally {
        setIsSearchingLocation(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [location, showSuggestions]);

  if (!isOpen) return null;

  const isStep1Valid = email.includes('@') && password.length >= 6;
  const isStep2Valid = name.trim().length > 0 && location.trim().length > 5;

  const validateStep1 = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Username is required';
    }
    if (location.trim().length <= 5) {
      newErrors.location = 'Please select a valid location from the suggestions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep2()) {
      login({ email, name, location });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setLocation('');
    setLocationResults([]);
    setIsSearchingLocation(false);
    setShowSuggestions(false);
    setStep(1);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectLocation = (selectedCity) => {
    setLocation(selectedCity);
    setShowSuggestions(false);
    setLocationResults([]);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setLocationResults([]);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Step {step} of 2
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                {step === 1 ? 'Welcome to AnnDaataa' : 'Complete Profile'}
              </h2>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-8">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@anndaataa.org"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                      errors.email ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200'
                    }`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                      errors.password ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200'
                    }`}
                    required
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isStep1Valid}
                className="w-full mt-6 bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign In
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Rajesh Kumar"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                      errors.name ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200'
                    }`}
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">
                  Location
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <MapPin size={18} />
                  </span>
                  <input
                    type="text"
                    value={location}
                    onChange={handleLocationChange}
                    onBlur={handleBlur}
                    placeholder="e.g., Ludhiana, Punjab"
                    className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                      errors.location ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-slate-200'
                    }`}
                    required
                  />
                  {isSearchingLocation && (
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                      <Loader2 size={18} className="animate-spin text-emerald-600" />
                    </span>
                  )}
                </div>

                {showSuggestions && location.trim().length > 2 && !isSearchingLocation && locationResults.length === 0 && (
                  <ul className="absolute z-50 w-full mt-1 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden py-2.5 max-w-sm animate-in fade-in duration-200">
                    <li className="px-4 py-2 text-xs text-slate-400 font-medium italic">
                      No locations matched. Please select a valid Indian district.
                    </li>
                  </ul>
                )}

                {showSuggestions && locationResults.length > 0 && (
                  <ul className="absolute z-50 w-full mt-1 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-y-auto max-h-48 py-2 animate-in fade-in duration-200 max-w-sm">
                    {locationResults.map((city, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleSelectLocation(city)}
                        className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors font-medium flex items-center gap-2"
                      >
                        <MapPin size={14} className="text-slate-400" />
                        {city}
                      </li>
                    ))}
                  </ul>
                )}

                {errors.location && (
                  <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                    {errors.location}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrors({});
                  }}
                  className="flex-1 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-4 rounded-2xl transition-colors duration-300 active:scale-[0.98]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!isStep2Valid}
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-4 rounded-2xl shadow-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
