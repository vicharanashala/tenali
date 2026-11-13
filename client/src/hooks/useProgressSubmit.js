import { useEffect } from "react";
import CONFIG from "../config";
import { pmTrackAnswer } from "../utils/pathMapUtils";

export default function useProgressSubmit(revealed, isCorrect, topic, questionId) {
    useEffect(() => {
        if (!revealed) return;
        try { 
            pmTrackAnswer(topic, 'medium', isCorrect); 
        } catch (e) { 
            console.error(`useProgressSubmit :: Failed to track answer in pmTrackAnswer due to ::  ${e.stack}`)
        }
        const token = localStorage.getItem('tenali-auth-token');
        if (!token || !topic) return;

        fetch(`${CONFIG.api}/api/progress/update`, {
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