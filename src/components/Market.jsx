import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Sprout, TrendingUp, TrendingDown, Lock, CheckCircle, Loader2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Market = () => {
  const { user, isAuthenticated, openAuthModal, recommendedTreatment, setRecommendedTreatment, t } = useAuth();
  const [activeTab, setActiveTab] = useState('kvk');
  const [mandiPrices, setMandiPrices] = useState([]);
  const [kvkLocations, setKvkLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMarketData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [mandiRes, kvkRes] = await Promise.all([
        fetch('https://anndaataa-backend.onrender.com/api/mandi-prices'),
        fetch(`https://anndaataa-backend.onrender.com/api/kvk-locations?treatment=${encodeURIComponent(recommendedTreatment?.chemical || '')}`)
      ]);

      if (!mandiRes.ok || !kvkRes.ok) {
        throw new Error('Failed to retrieve live market records');
      }

      const mandiData = await mandiRes.json();
      const kvkData = await kvkRes.json();

      setMandiPrices(mandiData);
      setKvkLocations(kvkData);
    } catch (err) {
      setError(err.message || 'Error connecting to the market data provider');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMarketData();
  }, [isAuthenticated, recommendedTreatment]);

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-amber-100/50 animate-pulse">
          <Lock size={40} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{t('Market Locked')}</h2>
        <p className="text-sm text-slate-500 max-w-xs mb-8 leading-relaxed">
          {t('Sign In to save your district and unlock the Mandi Market.')}
        </p>
        <button
          onClick={openAuthModal}
          className="w-full max-w-xs bg-emerald-800 hover:bg-emerald-955 text-white font-bold py-4 rounded-2xl shadow-lg transition-transform active:scale-[0.98]"
        >
          {t('Sign In to Unlock')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col">
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 mb-6 animate-in slide-in-from-top duration-300">
        <div className="bg-emerald-500/20 text-emerald-800 p-2 rounded-xl">
          <CheckCircle size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-emerald-800">{t('Market Access Unlocked')}</h3>
          <p className="text-xs text-emerald-600/90 mt-0.5">{t('Showing customized local mandi prices and KVK services for')} {user.location}.</p>
        </div>
      </div>

      {recommendedTreatment?.chemical && (
        <div className="bg-amber-50/70 border border-amber-250 rounded-2xl p-5 flex flex-col gap-4 mb-6 animate-in slide-in-from-top duration-300 relative shadow-sm">
          <button
            onClick={() => setRecommendedTreatment(null)}
            className="absolute top-4 right-4 p-1.5 hover:bg-amber-100/80 text-amber-800 rounded-full transition-colors shrink-0"
          >
            <X size={18} />
          </button>

          <div className="pr-8">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">{t('Scanned Prescription Diagnostic')}</span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-1 leading-tight">
              {t('Required Treatment:')} <span className="text-emerald-800 block md:inline">{recommendedTreatment.chemical}</span>
            </h2>
          </div>

          <details className="group border border-amber-200/50 rounded-xl bg-white overflow-hidden transition-all duration-300">
            <summary className="flex justify-between items-center p-3.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-amber-50/20 transition-colors list-none">
              <span>{t('View Application Steps')}</span>
              <span className="transition-transform duration-300 group-open:rotate-180 text-slate-400 text-[10px]">▼</span>
            </summary>
            <div className="p-3.5 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-600 leading-relaxed">
              {recommendedTreatment.instructions}
            </div>
          </details>
        </div>
      )}

      <div className="flex p-1 bg-slate-200/50 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('kvk')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'kvk' ? 'bg-white text-emerald-800 shadow' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t('Nearby KVKs')}
        </button>
        <button
          onClick={() => setActiveTab('mandi')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'mandi' ? 'bg-white text-emerald-800 shadow' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t('Live Mandi Prices')}
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Loader2 size={36} className="animate-spin text-emerald-800 mb-3" />
            <span className="text-sm text-slate-500 font-semibold animate-pulse">{t('Updating Live Market Records...')}</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center p-4">
            <AlertCircle size={36} className="text-red-500 mb-3" />
            <h3 className="font-bold text-slate-800">{t('Sync Failure')}</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">{error}</p>
            <button
              onClick={fetchMarketData}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-955 text-white font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-sm text-sm"
            >
              <RefreshCw size={16} />
              {t('Retry Sync')}
            </button>
          </div>
        ) : activeTab === 'kvk' ? (
          <div className="space-y-4">
            {kvkLocations.map((shop, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-4 shadow-sm border flex flex-col gap-3 animate-in fade-in duration-300 transition-all ${
                  shop.inventory_match && recommendedTreatment?.chemical
                    ? 'border-emerald-200 ring-2 ring-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                    : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-805 text-sm">{shop.name}</h3>
                    <div className="flex items-center text-slate-500 text-xs mt-1.5 gap-1">
                      <MapPin size={12} />
                      {shop.distance_km} km away
                    </div>
                  </div>
                  <button className="bg-emerald-50 text-emerald-800 p-3 rounded-xl hover:bg-emerald-100 transition-colors">
                    <Navigation size={18} />
                  </button>
                </div>
                {shop.inventory_match && recommendedTreatment?.chemical && (
                  <div className="bg-emerald-100/50 border border-emerald-200/55 text-emerald-800 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start animate-pulse">
                    <CheckCircle size={14} className="text-emerald-700 shrink-0" />
                    <span>{t('In Stock:')} {recommendedTreatment.chemical}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50/50 border border-emerald-100/50 p-3 rounded-xl flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                <Sprout size={14} className="text-emerald-700" />
                {t('Live Mandi Prices')} ({user.location})
              </span>
              <span className="text-emerald-600 font-semibold">Updated 2m ago</span>
            </div>
            {mandiPrices.map((crop, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                    <Sprout size={18} className="text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-805 text-sm">{crop.crop}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="font-extrabold text-slate-850 text-base">₹{crop.price_per_quintal.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-400">/ quintal</span>
                  </div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${crop.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {crop.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;
