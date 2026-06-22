import { useState } from 'react';
import { Plus, Trash2, Power } from 'lucide-react';

interface FailureRule {
  match: string;
  failure: string;
  chance?: number;
  delay?: number;
  enabled?: boolean;
  methods?: string[];
}

interface RuleBuilderProps {
  rules: FailureRule[];
  onAddRule: (rule: FailureRule) => void;
  onRemoveRule: (match: string) => void;
  onToggleRule: (match: string) => void;
}

const failureTypes = [
  { value: '500', label: '500 - Internal Server Error' },
  { value: '503', label: '503 - Service Unavailable' },
  { value: '404', label: '404 - Not Found' },
  { value: '429', label: '429 - Rate Limited' },
  { value: 'timeout', label: 'Timeout' },
  { value: 'slow', label: 'Slow Response' },
  { value: 'empty', label: 'Empty Response' },
  { value: 'malformed', label: 'Malformed JSON' },
  { value: 'network-error', label: 'Network Error' },
];

export default function RuleBuilder({
  rules,
  onAddRule,
  onRemoveRule,
  onToggleRule,
}: RuleBuilderProps) {
  const [match, setMatch] = useState('/api/**');
  const [failure, setFailure] = useState('500');
  const [chance, setChance] = useState(100);
  const [delay, setDelay] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRule({
      match,
      failure,
      chance,
      delay: delay > 0 ? delay : undefined,
    });
    // Reset form
    setMatch('/api/**');
    setFailure('500');
    setChance(100);
    setDelay(0);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Failure Rules</h2>

      {/* Add Rule Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            URL Pattern
          </label>
          <input
            type="text"
            value={match}
            onChange={(e) => setMatch(e.target.value)}
            placeholder="/api/**"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Failure Type
          </label>
          <select
            value={failure}
            onChange={(e) => setFailure(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {failureTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Chance (%)
            </label>
            <input
              type="number"
              value={chance}
              onChange={(e) => setChance(Number(e.target.value))}
              min="0"
              max="100"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Delay (ms)
            </label>
            <input
              type="number"
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              min="0"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rule</span>
        </button>
      </form>

      {/* Rules List */}
      <div className="space-y-2">
        {rules.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            No rules configured. Add a rule to start simulating failures.
          </p>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.match}
              className={`flex items-center justify-between p-3 rounded-md ${
                rule.enabled !== false
                  ? 'bg-gray-700 border border-gray-600'
                  : 'bg-gray-800 border border-gray-700 opacity-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{rule.match}</p>
                <p className="text-sm text-gray-400">
                  {rule.failure} • {rule.chance || 100}% chance
                  {rule.delay ? ` • ${rule.delay}ms delay` : ''}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onToggleRule(rule.match)}
                  className={`p-1 rounded ${
                    rule.enabled !== false
                      ? 'text-green-400 hover:bg-gray-600'
                      : 'text-gray-500 hover:bg-gray-700'
                  }`}
                  title={rule.enabled !== false ? 'Disable' : 'Enable'}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRemoveRule(rule.match)}
                  className="p-1 text-red-400 hover:bg-gray-600 rounded"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 
