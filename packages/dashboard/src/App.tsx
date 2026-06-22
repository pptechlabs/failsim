import { useState, useEffect } from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import RuleBuilder from './components/RuleBuilder';
import RequestLog from './components/RequestLog';
import FailureChart from './components/FailureChart';
import PresetSelector from './components/PresetSelector';
import StatusBar from './components/StatusBar';

// Mock types - in real implementation, these would come from failsim core
interface FailureRule {
  match: string;
  failure: string;
  chance?: number;
  delay?: number;
  enabled?: boolean;
  methods?: string[];
}

interface RequestLog {
  id: string;
  url: string;
  method: string;
  timestamp: number;
  failed: boolean;
  failureType?: string;
  duration: number;
  status?: number;
}

function App() {
  const [rules, setRules] = useState<FailureRule[]>([]);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Simulate polling for logs (in real implementation, this would connect to the engine)
  useEffect(() => {
    const interval = setInterval(() => {
      // Mock: In real implementation, fetch from window.__failsim or WebSocket
      // const engine = (window as any).__failsim;
      // if (engine) {
      //   setLogs(engine.getRequestLogs());
      // }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleAddRule = (rule: FailureRule) => {
    setRules([...rules, { ...rule, enabled: true }]);
    setActivePreset(null);
  };

  const handleRemoveRule = (match: string) => {
    setRules(rules.filter((r) => r.match !== match));
  };

  const handleToggleRule = (match: string) => {
    setRules(
      rules.map((r) =>
        r.match === match ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  const handleApplyPreset = (presetName: string, presetRules: FailureRule[]) => {
    setRules(presetRules);
    setActivePreset(presetName);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const stats = {
    totalRequests: logs.length,
    failedRequests: logs.filter((l) => l.failed).length,
    successfulRequests: logs.filter((l) => !l.failed).length,
    failureRate:
      logs.length > 0
        ? (logs.filter((l) => l.failed).length / logs.length) * 100
        : 0,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">FailSim Dashboard</h1>
                <p className="text-sm text-gray-400">API Failure Simulator</p>
              </div>
            </div>
            <StatusBar
              totalRules={rules.filter((r) => r.enabled !== false).length}
              failureRate={stats.failureRate}
              globalEnabled={globalEnabled}
              onToggleGlobal={setGlobalEnabled}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Rules & Presets */}
          <div className="lg:col-span-1 space-y-6">
            <PresetSelector
              activePreset={activePreset}
              onApplyPreset={handleApplyPreset}
            />
            <RuleBuilder
              rules={rules}
              onAddRule={handleAddRule}
              onRemoveRule={handleRemoveRule}
              onToggleRule={handleToggleRule}
            />
          </div>

          {/* Right Column - Logs & Chart */}
          <div className="lg:col-span-2 space-y-6">
            <FailureChart logs={logs} />
            <RequestLog
              logs={logs}
              onClearLogs={handleClearLogs}
            />
          </div>
        </div>

        {/* Info Banner */}
        {!globalEnabled && (
          <div className="mt-6 bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <p className="text-yellow-200">
                FailSim is currently disabled. Enable it in the status bar to start simulating failures.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

// 
