import { useState, useEffect } from 'react';
import { FailSim } from 'failsim';

// Initialize FailSim with a flaky network preset
FailSim.init({
  rules: [
    { match: '/api/users', failure: '500', chance: 30 },
    { match: '/api/posts', failure: 'slow', delay: 2000, chance: 50 },
  ],
});

interface User {
  id: number;
  name: string;
  email: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, failed: 0, rate: 0 });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
      updateStats();
    }
  };

  const updateStats = () => {
    const engineStats = FailSim.getStats();
    setStats({
      total: engineStats.totalRequests,
      failed: engineStats.failedRequests,
      rate: engineStats.failureRate,
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>FailSim React Example</h1>
      <p>This app uses FailSim to simulate API failures.</p>

      {/* Stats */}
      <div style={{ 
        background: '#f0f0f0', 
        padding: '1rem', 
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <h3>Request Statistics</h3>
        <p>Total Requests: {stats.total}</p>
        <p>Failed Requests: {stats.failed}</p>
        <p>Failure Rate: {stats.rate.toFixed(1)}%</p>
      </div>

      {/* Controls */}
      <button 
        onClick={fetchUsers}
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '1rem'
        }}
      >
        {loading ? 'Loading...' : 'Fetch Users'}
      </button>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fee',
          border: '1px solid #fcc',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          color: '#c00'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Users List */}
      {users.length > 0 && (
        <div>
          <h2>Users ({users.length})</h2>
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                <strong>{user.name}</strong> - {user.email}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#e8f4f8',
        borderRadius: '8px'
      }}>
        <h3>How it works:</h3>
        <ul>
          <li>30% chance of 500 error on /api/users</li>
          <li>50% chance of 2s delay on /api/posts</li>
          <li>Click "Fetch Users" multiple times to see failures</li>
          <li>Check the stats to see failure rate</li>
        </ul>
      </div>
    </div>
  );
}

export default App;

// 
