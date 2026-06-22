import { Power, Activity, TrendingUp } from 'lucide-react';

interface StatusBarProps {
  totalRules: number;
  failureRate: number;
  globalEnabled: boolean;
  onToggleGlobal: (enabled: boolean) => void;
}

export default function StatusBar({
  totalRules,
  failureRate,
  globalEnabled,
  onToggleGlobal,
}: StatusBarProps) {
  return (
    <div className="flex items-center space-x-6">
      {/* Stats */}
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">
            <span className="font-semibold text-white">{totalRules}</span> active rules
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-red-400" />
          <span className="text-gray-300">
            <span className="font-semibold text-white">{failureRate.toFixed(1)}%</span> failure rate
          </span>
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => onToggleGlobal(!globalEnabled)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          globalEnabled
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
      >
        <Power className="w-4 h-4" />
        <span>{globalEnabled ? 'Enabled' : 'Disabled'}</span>
      </button>
    </div>
  );
}

// 
