import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { SearchSkeleton } from '../components/Skeleton';
import { Play, Download, Music, Heart, Eye, User } from 'lucide-react';

export default function Search() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [count, setCount] = useState(parseInt(searchParams.get('count') || '10'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleCaption = (id: string) => {
    setExpandedCaptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      handleSearch(q, count);
    }
  }, []);

  const handleSearch = async (q: string, c: number) => {
    if (!q) return;
    setLoading(true);
    setError('');
    setPlayingVideo(null);
    try {
      const response = await axios.post('/api/tiktok/search', { keywords: q, count: c });
      setResults(response.data);
      setSearchParams({ q, count: c.toString() });
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: any) => {
    const n = Number(num);
    if (isNaN(n)) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Link copied to clipboard!', 'success');
  };

  const downloadFile = async (fileUrl: string, type: string) => {
    try {
      showToast(t('common.loading'), 'success');
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(fileUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const timestamp = Date.now();
      const extension = type === 'audio' ? 'mp3' : 'mp4';
      const filename = `snaptokdl_${timestamp}.${extension}`;
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Download started!', 'success');
    } catch (err) {
      window.open(fileUrl, '_blank');
      showToast('Download opened in new tab', 'success');
    }
  };

  const downloadImage = async (imgUrl: string, index: number) => {
    try {
      showToast(t('common.loading'), 'success');
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(imgUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const timestamp = Date.now();
      const filename = `snaptokdl_${timestamp}_${index + 1}.jpg`;
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Image downloaded!', 'success');
    } catch (err) {
      window.open(imgUrl, '_blank');
      showToast('Image opened in new tab', 'success');
    }
  };

  return (
    <div className="min-h-[80vh] py-12 px-4 bg-white transition-colors duration-300">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed top-0 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-black text-white flex items-center space-x-3 ${
              toast.type === 'success' ? 'bg-black' : 'bg-red-600'
            }`}
          >
            <i className={`fas ${toast.type === 'success' ? 'fa-check-circle text-green-400' : 'fa-exclamation-circle'}`}></i>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-black tracking-tight">
            TikTok Search
          </h1>
          <p className="text-gray-500 font-bold text-lg">
            {t('common.searchPlaceholder')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-[2rem] shadow-2xl border border-gray-100">
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query, count)}
                placeholder={t('common.searchPlaceholder')}
                className="w-full pl-14 pr-14 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black text-gray-900 font-medium transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute inset-y-0 right-5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times-circle"></i>
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="px-6 py-5 bg-gray-100 border-none rounded-2xl text-gray-700 font-black focus:ring-2 focus:ring-black cursor-pointer"
              >
                {[5, 10, 20, 30, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <button
                onClick={() => handleSearch(query, count)}
                disabled={loading || !query}
                className="flex-grow md:flex-grow-0 flex items-center justify-center space-x-3 px-12 py-5 bg-black hover:bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-gray-200 disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? (
                  <i className="fas fa-circle-notch fa-spin text-xl"></i>
                ) : (
                  <>
                    <i className="fas fa-search"></i>
                    <span>{t('common.search')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-red-50 text-red-600 p-4 rounded-2xl font-bold border border-red-100 max-w-md mx-auto"
            >
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </motion.div>
          )}

          {loading && results.length === 0 && <SearchSkeleton />}

          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {results.map((video, idx) => (
                <motion.div
                  key={video.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 group flex flex-col hover:shadow-2xl transition-all duration-500"
                >
                  <div className="relative bg-black overflow-hidden aspect-[4/5]">
                    {playingVideo === video.id ? (
                      <video 
                        src={video.no_watermark} 
                        controls 
                        autoPlay 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <>
                        <img 
                          src={video.cover} 
                          alt={video.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button 
                            onClick={() => setPlayingVideo(video.id)}
                            className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/30 hover:scale-110 transition-transform"
                          >
                            <Play className="w-8 h-8 fill-current ml-1" />
                          </button>
                        </div>
                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg flex items-center space-x-1 text-white text-[10px] font-black">
                          <Eye className="w-3 h-3" />
                          <span>{formatNumber(video.stats?.plays ?? video.stats?.play_count ?? 0)}</span>
                        </div>
                        {video.duration && (
                          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-white font-black">
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="p-5 space-y-4 flex-grow flex flex-col">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={video.author?.avatar} 
                        className="w-10 h-10 rounded-full border-2 border-gray-50 shadow-sm shrink-0" 
                        alt={video.author?.nickname}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate">{video.author?.nickname}</p>
                        <p className="text-[10px] text-gray-400 font-bold truncate">@{video.author?.unique_id}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className={`text-sm text-gray-700 font-bold leading-tight ${expandedCaptions[video.id] ? '' : 'line-clamp-2'} transition-all duration-300`}>
                        {video.title || "TikTok Video"}
                      </p>
                      {video.title && video.title.length > 60 && (
                        <button 
                          onClick={() => toggleCaption(video.id)}
                          className="text-[10px] font-black text-black hover:underline flex items-center space-x-1"
                        >
                          <span>{expandedCaptions[video.id] ? 'Sembunyikan' : 'Selengkapnya'}</span>
                          <i className={`fas fa-chevron-${expandedCaptions[video.id] ? 'up' : 'down'} text-[8px]`}></i>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500/10" />
                        <span className="text-xs font-black text-gray-900">{formatNumber(video.stats?.likes ?? video.stats?.digg_count ?? 0)}</span>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(`https://www.tiktok.com/@${video.author?.unique_id}/video/${video.id}`)}
                        className="flex items-center space-x-1 text-gray-400 hover:text-black transition-colors"
                        title="Copy Video Link"
                      >
                        <i className="fas fa-link text-xs"></i>
                        <span className="text-[10px] font-bold">Copy Link</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => downloadFile(video.no_watermark, 'video')}
                        className="flex items-center justify-center space-x-2 py-3 bg-black text-white text-xs font-black rounded-xl hover:bg-gray-800 transition-all active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span>HD</span>
                      </button>
                      <button
                        onClick={() => downloadFile(video.music, 'audio')}
                        className="flex items-center justify-center space-x-2 py-3 bg-gray-100 text-gray-900 text-xs font-black rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                      >
                        <Music className="w-4 h-4" />
                        <span>MP3</span>
                      </button>
                      {video.images && video.images.length > 0 && (
                        <button
                          onClick={() => downloadImage(video.images[0], 0)}
                          className="col-span-2 flex items-center justify-center space-x-2 py-3 bg-gray-50 text-gray-900 text-xs font-black rounded-xl hover:bg-gray-100 transition-all active:scale-95"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Foto</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && results.length === 0 && query && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 py-32 space-y-4"
            >
              <i className="fas fa-search text-6xl opacity-20"></i>
              <p className="text-xl font-bold">{t('common.noResults')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
