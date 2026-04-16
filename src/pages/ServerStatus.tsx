import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Database, 
  Clock, 
  Download, 
  Search, 
  AlertCircle, 
  CheckCircle2,
  RefreshCcw,
  Terminal
} from 'lucide-react';

interface Stats {
  status: string;
  time: string;
  osUptime: number;
  processUptime: number;
  versions: {
    node: string;
    npm: string;
    ubuntu: string;
  };
  cpu: {
    percent: number;
    cores: number;
    model: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percent: number;
  };
  disk: {
    total: number;
    used: number;
    percent: number;
  };
  stats: {
    totalRequests: number;
    downloadSuccess: number;
    downloadFail: number;
    searchSuccess: number;
    searchFail: number;
  };
}

export default function ServerStatus() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/health');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(t('status.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <RefreshCcw className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {t('status.title').split(' ')[0]} <span className="text-gray-400">{t('status.title').split(' ')[1]}</span>
          </h1>
          <p className="text-gray-500 font-bold mt-1">{t('status.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
          <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
          <span className="text-sm font-black uppercase tracking-widest text-gray-600">
            {error ? t('status.offline') : t('status.online')}
          </span>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<Cpu className="w-6 h-6" />} 
            label={t('status.cpu')} 
            value={`${stats.cpu.percent}%`} 
            subValue={`${stats.cpu.cores} Cores`}
            progress={stats.cpu.percent}
          />
          <StatCard 
            icon={<Activity className="w-6 h-6" />} 
            label={t('status.ram')} 
            value={`${stats.memory.percent}%`} 
            subValue={`${formatBytes(stats.memory.used)} / ${formatBytes(stats.memory.total)}`}
            progress={stats.memory.percent}
          />
          <StatCard 
            icon={<HardDrive className="w-6 h-6" />} 
            label={t('status.disk')} 
            value={`${stats.disk.percent}%`} 
            subValue={`${formatBytes(stats.disk.used)} / ${formatBytes(stats.disk.total)}`}
            progress={stats.disk.percent}
          />
          <StatCard 
            icon={<Clock className="w-6 h-6" />} 
            label={t('status.uptime')} 
            value={formatUptime(stats.osUptime)} 
            subValue={t('status.uptimeSub')}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">{t('status.performance')}</h2>
              <Database className="w-6 h-6 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <MetricBox 
                icon={<Download className="w-5 h-5" />} 
                label={t('status.downloads')} 
                success={stats?.stats.downloadSuccess || 0} 
                fail={stats?.stats.downloadFail || 0} 
                t={t}
              />
              <MetricBox 
                icon={<Search className="w-5 h-5" />} 
                label={t('status.searches')} 
                success={stats?.stats.searchSuccess || 0} 
                fail={stats?.stats.searchFail || 0} 
                t={t}
              />
            </div>

            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{t('status.totalRequests')}</p>
                <p className="text-3xl font-black text-gray-900">{stats?.stats.totalRequests.toLocaleString()}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{t('status.lastUpdate')}</p>
                <p className="text-sm font-bold text-gray-600">{new Date(stats?.time || '').toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Software Versions */}
        <div className="bg-black text-white p-8 rounded-[2.5rem] shadow-xl space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">{t('status.environment')}</h2>
            <Terminal className="w-6 h-6 text-gray-500" />
          </div>
          
          <div className="space-y-6">
            <VersionItem label="Node.js" value={stats?.versions.node || ''} />
            <VersionItem label="NPM" value={stats?.versions.npm || ''} />
            <VersionItem label="Ubuntu" value={stats?.versions.ubuntu || ''} />
            <VersionItem label={t('status.platform')} value="Linux x64" />
          </div>

          <div className="pt-8 border-t border-gray-800">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t('status.cpuModel')}</p>
            <p className="text-sm font-bold text-gray-300 leading-relaxed">
              {stats?.cpu.model}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, progress }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
        <p className="text-xs font-bold text-gray-500 mt-1">{subValue}</p>
      </div>
      {progress !== undefined && (
        <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-black"
          />
        </div>
      )}
    </motion.div>
  );
}

function MetricBox({ icon, label, success, fail, t }: any) {
  const total = success + fail;
  const successRate = total > 0 ? Math.round((success / total) * 100) : 100;

  return (
    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
      <div className="flex items-center space-x-3">
        <div className="text-gray-900">{icon}</div>
        <span className="font-black text-gray-900 uppercase tracking-widest text-sm">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-black uppercase">{t('status.success')}</span>
          </div>
          <p className="text-xl font-black text-gray-900">{success.toLocaleString()}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-black uppercase">{t('status.failed')}</span>
          </div>
          <p className="text-xl font-black text-gray-900">{fail.toLocaleString()}</p>
        </div>
      </div>
      <div className="pt-2">
        <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-1">
          <span>{t('status.successRate')}</span>
          <span>{successRate}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500" style={{ width: `${successRate}%` }} />
        </div>
      </div>
    </div>
  );
}

function VersionItem({ label, value }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-bold text-gray-300 bg-gray-900 px-3 py-1 rounded-lg border border-gray-800">
        {value}
      </span>
    </div>
  );
}
