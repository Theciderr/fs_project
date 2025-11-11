import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminConsole from './pages/AdminConsole';
import VoterPortal from './pages/VoterPortal';
import VerifyVote from './pages/VerifyVote';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<'voter' | 'admin'>('voter');

    const handleLogin = (role: 'voter' | 'admin') => {
        setIsAuthenticated(true);
        setUserRole(role);
        // In a real app, you would set a JWT token here
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('role', role);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    };

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>Blockchain Voting System</h1>
                    <nav>
                        <Link to="/">Voter Portal</Link>
                        <Link to="/admin">Admin Console</Link>
                        <Link to="/verify">Verify Vote</Link>
                        {isAuthenticated ? (
                            <button onClick={handleLogout}>Logout</button>
                        ) : (
                            <>
                                <button onClick={() => handleLogin('voter')}>Login as Voter</button>
                                <button onClick={() => handleLogin('admin')}>Login as Admin</button>
                            </>
                        )}
                    </nav>
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={<VoterPortal />} />
                        <Route path="/admin" element={<AdminConsole />} />
                        <Route path="/verify" element={<VerifyVote />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;

