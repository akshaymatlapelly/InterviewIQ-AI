import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { motion } from 'framer-motion';

export default function PerformanceCharts({ interviews = [] }) {
  const completed = [...interviews]
    .filter(i => i.status === 'completed')
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const totalCount = completed.length;
  const latest = completed[completed.length - 1];

  // 1. Line Chart Data
  const trendData = completed.map((i, idx) => ({
    name: `Round ${idx + 1}`,
    score: i.overall_score || 0
  }));

  // Fallback if empty
  const hasData = totalCount > 0;
  const displayTrendData = hasData ? trendData : [{ name: 'No Data', score: 0 }];

  // 2. Radar Chart Data
  const radarData = [
    { subject: 'Technical', value: latest?.technical_score || 0 },
    { subject: 'Communication', value: latest?.communication_score || 0 },
    { subject: 'Confidence', value: latest?.confidence_score || 0 },
    { subject: 'Fluency', value: latest?.fluency_score || 0 },
    { subject: 'Grammar', value: latest?.grammar_score || 0 },
    { subject: 'Behavioral/HR', value: latest?.hr_score || 0 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Trend Area Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="glass border border-white/5 p-6 rounded-2xl lg:col-span-2 space-y-4 transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.06)]"
      >
        <div>
          <h3 className="text-base font-bold text-white">Score Progression Trend</h3>
          <p className="text-xs text-slate-400">Track your performance averages over multiple rounds.</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 100]} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0d0e1c', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="glass border border-white/5 p-6 rounded-2xl space-y-4 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:border-cyan-500/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.06)]"
      >
        <div>
          <h3 className="text-base font-bold text-white">Latest Competency Radar</h3>
          <p className="text-xs text-slate-400">
            {hasData ? "Scoring metrics for your most recent interview." : "No completed interviews yet."}
          </p>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" r="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis 
                dataKey="subject" 
                stroke="#94a3b8" 
                fontSize={10} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                stroke="#475569" 
                fontSize={8} 
                tick={false}
              />
              <Radar 
                name="Latest Round" 
                dataKey="value" 
                stroke="#06b6d4" 
                fill="#06b6d4" 
                fillOpacity={0.25} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
export { PerformanceCharts };
