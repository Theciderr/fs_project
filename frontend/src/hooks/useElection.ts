import { useState, useEffect } from 'react';
import { electionsApi, Election } from '../services/api';

export function useElection(id: string) {
    const [election, setElection] = useState<Election | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchElection() {
            try {
                setLoading(true);
                const data = await electionsApi.get(id);
                setElection(data);
                setError(null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchElection();
        }
    }, [id]);

    return { election, loading, error };
}

export function useElections() {
    const [elections, setElections] = useState<Election[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchElections() {
            try {
                setLoading(true);
                const data = await electionsApi.getAll();
                setElections(data);
                setError(null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchElections();
    }, []);

    return { elections, loading, error, refetch: () => {
        setLoading(true);
        electionsApi.getAll().then(data => {
            setElections(data);
            setLoading(false);
        }).catch(err => {
            setError(err.message);
            setLoading(false);
        });
    }};
}

