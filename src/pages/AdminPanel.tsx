import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import axios from 'axios';

export default function AdminPanel() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
      setMaintenance(response.data.app.isMaintenance);
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleMaintenance = async () => {
    try {
      const newStatus = !maintenance;
      const response = await axios.post('/api/admin/maintenance', { status: newStatus });
      if (response.data.success) {
        setMaintenance(newStatus);
      }
    } catch (error) {
      alert('Gagal mengubah status maintenance.');
      console.error(error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <i className="fas fa-circle-notch fa-spin text-4xl text-purple-500"></i>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Admin <span className="text-purple-500">Dashboard</span></h1>
            <p className="text-gray-400 font-medium">Real-time server & application monitoring</p>
          </div>
          <button 
            onClick={toggleMaintenance}
            className={`px-8 py-4 rounded-2xl font-black transition-all shadow-xl ${
              maintenance 
                ? 'bg-red-500 text-white shadow-red-900/20' 
                : 'bg-green-500 text-white shadow-green-900/20'
            }`}
          >
            <i className={`fas ${maintenance ? 'fa-toggle-on' : 'fa-toggle-off'} mr-2`}></i>
            Maintenance Mode: {maintenance ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Requests" value={stats.app.totalRequests} icon="fa-network-wired" color="blue" />
          <StatCard title="Total Downloads" value={stats.app.totalDownloads} icon="fa-download" color="purple" />
          <StatCard title="API Usage" value={stats.app.totalApiUsage} icon="fa-cloud" color="pink" />
          <StatCard title="Active Sessions" value={stats.app.activeSessions} icon="fa-users" color="indigo" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-[2.5rem] p-8 backdrop-blur-xl">
              <h2 className="text-xl font-black mb-6 flex items-center">
                <i className="fas fa-server mr-3 text-purple-500"></i> System Resources
              </h2>
              <div className="space-y-8">
                <ResourceBar label="CPU Usage" percent={stats.system.cpu} color="purple" />
                <ResourceBar label="RAM Usage" percent={stats.system.ram.percent} subtext={`${stats.system.ram.used}GB / ${stats.system.ram.total}GB`} color="pink" />
                <ResourceBar label="Disk Usage" percent={stats.system.disk.percent} subtext={`${stats.system.disk.used}GB / ${stats.system.disk.total}GB`} color="indigo" />
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-[2.5rem] p-8 backdrop-blur-xl">
              <h2 className="text-xl font-black mb-6 flex items-center">
                <i className="fas fa-history mr-3 text-purple-500"></i> Recent Downloads
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-xs font-black uppercase tracking-widest border-b border-gray-700">
                      <th className="pb-4">Video ID</th>
                      <th className="pb-4">Title</th>
                      <th className="pb-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {stats.app.recentDownloads.map((dl: any, i: number) => (
                      <tr key={i} className="text-sm font-medium hover:bg-white/5 transition-colors">
                        <td className="py-4 text-purple-400">#{dl.id}</td>
                        <td className="py-4 line-clamp-1 max-w-xs">{dl.title}</td>
                        <td className="py-4 text-gray-500">{new Date(dl.time).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-[2.5rem] p-8 backdrop-blur-xl">
              <h2 className="text-xl font-black mb-6 flex items-center">
                <i className="fas fa-info-circle mr-3 text-purple-500"></i> Server Info
              </h2>
              <div className="space-y-4">
                <InfoRow label="Platform" value={stats.system.platform} />
                <InfoRow label="Uptime" value={`${Math.floor(stats.system.uptime / 3600)}h ${Math.floor((stats.system.uptime % 3600) / 60)}m`} />
                <InfoRow label="Node Version" value={process.version} />
                <InfoRow label="Environment" value={process.env.NODE_ENV || 'development'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'from-blue-500 to-cyan-500 shadow-blue-900/20',
    purple: 'from-purple-500 to-indigo-500 shadow-purple-900/20',
    pink: 'from-pink-500 to-rose-500 shadow-pink-900/20',
    indigo: 'from-indigo-500 to-violet-500 shadow-indigo-900/20'
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-[2.5rem] backdrop-blur-xl space-y-4">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg`}>
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      <div>
        <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function ResourceBar({ label, percent, subtext, color }: any) {
  const colors: any = {
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="font-black text-sm">{label}</span>
        <div className="text-right">
          <span className="text-xl font-black">{percent}%</span>
          {subtext && <p className="text-[10px] text-gray-500 font-bold uppercase">{subtext}</p>}
        </div>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${colors[color]} rounded-full shadow-lg`}
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-700/50 last:border-0">
      <span className="text-gray-500 text-xs font-black uppercase tracking-widest">{label}</span>
      <span className="font-bold text-sm">{value}</span>
    </div>
  );
}
