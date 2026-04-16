import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { ResultSkeleton } from '../components/Skeleton';
import { Share2, Send, MessageCircle, Download, Image as ImageIcon, ChevronLeft, ChevronRight, Music as MusicIcon } from 'lucide-react';
import JSZip from 'jszip';

export default function Home() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [url, setUrl] = useState(searchParams.get('url') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [showFullCaption, setShowFullCaption] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

  const downloadAllAsZip = async () => {
    if (!result || !result.images || result.images.length === 0) return;
    
    try {
      setLoading(true);
      showToast('Preparing ZIP file...', 'success');
      const zip = new JSZip();
      
      const downloadPromises = result.images.map(async (imgUrl: string, index: number) => {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(imgUrl)}`;
        const response = await fetch(proxyUrl);
        const blob = await response.blob();
        zip.file(`photo_${index + 1}.jpg`, blob);
      });
      
      await Promise.all(downloadPromises);
      
      const content = await zip.generateAsync({ type: 'blob' });
      const timestamp = Date.now();
      const filename = `snaptokdl_photos_${timestamp}.zip`;
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('ZIP Download started!', 'success');
    } catch (err) {
      showToast('Failed to create ZIP', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      handleDownload(urlParam);
    }
  }, []);

  const handleDownload = async (targetUrl: string) => {
    if (!targetUrl) return;
    setLoading(true);
    setError('');
    setIsPlaying(false);
    try {
      const response = await axios.post('/api/tiktok/download', { url: targetUrl });
      setResult(response.data);
      setSearchParams({ url: targetUrl });
      setCurrentImageIndex(0);
      setIsPlaying(false);
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }
      const text = await navigator.clipboard.readText();
      setUrl(text);
      showToast('Link pasted!', 'success');
    } catch (err) {
      // Fallback for browsers that don't support clipboard API or block it
      showToast('Please paste manually or allow clipboard access.', 'error');
    }
  };

  const formatNumber = (num: any) => {
    const n = Number(num);
    if (isNaN(n)) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center py-12 px-4 bg-white transition-colors duration-300">
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

      <div className="w-full max-w-5xl text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900">
            SnapTok
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-bold">
            {t('common.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group max-w-3xl mx-auto w-full"
        >
          <div className="absolute -inset-1 bg-black rounded-[2rem] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
          <div className="relative flex flex-col md:flex-row gap-3 bg-white p-3 rounded-[2rem] shadow-2xl border border-gray-100">
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <i className="fas fa-link text-gray-400"></i>
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('common.placeholder')}
                className="w-full pl-14 pr-14 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black text-gray-900 font-medium transition-all"
              />
              {url && (
                <button
                  onClick={() => setUrl('')}
                  className="absolute inset-y-0 right-5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times-circle"></i>
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePaste}
                className="flex items-center justify-center space-x-2 px-8 py-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-all"
              >
                <i className="fas fa-paste"></i>
                <span className="hidden md:inline">{t('common.paste')}</span>
              </button>
              <button
                onClick={() => handleDownload(url)}
                disabled={loading || !url}
                className="flex-grow md:flex-grow-0 flex items-center justify-center space-x-3 px-12 py-5 bg-black hover:bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-gray-200 disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? (
                  <i className="fas fa-circle-notch fa-spin text-xl"></i>
                ) : (
                  <>
                    <i className="fas fa-download"></i>
                    <span>{t('common.download')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col items-center space-y-3">
          <p className="text-sm text-gray-400 font-medium">
            <i className="fas fa-info-circle mr-2"></i>
            {t('common.example').split(':')[0]}:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'https://www.tiktok.com/@tiktok/video/7311721535948066054',
              'https://www.tiktok.com/@khaby.lame/video/7326264567890123456',
              'https://vt.tiktok.com/ZSNvS8X5R/'
            ].map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setUrl(ex);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider rounded-xl border border-gray-100 transition-all active:scale-95"
              >
                Example {i + 1}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-100 text-red-600 px-8 py-5 rounded-2xl font-bold max-w-md mx-auto"
            >
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </motion.div>
          )}

          {loading && !result && <ResultSkeleton />}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-w-md mx-auto w-full text-left ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900">result from snaptok.lol</h2>
                <button 
                  onClick={() => setResult(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Preview */}
                <div className="relative aspect-[4/5] bg-black rounded-2xl overflow-hidden group">
                  {result.images && result.images.length > 0 ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentImageIndex}
                          src={result.images[currentImageIndex]}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="max-w-full max-h-full object-contain cursor-pointer"
                          referrerPolicy="no-referrer"
                          onClick={() => downloadImage(result.images[currentImageIndex], currentImageIndex)}
                        />
                      </AnimatePresence>
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 sm:px-4 pointer-events-none">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev > 0 ? prev - 1 : result.images.length - 1); }} 
                          className="w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-xl flex items-center justify-center hover:bg-black/60 transition-all shadow-lg pointer-events-auto active:scale-90"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev < result.images.length - 1 ? prev + 1 : 0); }} 
                          className="w-10 h-10 bg-black/40 backdrop-blur-md text-white rounded-xl flex items-center justify-center hover:bg-black/60 transition-all shadow-lg pointer-events-auto active:scale-90"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] text-white font-black flex flex-col items-center space-y-1 shadow-2xl border border-white/10">
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="w-3 h-3 text-gray-400" />
                          <span>{currentImageIndex + 1} / {result.images.length}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-green-400">
                          <i className="fas fa-hand-pointer text-[8px] animate-bounce"></i>
                          <span className="uppercase tracking-tighter">Klik Foto untuk Simpan</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center relative">
                      <img 
                        src={result.cover} 
                        alt={result.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-white font-bold">
                        {result.duration ? `${Math.floor(result.duration / 60)}:${(result.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Author Info */}
                <div className="flex items-center space-x-3">
                  <img 
                    src={result.author?.avatar} 
                    className="w-12 h-12 rounded-full border-2 border-gray-50" 
                    alt={result.author?.nickname}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-black text-gray-900 leading-none">{result.author?.nickname}</p>
                    <p className="text-sm text-gray-500 font-bold mt-1">@{result.author?.unique_id}</p>
                  </div>
                </div>

                {/* Caption */}
                <p className="text-sm text-gray-700 font-bold leading-relaxed line-clamp-3">
                  {result.title}
                </p>

                {/* Stats */}
                <div className="flex items-center space-x-6 text-gray-600 py-2">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-play text-xs"></i>
                    <span className="text-xs font-bold">{formatNumber(result.stats?.plays ?? result.stats?.play_count ?? 0)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="far fa-heart text-xs"></i>
                    <span className="text-xs font-bold">{formatNumber(result.stats?.likes ?? result.stats?.digg_count ?? 0)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="far fa-comment text-xs"></i>
                    <span className="text-xs font-bold">{formatNumber(result.stats?.comments ?? result.stats?.comment_count ?? 0)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-share text-xs"></i>
                    <span className="text-xs font-bold">{formatNumber(result.stats?.shares ?? result.stats?.share_count ?? 0)}</span>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="flex flex-col space-y-2">
                  {(!result.images || result.images.length === 0) && (
                    <>
                      <button
                        onClick={() => downloadFile(result.no_watermark, 'video')}
                        className="flex items-center justify-center space-x-3 p-4 bg-black text-white font-black rounded-xl hover:bg-gray-800 transition-all active:scale-95"
                      >
                        <i className="fas fa-video"></i>
                        <span>HD Without Watermark</span>
                      </button>
                      <button
                        onClick={() => downloadFile(result.watermark, 'video')}
                        className="flex items-center justify-center space-x-3 p-4 bg-gray-100 text-gray-900 font-black rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                      >
                        <i className="fas fa-video"></i>
                        <span>SD Without Watermark</span>
                      </button>
                      <button
                        onClick={() => downloadFile(result.watermark, 'video')}
                        className="flex items-center justify-center space-x-3 p-4 bg-white border border-gray-200 text-gray-900 font-black rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                      >
                        <i className="fas fa-video"></i>
                        <span>Download with Watermark</span>
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => downloadFile(result.music, 'audio')}
                    className="flex items-center justify-center space-x-3 p-4 bg-white border border-gray-200 text-gray-900 font-black rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <MusicIcon className="w-5 h-5" />
                    <span>Download Audio/Musik</span>
                  </button>

                  {result.images && result.images.length > 0 && (
                    <button
                      onClick={downloadAllAsZip}
                      className="flex items-center justify-center space-x-3 p-4 bg-black text-white font-black rounded-xl hover:bg-gray-800 transition-all active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download All Photos (ZIP)</span>
                    </button>
                  )}
                </div>

                {/* Direct Share Section */}
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Share to Social Media</p>
                  <div className="flex justify-center space-x-3">
                    <button 
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this TikTok video: ${url}`)}`, '_blank')}
                      className="w-12 h-12 bg-[#25D366] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform overflow-hidden"
                    >
                      <img src="/image/whatsapp.jpg" alt="WhatsApp" className="w-full h-full object-cover" />
                    </button>
                    <button 
                      onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out this TikTok video')}`, '_blank')}
                      className="w-12 h-12 bg-[#0088cc] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform overflow-hidden"
                    >
                      <img src="/image/telegram.jpg" alt="Telegram" className="w-full h-full object-cover" />
                    </button>
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'SnapTok Download',
                            text: result.title,
                            url: window.location.href
                          });
                        } else {
                          showToast('Sharing not supported on this browser', 'error');
                        }
                      }}
                      className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Music Info */}
                <div className="p-3 bg-gray-50 rounded-2xl flex items-center space-x-3 text-gray-500">
                  <i className="fas fa-music text-xs"></i>
                  <p className="text-xs font-bold truncate">
                    {result.music_info?.title === "original sound" || !result.music_info?.title 
                      ? `original sound - ${result.author?.nickname || result.author?.unique_id || 'TikTok User'}`
                      : result.music_info?.title}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-24 space-y-20 text-left">
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900">{t('common.howToUse')}</h2>
              <p className="text-gray-500 font-bold max-w-2xl mx-auto">Follow these 3 easy steps to download your favorite TikTok videos without watermark for free.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((step) => (
                <motion.div 
                  key={step} 
                  whileHover={{ y: -10 }}
                  className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-8 relative overflow-hidden group transition-all"
                >
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-2xl shadow-gray-200 relative z-10 transform -rotate-6 group-hover:rotate-0 transition-transform">
                    {step}
                  </div>
                  <div className="space-y-4 relative z-10">
                    <h3 className="text-xl font-black text-gray-900">
                      {step === 1 ? 'Copy Link' : step === 2 ? 'Paste Link' : 'Download'}
                    </h3>
                    <p className="text-gray-500 text-lg font-bold leading-relaxed">
                      {t(`common.step${step}` as any)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
