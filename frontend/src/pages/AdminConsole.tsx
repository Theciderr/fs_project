import { useState } from 'react';
import ElectionForm from '../components/Admin/ElectionForm';
import EligibilityUpload from '../components/Admin/EligibilityUpload';
import Dashboard from '../components/Admin/Dashboard';
import { Election } from '../services/api';

export default function AdminConsole() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'upload'>('dashboard');
    const [elections, setElections] = useState<Election[]>([]);

    const handleElectionCreated = (election: Election) => {
        setElections([...elections, election]);
        setActiveTab('dashboard');
    };

    return (
        <div className="admin-console">
            <h1>Admin Console</h1>
            
            <div className="tabs">
                <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={activeTab === 'dashboard' ? 'active' : ''}
                >
                    Dashboard
                </button>
                <button 
                    onClick={() => setActiveTab('create')}
                    className={activeTab === 'create' ? 'active' : ''}
                >
                    Create Election
                </button>
                <button 
                    onClick={() => setActiveTab('upload')}
                    className={activeTab === 'upload' ? 'active' : ''}
                >
                    Upload Eligibility
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'create' && <ElectionForm onSuccess={handleElectionCreated} />}
                {activeTab === 'upload' && <EligibilityUpload onSuccess={() => setActiveTab('dashboard')} />}
            </div>
        </div>
    );
}

