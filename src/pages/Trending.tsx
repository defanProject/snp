import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Play, Heart, MessageCircle, Share2, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface TrendingVideo {
  id: string;
  title: string;
  cover: string;
  author: {
    nickname: string;
    unique_id: string;
    avatar: string;
  };
  stats: {
    play_count: number;
    digg_count: number;
    comment_count: number;
    share_count: number;
  };
}

const MOCK_TRENDING: TrendingVideo[] = [
  {
    id: '1',
    title: 'Amazing dance moves! #dance #trending',
    cover: 'https://picsum.photos/seed/dance/400/600',
    author: {
      nickname: 'DanceMaster',
      unique_id: 'dancemaster_official',
      avatar: 'https://picsum.photos/seed/avatar1/100/100'
    },
    stats: {
      play_count: 1200000,
      digg_count: 85000,
      comment_count: 1200,
      share_count: 5400
    }
  },
  {
    id: '2',
    title: 'Cute kitten doing funny things 🐱 #cats #funny',
    cover: 'https://picsum.photos/seed/cat/400/600',
    author: {
      nickname: 'CatLovers',
      unique_id: 'catlovers_daily',
      avatar: 'https://picsum.photos/seed/avatar2/100/100'
    },
    stats: {
      play_count: 2500000,
      digg_count: 320000,
      comment_count: 4500,
      share_count: 12000
    }
  },
  {
    id: '3',
    title: 'Delicious street food in Bangkok! 🍜 #foodie #travel',
    cover: 'https://picsum.photos/seed/food/400/600',
    author: {
      nickname: 'TravelEats',
      unique_id: 'traveleats_world',
      avatar: 'https://picsum.photos/seed/avatar3/100/100'
    },
    stats: {
      play_count: 800000,
      digg_count: 45000,
      comment_count: 800,
      share_count: 2100
    }
  },
  {
    id: '4',
    title: 'Satisfying satisfying satisfying! #satisfying #asmr',
    cover: 'https://picsum.photos/seed/asmr/400/600',
    author: {
      nickname: 'ASMRRelax',
      unique_id: 'asmr_relax_daily',
      avatar: 'https://picsum.photos/seed/avatar4/100/100'
    },
    stats: {
      play_count: 4200000,
      digg_count: 560000,
      comment_count: 9200,
      share_count: 45000
    }
  }
];

export default function Trending() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black text-gray-900 mb-4"
        >
          Trending Now
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 font-bold"
        >
          Discover the most popular videos on TikTok right now.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_TRENDING.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 group hover:shadow-2xl transition-all"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img 
                src={video.cover} 
                alt={video.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <button 
                  onClick={() => navigate(`/${lang}/tiktok-download?url=https://www.tiktok.com/@${video.author.unique_id}/video/${video.id}`)}
                  className="w-full py-3 bg-white text-black font-black rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Now</span>
                </button>
              </div>
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg flex items-center space-x-1 text-white">
                <Play className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-bold">{formatNumber(video.stats.play_count)}</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <img 
                  src={video.author.avatar} 
                  alt={video.author.nickname} 
                  className="w-8 h-8 rounded-full border border-gray-100"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-gray-900 truncate">{video.author.nickname}</p>
                  <p className="text-[10px] text-gray-400 font-bold truncate">@{video.author.unique_id}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 font-bold line-clamp-2 leading-tight">
                {video.title}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center space-x-1 text-gray-400">
                  <Heart className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{formatNumber(video.stats.digg_count)}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-400">
                  <MessageCircle className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{formatNumber(video.stats.comment_count)}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-400">
                  <Share2 className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{formatNumber(video.stats.share_count)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
