import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import HamburgerMenu from './HamburgerMenu';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { lang } = useParams();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const changeLanguage = (newLang: string) => {
    i18n.changeLanguage(newLang);
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 0 && ['en', 'id', 'ru', 'zh', 'ja'].includes(pathParts[0])) {
      pathParts[0] = newLang;
    } else {
      pathParts.unshift(newLang);
    }
    navigate(`/${pathParts.join('/')}${window.location.search}`);
    setIsLangOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={`/${lang || 'en'}`} className="flex items-center space-x-3">
            <div className="w-10 h-10 overflow-hidden rounded-xl shadow-inner border border-gray-100">
              <img 
                src="/image/Navbar.jpeg" 
                alt="SnapTok Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-black text-black">
                SnapTok.lol
              </span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">
                TikTok Downloader
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-6 mr-4">
              <Link to={`/${lang || 'en'}`} className="text-gray-600 hover:text-black font-bold transition-colors">
                <i className="fas fa-home mr-2"></i>
                {t('common.home')}
              </Link>
              <Link to={`/${lang || 'en'}/tiktok-search`} className="text-gray-600 hover:text-black font-bold transition-colors">
                <i className="fas fa-search mr-2"></i>
                {t('common.tiktokSearch')}
              </Link>
              <Link to={`/${lang || 'en'}/trending`} className="text-gray-600 hover:text-black font-bold transition-colors">
                <i className="fas fa-fire mr-2"></i>
                Trending
              </Link>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition-all border border-gray-200"
              >
                <i className="fas fa-globe text-black"></i>
                <span className="text-sm uppercase">{lang || 'en'}</span>
                <i className={`fas fa-chevron-down text-[10px] transition-transform ${isLangOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 py-2"
                  >
                    {[
                      { code: 'en', label: 'English', flag: '🇺🇸' },
                      { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
                      { code: 'ru', label: 'Русский', flag: '🇷🇺' },
                      { code: 'zh', label: '中文', flag: '🇨🇳' },
                      { code: 'ja', label: '日本語', flag: '🇯🇵' },
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => changeLanguage(l.code)}
                        className={`flex items-center justify-between w-full px-4 py-3 text-sm font-bold transition-colors ${
                          (lang || 'en') === l.code 
                            ? 'bg-gray-100 text-black' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{l.flag} {l.label}</span>
                        {(lang || 'en') === l.code && <i className="fas fa-check text-xs"></i>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <HamburgerMenu 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
          />
        )}
      </AnimatePresence>
    </nav>
  );
}
