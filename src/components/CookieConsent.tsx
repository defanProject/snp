import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X, Globe, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CookieConsent() {
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const lang = i18n.language;

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  const changeLanguage = (code: string) => {
    const pathParts = location.pathname.split('/');
    pathParts[1] = code;
    const newPath = pathParts.join('/') || `/${code}`;
    navigate(newPath);
    setIsLangOpen(false);
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[100]"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-gray-100 p-3 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider transition-all border border-gray-100"
                  >
                    <Globe className="w-3 h-3" />
                    <span>{lang}</span>
                  </button>
                  
                  <AnimatePresence>
                    {isLangOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute bottom-full right-0 mb-2 w-32 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-1"
                      >
                        {languages.map((l) => (
                          <button
                            key={l.code}
                            onClick={() => changeLanguage(l.code)}
                            className={`flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold transition-colors ${
                              lang === l.code 
                                ? 'bg-gray-100 text-black' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>{l.flag} {l.label}</span>
                            {lang === l.code && <Check className="w-2 h-2" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900">{t('cookies.title')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t('cookies.description')}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAccept}
                  className="flex-grow bg-black hover:bg-gray-900 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors shadow-lg shadow-gray-200"
                >
                  {t('cookies.accept')}
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-2.5 px-4 rounded-xl transition-colors"
                >
                  {t('cookies.manage')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
