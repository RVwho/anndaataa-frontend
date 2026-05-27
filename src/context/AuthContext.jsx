import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthModal from '../components/AuthModal';
import { translations } from '../utils/translations';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [recommendedTreatment, setRecommendedTreatment] = useState(null);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedUser = localStorage.getItem('anndaataa_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('anndaataa_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const completeUser = {
      email: userData.email,
      name: userData.name || '',
      location: userData.location || 'New Delhi'
    };
    localStorage.setItem('anndaataa_user', JSON.stringify(completeUser));
    setUser(completeUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('anndaataa_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUserLocation = (newLocation) => {
    setUser((prevUser) => {
      const updatedUser = prevUser
        ? { ...prevUser, location: newLocation }
        : { email: '', name: 'Guest', location: newLocation };
      if (prevUser) {
        localStorage.setItem('anndaataa_user', JSON.stringify(updatedUser));
      }
      return updatedUser;
    });
  };

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      recommendedTreatment,
      setRecommendedTreatment,
      updateUserLocation,
      language,
      toggleLanguage,
      t
    }}>
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
