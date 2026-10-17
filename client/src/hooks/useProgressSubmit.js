import { useEffect } from 'react';

export default function useProgressSubmit(revealed, isCorrect, topic, questionId) {
    useEffect(() => {
        if (!revealed) return;
        const token = localStorage.getItem('tenali-auth-token');
        if (!token || !topic) return;

        const API = import.meta.env.VITE_API_BASE_URL || '';
        fetch(`${API}/api/progress/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            topic,
            isCorrect,
            questionId
        })
        }).catch(err => console.error('Failed to update progress', err));
    }, [revealed, isCorrect, topic, questionId]);
}