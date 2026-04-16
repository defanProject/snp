import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './lib/i18n';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Trending from './pages/Trending';
import StaticPages from './pages/StaticPages';
import AdminPanel from './pages/AdminPanel';
import ServerStatus from './pages/ServerStatus';

const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (lang && ['en', 'id', 'ru', 'zh', 'ja'].includes(lang)) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    }
  }, [lang, i18n]);

  if (!lang || !['en', 'id', 'ru', 'zh', 'ja'].includes(lang)) {
    return <Navigate to={`/en${location.pathname}${location.search}`} replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/akses" element={<AdminPanel />} />
        <Route path="/" element={<Navigate to="/en" replace />} />
        <Route path="/:lang" element={<LanguageWrapper><Layout /></LanguageWrapper>}>
          <Route index element={<Home />} />
          <Route path="tiktok-download" element={<Home />} />
          <Route path="tiktok-search" element={<Search />} />
          <Route path="trending" element={<Trending />} />
          <Route path="faq" element={<StaticPages />} />
          <Route path="terms" element={<StaticPages />} />
          <Route path="guide" element={<StaticPages />} />
          <Route path="cookies" element={<StaticPages />} />
          <Route path="privacy" element={<StaticPages />} />
          <Route path="status" element={<ServerStatus />} />
        </Route>
        <Route path="*" element={<Navigate to="/en" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
