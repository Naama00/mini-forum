// frontend/src/hooks/useGemini.js
import { useState, useCallback, useRef } from 'react';
import { getToken } from '../utils/storage';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitError, setRateLimitError] = useState(null);
  const [result, setResult] = useState('');
  
  const abortControllerRef = useRef(null);

  // פונקציה לניקוי הסטייט (מתאים ל-Clear ב-Workspace)
  const clearState = useCallback(() => {
    abortControllerRef.current?.abort();
    setLoading(false);
    setError('');
    setRateLimitError(null);
    setResult('');
  }, []);

  // 1. פונקציה לביצוע סיכום פוסטים (מתאים ל-PostSummary)
  const summarize = useCallback(async ({ title, content, comments }) => {
    setLoading(true);
    setRateLimitError(null);
    setError('');

    try {
      const token = getToken();
      const res = await fetch(`${API}/gemini/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, comments }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setRateLimitError(data.error || 'rate_limit_minute');
        return null;
      }

      if (!res.ok) {
        setError(data.error || 'שגיאה בסיכום הפוסט.');
        return null;
      }

      setResult(data.text);
      return data.text;
    } catch (err) {
      setError('שגיאת חיבור לשרת. נסה שנית.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. פונקציה לניהול הסטרימינג המורכב (מתאים ל-AIWorkspace)
  const stream = useCallback(async ({ action, prompt, codeContext, fileToSend }) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError('');
    setRateLimitError(null);
    setResult('');

    let uploadedImageUrl = null;

    try {
      let endpoint = `${API}/gemini/stream`;
      let fetchOptions = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ 
          action, 
          prompt, 
          extraContext: action === 'optimize' || action === 'explain' ? codeContext : undefined 
        }),
        signal: abortControllerRef.current.signal,
      };

      // טיפול בהעלאת תמונה אם קיימת
      if (fileToSend) {
        const uploadForm = new FormData();
        uploadForm.append('image', fileToSend);
        
        const uploadRes = await fetch(`${API}/gemini/upload-image`, { 
          method: 'POST', 
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, 
          body: uploadForm 
        });
        
        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.imageUrl;
        
        endpoint = `${API}/gemini/stream-with-image`;
        const formData = new FormData();
        formData.append('action', action); 
        formData.append('prompt', prompt);
        if (action === 'optimize' || action === 'explain') formData.append('extraContext', codeContext);
        formData.append('image', fileToSend);
        
        fetchOptions = { 
          method: 'POST', 
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, 
          body: formData, 
          signal: abortControllerRef.current.signal 
        };
      }

      const response = await fetch(endpoint, fetchOptions);
      
      if (response.status === 429) { 
        const data = await response.json().catch(() => ({})); 
        setRateLimitError(data.error || 'rate_limit_minute'); 
        return { success: false, rateLimit: true }; 
      }
      
      if (!response.ok) { 
        const data = await response.json().catch(() => ({})); 
        throw new Error(data.message || 'שגיאה בייצור התוכן מה-AI'); 
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n'); 
        buffer = parts.pop();
        
        for (const part of parts) {
          const lines = part.split('\n'); 
          let eventType = 'message', dataLine = '';
          for (const line of lines) { 
            if (line.startsWith('event: ')) eventType = line.slice(7).trim(); 
            if (line.startsWith('data: ')) dataLine = line.slice(6).trim(); 
          }
          if (!dataLine) continue;
          let parsed; 
          try { parsed = JSON.parse(dataLine); } catch { continue; }
          if (eventType === 'chunk' && parsed.text) {
            setResult((prev) => prev + parsed.text);
          }
          if (eventType === 'error') throw new Error(parsed.message || 'שגיאה בזרם ה-AI');
        }
      }

      let finalResult = '';
      if (uploadedImageUrl) {
        setResult((prev) => {
          finalResult = `![תמונה](${uploadedImageUrl})\n\n` + prev;
          return finalResult;
        });
      }
      
      return { success: true, uploadedImageUrl, finalResult };
    } catch (err) {
      if (err.name === 'AbortError') return { success: false, aborted: true };
      setError(err.message || 'חיבור לשרת ה-AI נכשל. ודא שהשרת רץ.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    rateLimitError,
    result,
    setResult,
    setError,
    setRateLimitError,
    stream,
    summarize,
    clearState,
    abortControllerRef
  };
}