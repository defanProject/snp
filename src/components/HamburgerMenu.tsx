import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Search, Flame, HelpCircle, BookOpen, Shield, FileText, Cookie, Server, X, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const { t } = useTranslation();
  const { lang } = useParams();

  const menuItems = [
    { icon: Home, label: t('common.home'), path: `/${lang || 'en'}` },
    { icon: Search, label: t('common.tiktokSearch'), path: `/${lang || 'en'}/tiktok-search` },
    { icon: Flame, label: 'Trending', path: `/${lang || 'en'}/trending` },
    { icon: HelpCircle, label: t('common.faq'), path: `/${lang || 'en'}/faq` },
    { icon: BookOpen, label: t('common.guide'), path: `/${lang || 'en'}/guide` },
    { icon: Shield, label: t('common.privacy'), path: `/${lang || 'en'}/privacy` },
    { icon: FileText, label: t('common.terms'), path: `/${lang || 'en'}/terms` },
    { icon: Cookie, label: t('common.cookies'), path: `/${lang || 'en'}/cookies` },
    { icon: Server, label: 'Server Status', path: `/${lang || 'en'}/status` },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
          />
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 top-0 bg-white shadow-2xl z-[101] md:hidden flex flex-col max-h-[90vh] overflow-y-auto rounded-b-[3rem]"
          >
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <img src="/image/Navbar.jpeg" className="w-10 h-10 rounded-xl" alt="Logo" />
                <span className="font-black text-xl tracking-tight text-gray-900">SnapTok</span>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className="flex items-center space-x-4 p-4 rounded-2xl font-black text-gray-700 hover:bg-gray-100 hover:text-black transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="p-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">SnapTok.lol v4.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
