import React, { useState, useEffect } from 'react';
import { Sprout, Calendar, AlertCircle, X, Loader2, RefreshCw, Pencil, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({ setCurrentView }) => {
  const { user, isAuthenticated, updateUserLocation, t } = useAuth();
  const [plannerData, setPlannerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSearch, setEditSearch] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentScans, setRecentScans] = useState([]);

  const activeLocation = user?.location || 'New Delhi';

  const fetchFarmPlanner = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://anndaataa-backend.onrender.com/api/farm-planner?location=${encodeURIComponent(activeLocation)}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve personalized farm profiles');
      }
      const data = await response.json();
      setPlannerData(data);
    } catch (err) {
      setError(err.message || 'Error connecting to the farm planner service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmPlanner();
  }, [activeLocation]);

  useEffect(() => {
    try {
      const savedScans = JSON.parse(localStorage.getItem('anndaataa_scans')) || [];
      setRecentScans(savedScans);
    } catch (e) {
    }
  }, []);

  useEffect(() => {
    if (!showSuggestions || editSearch.trim().length <= 2) {
      setLocationResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const response = await fetch(`https://anndaataa-backend.onrender.com/api/locations?q=${encodeURIComponent(editSearch)}`);
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
  }, [editSearch, showSuggestions]);

  const handleSelectLocation = (selectedCity) => {
    updateUserLocation(selectedCity);
    setShowSuggestions(false);
    setLocationResults([]);
    setIsEditModalOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setLocationResults([]);
    }, 200);
  };

  const openEditModal = () => {
    setEditSearch(activeLocation);
    setShowSuggestions(false);
    setLocationResults([]);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-3xl w-full" />
        <div className="space-y-4">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-slate-200 rounded-2xl w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={40} className="text-red-500 mb-3" />
        <h3 className="font-extrabold text-slate-805 text-lg">{t('Sync Failure')}</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">{error}</p>
        <button
          onClick={fetchFarmPlanner}
          className="px-6 py-3 bg-emerald-800 hover:bg-emerald-955 text-white font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-md text-sm"
        >
          <RefreshCw size={16} />
          {t('Retry Sync')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {!isAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-amber-800">{t('Viewing Temporary Session')}</h3>
            <p className="text-[11px] text-amber-700/90 mt-0.5">{t('Sign In to save your district and unlock the Mandi Market.')}</p>
          </div>
        </div>
      )}

      <section className="bg-emerald-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[140px]">
        <div className="absolute -right-10 -top-10 w-36 h-36 bg-emerald-700/50 rounded-full blur-2xl" />
        <div className="z-10 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">{t('Regional Agri-Profile')}</span>
            <h2 className="text-2xl font-black tracking-tight mt-1">{activeLocation}</h2>
          </div>
          <button
            onClick={openEditModal}
            className="p-2.5 bg-white hover:bg-emerald-50 text-emerald-800 rounded-full shadow-lg transition-transform active:scale-95 focus:outline-none flex items-center justify-center shrink-0 mt-1"
          >
            <Pencil size={14} className="stroke-[2.5]" />
          </button>
        </div>
        <div className="z-10 mt-4 flex items-center justify-between border-t border-emerald-700/50 pt-3">
          <span className="text-xs text-emerald-200 font-semibold">{t('Typical Soil Type')}</span>
          <span className="text-xs font-black bg-emerald-700 px-3 py-1 rounded-full text-emerald-100">{plannerData?.soil_type}</span>
        </div>
      </section>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-800">{t('Recommended Crop Rotations')}</h3>
        <div className="grid grid-cols-1 gap-4">
          {plannerData?.recommended_crops?.map((crop, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between gap-4 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                    <Sprout size={18} />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-base">{crop.crop_name}</h4>
                </div>
                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{crop.brief_reason}</p>
              </div>
              <button
                onClick={() => setSelectedCrop(crop)}
                className="w-full bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold py-3 rounded-xl border border-slate-100 transition-all text-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Calendar size={14} />
                {t('View Growing Timeline')}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-lg font-black text-slate-805">{t('Recent Diagnostics')}</h3>
        {recentScans.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 animate-in fade-in duration-300">
            <p className="text-xs text-slate-400 italic font-semibold leading-relaxed">
              {t('No recent scans. Your diagnostic history will appear here.')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentScans.map((scan) => (
              <div key={scan.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between animate-in fade-in duration-300">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">{scan.disease}</h4>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">{scan.date}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                  {scan.chemical}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <header className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">{t('Growing Stepper Guide')}</span>
                <h3 className="text-lg font-extrabold text-slate-800 mt-0.5">{selectedCrop.crop_name} {t('Timeline')}</h3>
              </div>
              <button
                onClick={() => setSelectedCrop(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="relative border-l-2 border-emerald-100 ml-4 pl-6 space-y-8">
                {selectedCrop.timeline.map((step, idx) => (
                  <div key={idx} className="relative animate-in slide-in-from-bottom duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="absolute -left-10 top-0.5 flex items-center justify-center w-8 h-8 bg-emerald-50 border-2 border-emerald-600 rounded-full font-black text-[10px] text-emerald-800 shadow-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-850">{step.phase}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <footer className="p-4 border-t border-slate-100 bg-slate-50 flex items-center shrink-0">
              <button
                onClick={() => setSelectedCrop(null)}
                className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-3.5 rounded-xl shadow-md transition-transform active:scale-[0.98] text-sm"
              >
                {t('Close Timeline')}
              </button>
            </footer>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 p-6 sm:p-8 flex flex-col">
            <header className="flex justify-between items-center mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">{t('Location Preferences')}</span>
                <h3 className="text-xl font-extrabold text-slate-805 mt-0.5">{t('Edit Regional Profile')}</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </header>

            <div className="space-y-4 relative">
              <label className="text-sm font-semibold text-slate-700 block">
                {t('Select New District')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <MapPin size={18} />
                </span>
                <input
                  type="text"
                  value={editSearch}
                  onChange={(e) => {
                    setEditSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onBlur={handleBlur}
                  placeholder="e.g., Ludhiana, Punjab"
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-2">
                  {isSearchingLocation ? (
                    <Loader2 size={18} className="animate-spin text-emerald-600" />
                  ) : (
                    editSearch && (
                      <button
                        onClick={() => {
                          setEditSearch('');
                          setShowSuggestions(false);
                          setLocationResults([]);
                        }}
                        type="button"
                        className="p-1 hover:bg-slate-250 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )
                  )}
                </div>
              </div>

              {showSuggestions && editSearch.trim().length > 2 && !isSearchingLocation && locationResults.length === 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden py-2.5 max-w-sm animate-in fade-in duration-200">
                  <li className="px-4 py-2 text-xs text-slate-400 font-medium italic">
                    {t('No locations matched. Please select a valid Indian district.')}
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
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3.5 rounded-xl transition-colors active:scale-[0.98]"
              >
                {t('Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
