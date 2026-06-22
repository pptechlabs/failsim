import { Zap } from 'lucide-react';

interface FailureRule {
  match: string;
  failure: string;
  chance?: number;
  delay?: number;
  after?: number;
}

interface PresetSelectorProps {
  activePreset: string | null;
  onApplyPreset: (name: string, rules: FailureRule[]) => void;
}

const presets = [
  {
    name: 'slow-3g',
    label: 'Slow 3G',
    description: '2s delay on all requests',
    rules: [{ match: '/**', failure: 'slow', delay: 2000 }],
  },
  {
    name: 'server-down',
    label: 'Server Down',
    description: '503 on all requests',
    rules: [{ match: '/**', failure: '503' }],
  },
  {
    name: 'flaky',
    label: 'Flaky Network',
    description: '30% random failures',
    rules: [{ match: '/**', failure: '500', chance: 30 }],
  },
  {
    name: 'rate-limited',
    label: 'Rate Limited',
    description: '429 after 5 requests',
    rules: [{ match: '/**', failure: '429', after: 5 }],
  },
  {
    name: 'chaos',
    label: 'Chaos Mode',
    description: 'Random mix of failures',
    rules: [
      { match: '/**', failure: '500', chance: 15 },
      { match: '/**', failure: '503', chance: 10 },
      { match: '/**', failure: 'timeout', chance: 5 },
      { match: '/**', failure: 'slow', delay: 3000, chance: 20 },
    ],
  },
  {
    name: 'offline',
    label: 'Offline',
    description: 'Network errors on all',
    rules: [{ match: '/**', failure: 'network-error' }],
  },
];

export default function PresetSelector({
  activePreset,
  onApplyPreset,
}: PresetSelectorProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        <span>Quick Presets</span>
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onApplyPreset(preset.name, preset.rules as FailureRule[])}
            className={`p-3 rounded-lg text-left transition-all ${
              activePreset === preset.name
                ? 'bg-blue-600 border-2 border-blue-400'
                : 'bg-gray-700 border-2 border-gray-600 hover:border-gray-500'
            }`}
          >
            <p className="font-semibold text-white text-sm">{preset.label}</p>
            <p className="text-xs text-gray-300 mt-1">{preset.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// 
