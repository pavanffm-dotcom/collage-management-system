import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Award, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Equipment {
  id: string;
  name: string;
  total: number;
  available: number;
}

interface TeamPlayer {
  id: string;
  name: string;
  sport: string;
  role: string;
}

const INITIAL_EQUIPMENT: Equipment[] = [
  { id: '1', name: 'Leather Cricket Balls', total: 30, available: 18 },
  { id: '2', name: 'Nivia Footballs (Size 5)', total: 15, available: 9 },
  { id: '3', name: 'English Willow Bats', total: 8, available: 4 },
  { id: '4', name: 'Yonex Badminton Rackets', total: 20, available: 14 },
  { id: '5', name: 'Stag Table Tennis Balls', total: 50, available: 42 }
];

export const SportsView: React.FC = () => {
  const { currentPreset } = useTheme();
  const [activeTab, setActiveTab] = useState<'roster' | 'equipment' | 'events'>('roster');
  
  // Equipment checkout states
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [logMessage, setLogMessage] = useState<string>('');

  // Team builder states
  const [players, setPlayers] = useState<TeamPlayer[]>([
    { id: '1', name: 'Rahul Sharma', sport: 'Cricket', role: 'Captain / All-rounder' },
    { id: '2', name: 'Vikram Singh', sport: 'Football', role: 'Goalkeeper' },
    { id: '3', name: 'Sneha Rao', sport: 'Badminton', role: 'Singles Seed 1' }
  ]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerSport, setNewPlayerSport] = useState('Cricket');
  const [newPlayerRole, setNewPlayerRole] = useState('Batsman');

  // Action: Checkout equipment
  const handleCheckout = (id: string) => {
    setEquipmentList(prev => prev.map(eq => {
      if (eq.id === id && eq.available > 0) {
        setLogMessage(`Checked out 1 unit of: ${eq.name}`);
        return { ...eq, available: eq.available - 1 };
      }
      return eq;
    }));
  };

  // Action: Return equipment
  const handleReturn = (id: string) => {
    setEquipmentList(prev => prev.map(eq => {
      if (eq.id === id && eq.available < eq.total) {
        setLogMessage(`Returned 1 unit of: ${eq.name}`);
        return { ...eq, available: eq.available + 1 };
      }
      return eq;
    }));
  };

  // Action: Add team player
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    
    const newPlayer: TeamPlayer = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      sport: newPlayerSport,
      role: newPlayerRole
    };

    setPlayers(prev => [...prev, newPlayer]);
    setNewPlayerName('');
    setNewPlayerRole('Player');
  };

  // Action: Remove team player
  const handleRemovePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Physical Education & Sports</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Team Roster Builders, Sports Equipment Ledgers, Ground Bookings</p>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/40 dark:border-zinc-700/40">
          {[
            { id: 'roster', label: 'Team Rosters', icon: Users },
            { id: 'equipment', label: 'Equipment Inventory', icon: ShoppingBag },
            { id: 'events', label: 'Events & Matches', icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Roster Builder Content */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Left Form: Add Player */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Assemble Campus Teams</h3>
              <p className="text-xs text-slate-500">Add players to represent the college in various sports categories.</p>
            </div>

            <form onSubmit={handleAddPlayer} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Player Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Sport</label>
                  <select
                    value={newPlayerSport}
                    onChange={(e) => setNewPlayerSport(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Cricket">Cricket</option>
                    <option value="Football">Football</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Athletics">Athletics</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Player Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Defender, Bowler"
                    value={newPlayerRole}
                    onChange={(e) => setNewPlayerRole(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Enlist Player to Roster</span>
              </button>
            </form>
          </div>

          {/* Right List: Players Grid */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Active Roster List ({players.length} Enlisted)</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-600">Inter-College Team</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 max-h-[300px] overflow-y-auto">
                {players.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-800/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs">
                        {p.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{p.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-semibold">
                          <span className="text-orange-500">{p.sport}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>Role: {p.role}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemovePlayer(p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {players.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No players currently enlisted in the athletic roster.
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold">Inter-Dept Tournament Entry Pass:</span>
              <span className="font-extrabold text-orange-600">Generated for All Players</span>
            </div>
          </div>

        </div>
      )}

      {/* Equipment Ledger Content */}
      {activeTab === 'equipment' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* Equipment Inventory Grid */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Sports Equipment Vault Ledger</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Manage sports kits, leather balls and bats checkout logs.</p>
              </div>
              <span className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-500 px-2.5 py-1 rounded-lg font-bold">
                Live Store
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {equipmentList.map((eq) => (
                <div key={eq.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{eq.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      Total Inventory: <span className="text-slate-600 dark:text-slate-300 font-black">{eq.total} Units</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span className="text-slate-400">Available:</span>
                      <span className={`px-2 py-0.5 rounded-md font-mono text-sm ${
                        eq.available > 3
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {eq.available} / {eq.total}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCheckout(eq.id)}
                        disabled={eq.available <= 0}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-[11px] font-extrabold shadow-sm transition-all"
                      >
                        Checkout
                      </button>
                      <button
                        onClick={() => handleReturn(eq.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-extrabold shadow-sm transition-all"
                      >
                        Return
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout transaction logging box */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest block">Store Transaction Logs</span>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Real-time Checkout Logger</h3>
              
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 min-h-[140px] flex items-center justify-center text-center">
                {logMessage ? (
                  <div className="space-y-1 text-left">
                    <span className="text-emerald-500 block">&gt;&gt;&gt; STATUS: SUCCESS</span>
                    <p className="text-slate-300">{logMessage}</p>
                    <span className="text-slate-500 text-[10px] block mt-4">Timestamp: {new Date().toLocaleTimeString()}</span>
                  </div>
                ) : (
                  <span className="text-slate-500">Click Checkout or Return on inventory items to write store logs...</span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-slate-400 leading-relaxed">
              * Note: Heavy inventory items (cricket bats, TT boards) require coach sign-off at main sports room.
            </div>
          </div>

        </div>
      )}

      {activeTab === 'events' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 p-6 text-left space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Inter-College Sports Tournament Fixtures</h3>
            <p className="text-xs text-slate-500">Upcoming match timings and stadium field locations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: '1', title: 'College Cricket Premier League', versus: 'GEC vs. IIT Bombay', date: 'Aug 5th, 09:30 AM', ground: 'Central Cricket Ground' },
              { id: '2', title: 'Inter-College Football Quarterfinals', versus: 'SXC Mapusa vs. GEC Goa', date: 'Aug 8th, 03:00 PM', ground: 'Main Turf Field A' },
              { id: '3', title: 'Inter-Branch Badminton Doubles', versus: 'Computer Science vs. Mathematics', date: 'Aug 10th, 11:00 AM', ground: 'Indoor Sports Complex Box 2' }
            ].map((fixture) => (
              <div key={fixture.id} className="p-4 bg-slate-50/60 dark:bg-zinc-800/40 rounded-2xl border border-slate-200/60 dark:border-zinc-700/50 hover:border-orange-500 transition-all">
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-extrabold text-orange-500 uppercase">{fixture.title}</span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">{fixture.versus}</h4>
                </div>

                <div className="border-t border-slate-100 dark:border-zinc-700/60 pt-3 space-y-1 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{fixture.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stadium Court:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{fixture.ground}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
