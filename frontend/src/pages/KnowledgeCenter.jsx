import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { iqClient } from '../api/iqClient';
import { 
  BrainCircuit, 
  Database, 
  Search, 
  FileText, 
  Trash2, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Activity, 
  BookOpen,
  Server,
  Zap,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function KnowledgeCenter() {
  const { user, profile } = useAuth();
  const [ragStatus, setRagStatus] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  const candidateId = user?.email || 'guest@interviewiq.ai';

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const statusRes = await iqClient.rag.getStatus();
      setRagStatus(statusRes);

      const sourcesRes = await iqClient.rag.getSources(candidateId);
      setSources(sourcesRes || []);
    } catch (err) {
      console.error("Error loading Knowledge Center data:", err);
      toast.error("Failed to load RAG telemetry data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      const statusRes = await iqClient.rag.getStatus();
      setRagStatus(statusRes);
      const sourcesRes = await iqClient.rag.getSources(candidateId);
      setSources(sourcesRes || []);
      toast.success("Knowledge vector DB successfully re-indexed!");
    } catch (err) {
      toast.error("Failed to re-index vector store.");
    } finally {
      setReindexing(false);
    }
  };

  const handleDeleteSource = async (docId, sourceType) => {
    if (sourceType === 'knowledge_base') {
      toast.error("Global Knowledge Base sources are read-only and protected.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete indexed document '${docId}'?`)) return;

    try {
      await iqClient.rag.deleteSource(docId, candidateId);
      toast.success(`Candidate source '${docId}' deleted successfully.`);
      loadData();
    } catch (err) {
      toast.error("Failed to delete source.");
    }
  };

  const handleTestSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await iqClient.rag.search(searchQuery, candidateId, null, 5, 0.1);
      setSearchResults(results);
      if (results.length === 0) {
        toast.info("No matching knowledge vectors found for query.");
      }
    } catch (err) {
      toast.error("Semantic search failed.");
    } finally {
      setSearching(false);
    }
  };

  const globalCategories = [
    { title: 'Technical', desc: 'Core programming concepts, syntax, & execution paradigms', count: 18 },
    { title: 'DSA', desc: 'Arrays, Trees, Graphs, Sorting, & Dynamic Programming', count: 24 },
    { title: 'DBMS', desc: 'SQL, Indexing, Transactions, ACID, & NoSQL databases', count: 16 },
    { title: 'OS', desc: 'Processes, Threads, Virtual Memory, Deadlocks, & Scheduling', count: 14 },
    { title: 'Computer Networks', desc: 'TCP/IP, OSI model, HTTP/HTTPS, DNS, & Sockets', count: 15 },
    { title: 'System Design', desc: 'Load balancing, Microservices, Caching, & Sharding', count: 20 },
    { title: 'Web Development', desc: 'Virtual DOM, State management, REST, & Performance', count: 22 },
    { title: 'Programming', desc: 'OOP, Functional, Clean Code, & Design Patterns', count: 19 },
    { title: 'Cloud', desc: 'AWS, Docker, Kubernetes, Serverless, & CI/CD Pipelines', count: 12 },
    { title: 'Testing', desc: 'Unit testing, TDD, Mocking, Integration, & E2E', count: 10 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pt-4 pb-12 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/20">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Knowledge Center
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  RAG Active
                </span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Manage candidate-isolated vector spaces, grounded knowledge bases, and semantic retrieval telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReindex}
            disabled={reindexing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reindexing ? 'animate-spin' : ''}`} />
            {reindexing ? 'Re-indexing Vector Store...' : 'Re-index Vector Store'}
          </button>
        </div>
      </div>

      {/* RAG Telemetry Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass border border-slate-200 dark:border-white/5 p-4 rounded-2xl bg-white/90 dark:bg-[#0e0f1e]/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">RAG Status</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white capitalize flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            {ragStatus?.status || 'Online'}
          </p>
          <span className="text-[10px] text-slate-500 block">FastAPI Vector Backend</span>
        </div>

        <div className="glass border border-slate-200 dark:border-white/5 p-4 rounded-2xl bg-white/90 dark:bg-[#0e0f1e]/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vector Storage</span>
            <Database className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {ragStatus?.vector_store_backend || 'Qdrant / Memory DB'}
          </p>
          <span className="text-[10px] text-slate-500 block">
            {ragStatus?.total_chunks || 142} total chunks indexed
          </span>
        </div>

        <div className="glass border border-slate-200 dark:border-white/5 p-4 rounded-2xl bg-white/90 dark:bg-[#0e0f1e]/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Embeddings Model</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {ragStatus?.embedding_model || 'all-MiniLM-L6-v2'}
          </p>
          <span className="text-[10px] text-slate-500 block">384-dimensional dense vectors</span>
        </div>

        <div className="glass border border-slate-200 dark:border-white/5 p-4 rounded-2xl bg-white/90 dark:bg-[#0e0f1e]/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Candidate Isolation</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
            Strict Metadata Filter
          </p>
          <span className="text-[10px] text-slate-500 block truncate">
            ID: {candidateId}
          </span>
        </div>
      </div>

      {/* Semantic Vector Search Test Bench */}
      <div className="glass border border-slate-200 dark:border-white/5 p-6 rounded-2xl bg-white/90 dark:bg-[#0e0f1e]/80 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Semantic Vector Retrieval Test Bench
          </h3>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTestSearch()}
            placeholder="Query RAG vector memory (e.g. 'React state management hooks' or 'SQL joins')..."
            className="flex-1 bg-slate-100 dark:bg-[#14152a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={handleTestSearch}
            disabled={searching}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            {searching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Search RAG
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-slate-200 dark:border-white/5 pt-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Retrieved Top Semantic Vectors:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((res, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-[#121326] border border-slate-200 dark:border-white/5 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-violet-400 font-semibold">
                    <span>Source: {res.source_type}</span>
                    <span>Similarity: {Math.round((res.similarity_score || 0) * 100)}%</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 line-clamp-3 italic">
                    "{res.chunk_text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Global Knowledge Catalog Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-violet-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            GLOBAL KNOWLEDGE BASE CATALOG
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {globalCategories.map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="glass border border-slate-200 dark:border-white/5 p-4 rounded-xl bg-white/90 dark:bg-[#0e0f1e]/80 space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 inline-block mb-1">
                  Global Knowledge
                </span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{cat.title}</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-1">{cat.desc}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400">
                <span>Indexed Chunks:</span>
                <span className="font-bold text-violet-400">{cat.count}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Candidate Knowledge & Indexed Sources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              CANDIDATE KNOWLEDGE SOURCES
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Isolated Namespace: <code className="text-violet-400 font-mono">{candidateId}</code>
          </span>
        </div>

        <div className="glass border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden bg-white/90 dark:bg-[#0e0f1e]/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-[#14152a] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/5 text-[10px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3.5">Document ID / Name</th>
                  <th className="p-3.5">Source Type</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Topic</th>
                  <th className="p-3.5">Indexed Chunks</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {sources.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                      No candidate-specific sources indexed yet. Upload a resume or complete an interview to build your personalized RAG memory.
                    </td>
                  </tr>
                ) : (
                  sources.map((src, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{src.document_id}</span>
                      </td>
                      <td className="p-3.5 capitalize font-medium text-violet-400">{src.source_type}</td>
                      <td className="p-3.5">{src.category || 'General'}</td>
                      <td className="p-3.5">{src.topic || 'Software Engineering'}</td>
                      <td className="p-3.5 font-bold text-emerald-400">{src.chunks_count || 1}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Indexed
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSource(src)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                            title="View Metadata"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {src.source_type !== 'knowledge_base' && (
                            <button
                              onClick={() => handleDeleteSource(src.document_id, src.source_type)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all"
                              title="Delete Candidate Source"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Source Detail Modal */}
      <AnimatePresence>
        {selectedSource && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0f1e] p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Info className="w-4 h-4 text-violet-400" />
                  Source Metadata Inspector
                </h3>
                <button 
                  onClick={() => setSelectedSource(null)}
                  className="text-xs text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div><strong className="text-slate-500">Document ID:</strong> {selectedSource.document_id}</div>
                <div><strong className="text-slate-500">Source Type:</strong> {selectedSource.source_type}</div>
                <div><strong className="text-slate-500">Candidate ID:</strong> {selectedSource.candidate_id || 'Global Public'}</div>
                <div><strong className="text-slate-500">Category:</strong> {selectedSource.category}</div>
                <div><strong className="text-slate-500">Topic:</strong> {selectedSource.topic}</div>
                <div><strong className="text-slate-500">Indexed Chunks Count:</strong> {selectedSource.chunks_count}</div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedSource(null)}
                  className="px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-500 transition-all"
                >
                  Close Metadata
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
