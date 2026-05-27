import React, { useState } from 'react';
import { Home, Scan, ShoppingBag, User, LogOut, MapPin } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Market from './components/Market';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const { user, isAuthenticated, logout, openAuthModal, toggleLanguage, language, t } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'home':
        return 'AnnDaataa';
      case 'scan':
        return t('Health Scanner');
      case 'market':
        return t('Market & Supplies');
      default:
        return 'AnnDaataa';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 md:p-6">
      <div className="w-full max-w-md h-[100dvh] md:h-[850px] md:rounded-[2.5rem] bg-slate-50 overflow-hidden relative shadow-2xl flex flex-col border-0 md:border-8 border-slate-800">
        
        <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-100 relative z-30">
          <h1 className="text-xl font-extrabold text-emerald-800 tracking-tight">
            {getHeaderTitle()}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-emerald-600 rounded-full text-xs font-black text-slate-700 tracking-wide transition-all active:scale-95 shadow-sm flex items-center justify-center cursor-pointer select-none"
            >
              {language === 'en' ? 'अ / A' : 'HI / EN'}
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setIsDropdownOpen(!isDropdownOpen);
                  } else {
                    openAuthModal();
                  }
                }}
                className="bg-emerald-100 p-2.5 rounded-full text-emerald-800 hover:bg-emerald-200 transition-colors focus:outline-none flex items-center justify-center"
              >
                <User size={20} />
              </button>

              {isAuthenticated && isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 pb-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-1 mt-2 text-emerald-700">
                      <MapPin size={12} className="shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{user.location}</span>
                    </div>
                  </div>
                  <div className="pt-2 px-2">
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-bold rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} />
                      {t('Sign Out')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col relative">
          {currentView === 'home' && <Dashboard setCurrentView={setCurrentView} />}
          {currentView === 'scan' && <Scanner setCurrentView={setCurrentView} />}
          {currentView === 'market' && <Market />}
        </div>

        <nav className="bg-white border-t border-slate-200 pb-safe pt-2 px-6 pb-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => {
                setCurrentView('home');
                setIsDropdownOpen(false);
              }}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${currentView === 'home' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Home size={24} className={currentView === 'home' ? 'fill-emerald-100' : ''} />
              <span className="text-xs font-semibold">{t('Home')}</span>
            </button>
            <button 
              onClick={() => {
                setCurrentView('scan');
                setIsDropdownOpen(false);
              }}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${currentView === 'scan' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Scan size={24} className={currentView === 'scan' ? 'fill-emerald-100' : ''} />
              <span className="text-xs font-semibold">{t('Scan')}</span>
            </button>
            <button 
              onClick={() => {
                setCurrentView('market');
                setIsDropdownOpen(false);
              }}
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${currentView === 'market' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ShoppingBag size={24} className={currentView === 'market' ? 'fill-emerald-100' : ''} />
              <span className="text-xs font-semibold">{t('Market')}</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
