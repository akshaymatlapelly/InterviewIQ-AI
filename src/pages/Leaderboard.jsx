import React, { useEffect, useState } from 'react';
import { base44 } from '../api/base44Client';
import { 
  Trophy, 
  Medal, 
  Loader2, 
  Search, 
  Calendar,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import moment from 'moment';

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch completed interviews sorted by overall_score descending
        const list = await base44.entities.Interview.list();
        const completed = (list || [])
          .filter(i => i.status === 'completed' && typeof i.overall_score === 'number')
          .sort((a, b) => b.overall_score - a.overall_score);

        // Group by user email, keeping the best score per user
        const seen = new Set();
        const uniqueEntries = [];
        
        for (const item of completed) {
          // Since the client fetches public data, the created_by/owner's email can be used.
          // Fallback to owner key or generic identifier if email field is missing.
          const userKey = item.created_by || 'anonymous';
          
          if (!seen.has(userKey)) {
            seen.add(userKey);
            uniqueEntries.push({
              id: item.id,
              userEmail: userKey,
              score: item.overall_score,
              role: item.job_role,
              date: item.created_date
            });
          }
          if (uniqueEntries.length >= 50) break;
        }

        setEntries(uniqueEntries);
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-sm text-slate-400 font-display">Assembling global ranking...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-4 pb-10">
      <div className="space-y-1.5">
        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          Global Leaderboard <Trophy className="text-amber-400 w-6 h-6 animate-pulse" />
        </h2>
        <p className="text-sm text-slate-400">Best scoring mock round attempts recorded across the platform.</p>
      </div>

      {entries.length > 0 ? (
        <div className="glass border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-4 bg-white/2 border-b border-white/5 text-[10px] uppercase font-bold tracking-wider text-slate-500">
            <div className="col-span-2">Rank</div>
            <div className="col-span-5 sm:col-span-6">Candidate Reference</div>
            <div className="col-span-3 sm:col-span-2 text-right">Job Role</div>
            <div className="col-span-2 text-right">Score Rating</div>
          </div>

          {/* Entries list */}
          <div className="divide-y divide-white/5">
            {entries.map((entry, idx) => {
              const rank = idx + 1;
              const isTopThree = rank <= 3;
              
              let rankBadge = null;
              if (rank === 1) rankBadge = <Trophy className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />;
              else if (rank === 2) rankBadge = <Medal className="w-5 h-5 text-slate-300" />;
              else if (rank === 3) rankBadge = <Medal className="w-5 h-5 text-amber-700" />;

              return (
                <div 
                  key={entry.id} 
                  className={`grid grid-cols-12 px-6 py-4 items-center transition-colors hover:bg-white/1 ${
                    rank === 1 ? 'bg-amber-500/3' : rank === 2 ? 'bg-slate-400/2' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-2 flex items-center gap-2 text-sm font-bold text-slate-400">
                    {rankBadge ? (
                      <span className="w-8 flex justify-center">{rankBadge}</span>
                    ) : (
                      <span className="w-8 pl-1.5">{rank}</span>
                    )}
                  </div>

                  {/* Email Identifier */}
                  <div className="col-span-5 sm:col-span-6 overflow-hidden">
                    <span className={`text-xs font-semibold block truncate text-slate-200 ${
                      rank === 1 ? 'text-white font-bold gradient-text' : ''
                    }`}>
                      {entry.userEmail.includes('@') 
                        ? entry.userEmail.split('@')[0] + '@***.com' 
                        : entry.userEmail.slice(0, 10) + '...'}
                    </span>
                    <span className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={10} />
                      {moment(entry.date).format('MMM Do YYYY')}
                    </span>
                  </div>

                  {/* Target role */}
                  <div className="col-span-3 sm:col-span-2 text-right overflow-hidden">
                    <span className="text-[10px] font-medium text-slate-400 truncate block">
                      {entry.role || 'General'}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-display font-black ${
                      isTopThree ? 'text-violet-400' : 'text-slate-300'
                    }`}>
                      {entry.score}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass p-12 rounded-2xl border border-white/5 text-center max-w-xl mx-auto space-y-4 py-16">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Scores Logged</h3>
          <p className="text-slate-400 text-sm">
            Mock trials must be completed by candidates before entries populate the leader board.
          </p>
        </div>
      )}
    </div>
  );
}
export { Leaderboard };
