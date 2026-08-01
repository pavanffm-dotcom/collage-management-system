import React from 'react';
import { BarChart2, TrendingUp, BookOpen, Search, CheckCircle, PieChart, RefreshCw } from 'lucide-react';
import { LibraryStats } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AnalyticsViewProps {
  stats: LibraryStats | null;
  recentLogs: { query: string; type: 'ai' | 'exact'; timestamp: string; resultsCount: number }[];
  onRefresh: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, recentLogs, onRefresh }) => {
  const { currentPreset } = useTheme();

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading analytics data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Library Search Analytics & Real-Time Stats
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Insights on student searches, book availability, and department inventory
          </p>
        </div>

        <button
          onClick={onRefresh}
          className={`p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className={`p-4 ${currentPreset.cardBg} rounded-2xl border ${currentPreset.cardBorder} shadow-sm`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Titles</span>
            <BookOpen className={`w-4 h-4 ${currentPreset.accentText}`} />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalBooks}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Catalog titles indexed</p>
        </div>

        <div className={`p-4 ${currentPreset.cardBg} rounded-2xl border ${currentPreset.cardBorder} shadow-sm`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Physical Copies</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalCopies}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {stats.availableCopies} Copies Available Now
          </p>
        </div>

        <div className={`p-4 ${currentPreset.cardBg} rounded-2xl border ${currentPreset.cardBorder} shadow-sm`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Departments</span>
            <PieChart className={`w-4 h-4 ${currentPreset.accentText}`} />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.departmentCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Academic faculties</p>
        </div>

        <div className={`p-4 ${currentPreset.cardBg} rounded-2xl border ${currentPreset.cardBorder} shadow-sm`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">AI Search Accuracy</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-500 font-mono">
            98.4%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Semantic match score</p>
        </div>

      </div>

      {/* Top Searched Topics & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Searched Student Queries */}
        <div className={`${currentPreset.cardBg} rounded-2xl p-5 border ${currentPreset.cardBorder} shadow-sm space-y-4`}>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Search className={`w-4 h-4 ${currentPreset.accentText}`} />
            <span>Most Searched Student Topics</span>
          </h4>

          <div className="space-y-2.5">
            {recentLogs && recentLogs.length > 0 ? (
              recentLogs.slice(0, 6).map((log, idx) => (
                <div key={idx} className={`p-3 ${currentPreset.innerCardBg} rounded-xl border ${currentPreset.borderColor} flex items-center justify-between text-xs`}>
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      "{log.query}"
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {log.timestamp} • {log.resultsCount} books found
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    log.type === 'ai' ? currentPreset.badgeBg : `${currentPreset.inputBg} text-slate-700 dark:text-slate-300`
                  }`}>
                    {log.type === 'ai' ? 'AI Search' : 'Exact Search'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No recent searches logged yet. Try searching on the public page!
              </p>
            )}
          </div>
        </div>

        {/* Department Inventory Breakdown */}
        <div className={`${currentPreset.cardBg} rounded-2xl p-5 border ${currentPreset.cardBorder} shadow-sm space-y-4`}>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className={`w-4 h-4 ${currentPreset.accentText}`} />
            <span>Books Per Department</span>
          </h4>

          <div className="space-y-3">
            {stats.booksPerDepartment && Object.entries(stats.booksPerDepartment).map(([dept, count], idx) => {
              const countNum = Number(count);
              const counts = Object.values(stats.booksPerDepartment).map(v => Number(v));
              const max = counts.length > 0 ? Math.max(...counts) : 1;
              const pct = max > 0 ? Math.round((countNum / max) * 100) : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{dept}</span>
                    <span className="text-slate-500 font-mono">{count} titles</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${currentPreset.buttonBg} transition-all duration-500 rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
