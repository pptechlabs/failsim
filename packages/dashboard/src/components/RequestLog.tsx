import { useState } from 'react';
import { Clock, CheckCircle, XCircle, Trash2, Filter } from 'lucide-react';

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

interface RequestLogProps {
  logs: RequestLog[];
  onClearLogs: () => void;
}

export default function RequestLog({ logs, onClearLogs }: RequestLogProps) {
  const [showFailedOnly, setShowFailedOnly] = useState(false);

  const filteredLogs = showFailedOnly
    ? logs.filter((log) => log.failed)
    : logs;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <span>Request Log</span>
          <span className="text-sm font-normal text-gray-400">
            ({filteredLogs.length})
          </span>
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFailedOnly(!showFailedOnly)}
            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
              showFailedOnly
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Failed Only</span>
          </button>
          <button
            onClick={onClearLogs}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No requests logged yet. Make some API calls to see them here.
          </p>
        ) : (
          filteredLogs.slice().reverse().map((log) => (
            <div
              key={log.id}
              className={`flex items-center justify-between p-3 rounded-md ${
                log.failed
                  ? 'bg-red-900/20 border border-red-800'
                  : 'bg-green-900/20 border border-green-800'
              }`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {log.failed ? (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                      {log.method}
                    </span>
                    <span className="text-sm text-white truncate">
                      {log.url}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                    <span>{formatTime(log.timestamp)}</span>
                    <span>•</span>
                    <span>{log.duration}ms</span>
                    {log.status && (
                      <>
                        <span>•</span>
                        <span
                          className={
                            log.status >= 400 ? 'text-red-400' : 'text-green-400'
                          }
                        >
                          {log.status}
                        </span>
                      </>
                    )}
                    {log.failureType && (
                      <>
                        <span>•</span>
                        <span className="text-red-400">{log.failureType}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 
