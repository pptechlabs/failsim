import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

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

interface FailureChartProps {
  logs: RequestLog[];
}

export default function FailureChart({ logs }: FailureChartProps) {
  // Group logs by minute for the chart
  const chartData = () => {
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    
    // Create 10 minute buckets
    const buckets: Record<string, { total: number; failed: number; time: string }> = {};
    
    for (let i = 0; i < 10; i++) {
      const time = new Date(tenMinutesAgo + i * 60 * 1000);
      const label = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      buckets[label] = { total: 0, failed: 0, time: label };
    }
    
    // Fill buckets with log data
    logs.forEach((log) => {
      if (log.timestamp >= tenMinutesAgo) {
        const time = new Date(log.timestamp);
        const label = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (buckets[label]) {
          buckets[label].total++;
          if (log.failed) {
            buckets[label].failed++;
          }
        }
      }
    });
    
    return Object.values(buckets);
  };

  const data = chartData();

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        <span>Request Activity (Last 10 Minutes)</span>
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#F3F4F6',
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#F3F4F6' }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Total Requests"
            dot={{ fill: '#3B82F6' }}
          />
          <Line
            type="monotone"
            dataKey="failed"
            stroke="#EF4444"
            strokeWidth={2}
            name="Failed Requests"
            dot={{ fill: '#EF4444' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 
