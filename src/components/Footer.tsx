import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation();
  const { lang } = useParams();

  const links = [
    { label: t('common.faq'), path: `/${lang || 'en'}/faq` },
    { label: t('common.terms'), path: `/${lang || 'en'}/terms` },
    { label: t('common.guide'), path: `/${lang || 'en'}/guide` },
    { label: t('common.cookies'), path: `/${lang || 'en'}/cookies` },
    { label: t('common.privacy'), path: `/${lang || 'en'}/privacy` },
  ];

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8">
          <div className="flex flex-col items-center">
            <img 
              src="/image/Footer.jpg" 
              alt="SnapTok Footer Logo" 
              className="h-20 w-auto rounded-xl"
              referrerPolicy="no-referrer"
            />
            {/* The user said the image already has the name, so no extra text here */}
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="w-full border-t border-gray-800 pt-8 flex flex-col items-center space-y-4">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center max-w-2xl leading-relaxed">
              SnapTok.lol is not affiliated with TikTok, ByteDance Ltd, or any other social media platform. We do not store videos on our servers. All media is downloaded directly from TikTok's servers to your device.
            </p>
            <div className="flex flex-col md:flex-row justify-between items-center w-full space-y-4 md:space-y-0 pt-4">
              <p className="text-gray-500 text-xs">
                © {new Date().getFullYear()} SnapTok.lol. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <span className="text-gray-500 text-xs">{t('common.footerText')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
