import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true);
                const data = await adminApi.getDashboard();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!stats) return <div>No data</div>;

    return (
        <div className="dashboard">
            <h2>Admin Dashboard</h2>
            
            <div className="stats">
                <div className="stat-card">
                    <h3>Total Elections</h3>
                    <p>{stats.totalElections}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Eligible Voters</h3>
                    <p>{stats.totalEligible}</p>
                </div>
            </div>

            <div className="recent-elections">
                <h3>Recent Elections</h3>
                <ul>
                    {stats.recentElections.map((election: any) => (
                        <li key={election._id}>
                            <strong>{election.name}</strong> - {election.status}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

