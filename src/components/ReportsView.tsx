import React, { useMemo, useState } from 'react';
import { Post, Batch } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, CheckCircle, Clock, Star, AlertCircle, Folder } from 'lucide-react';

interface ReportsViewProps {
  posts: Post[];
  batches?: Batch[];
}

export function ReportsView({ posts, batches = [] }: ReportsViewProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');

  // Filter posts based on selected batch
  const filteredPosts = useMemo(() => {
    if (selectedBatchId === 'all') return posts;
    return posts.filter(p => p.batchId === selectedBatchId);
  }, [posts, selectedBatchId]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredPosts.length;
    const approved = filteredPosts.filter(p => p.status.includes('approved') || p.status === 'published' || p.status === 'scheduled').length;
    const pending = filteredPosts.filter(p => ['copy_production', 'copy_sent', 'design_production', 'design_sent', 'scheduling'].includes(p.status)).length;
    const changes = filteredPosts.filter(p => p.status.includes('changes')).length;
    
    // Average Rating
    const ratedPosts = filteredPosts.filter(p => p.rating && p.rating > 0);
    const avgRating = ratedPosts.length > 0 
      ? (ratedPosts.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedPosts.length).toFixed(1)
      : 'N/A';

    // Approval Rate
    const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(0) + '%' : '0%';

    return { total, approved, pending, changes, avgRating, approvalRate };
  }, [filteredPosts]);

  // Data for Status Chart
  const statusData = [
    { name: 'Aprovados/Publicados', value: stats.approved, color: '#22c55e' },
    { name: 'Pendentes', value: stats.pending, color: '#0ea5e9' },
    { name: 'Ajustes', value: stats.changes, color: '#f97316' },
  ].filter(d => d.value > 0);

  // Data for Platform Chart
  const platformData = useMemo(() => {
    const platforms: Record<string, number> = { Instagram: 0, LinkedIn: 0, Facebook: 0 };
    filteredPosts.forEach(p => {
      if (platforms[p.platform] !== undefined) {
        platforms[p.platform]++;
      }
    });
    return Object.entries(platforms).map(([name, value]) => ({ name, value }));
  }, [filteredPosts]);

  return (
    <div className="space-y-6">
      {/* Batch Selector */}
      <div className="flex justify-end">
        <div className="flex flex-wrap items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-2 rounded-xl border border-white/40 dark:border-gray-700/50 shadow-sm w-full sm:w-fit transition-colors">
          <div className="hidden sm:flex items-center gap-2 px-3 text-gray-500 dark:text-gray-400 border-r border-white/20 dark:border-gray-700/50">
            <Folder className="w-4 h-4" />
            <span className="text-sm font-medium">Lote</span>
          </div>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-900 dark:text-gray-100 outline-none cursor-pointer flex-1 sm:flex-none min-w-[120px] sm:min-w-[150px] dark:bg-gray-800/0"
          >
            <option value="all" className="bg-white dark:bg-gray-800">Geral (Todos)</option>
            {batches
              .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
              .map(batch => (
                <option key={batch.id} value={batch.id} className="bg-white dark:bg-gray-800">{batch.name}</option>
              ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total de Posts" 
          value={stats.total.toString()} 
          icon={<Clock className="w-5 h-5 text-gray-600 dark:text-gray-300" />} 
        />
        <KpiCard 
          title="Taxa de Aprovação" 
          value={stats.approvalRate} 
          icon={<CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} 
          trend={stats.approved > 0 ? "Ótimo" : "Neutro"}
          trendColor={stats.approved > 0 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20" : "text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50"}
        />
        <KpiCard 
          title="Avaliação Média" 
          value={stats.avgRating} 
          icon={<Star className="w-5 h-5 text-yellow-500" />} 
          subtext="Baseado em posts avaliados"
        />
        <KpiCard 
          title="Solicitações de Ajuste" 
          value={stats.changes.toString()} 
          icon={<AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />} 
          trend={stats.changes === 0 ? "Excelente" : "Atenção"}
          trendColor={stats.changes === 0 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20" : "text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700/50 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Status dos Conteúdos</h3>
          <div className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', backgroundColor: 'rgba(31, 41, 55, 0.8)', backdropFilter: 'blur(8px)', color: '#f3f4f6' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Total</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {statusData.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </div>

        {/* Platform Chart */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700/50 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Distribuição por Plataforma</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', backgroundColor: 'rgba(31, 41, 55, 0.8)', backdropFilter: 'blur(8px)', color: '#f3f4f6' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="value" name="Posts" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, trendColor, icon, subtext }: { title: string, value: string, trend?: string, trendColor?: string, icon: React.ReactNode, subtext?: string }) {
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/40 dark:border-gray-700/50 transition-colors hover:shadow-lg hover:-translate-y-1 duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
        <div className="p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        {trend && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${trendColor || 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{subtext}</p>}
    </div>
  );
}
