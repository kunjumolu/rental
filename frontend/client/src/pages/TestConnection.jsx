import React, { useState } from 'react';
import api from '../services/api';
import { Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export const TestConnection = () => {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setStatus('loading');
    setError(null);
    try {
      // This calls http://localhost:5000/api/health
      const response = await api.get('/health');
      setData(response.data);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Failed to connect to backend');
      setStatus('error');
      console.error('Connection Error:', err);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Backend Health Check</h1>
            <p className="text-sm text-slate-500">Testing connection to: {import.meta.env.VITE_API_URL}/health</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Display */}
          <div className={`p-6 rounded-xl border flex items-center gap-4 ${
            status === 'success' ? 'bg-green-50 border-green-100 text-green-700' :
            status === 'error' ? 'bg-red-50 border-red-100 text-red-700' :
            'bg-slate-50 border-slate-100 text-slate-600'
          }`}>
            {status === 'loading' && <RefreshCw className="animate-spin" size={20} />}
            {status === 'success' && <CheckCircle size={20} />}
            {status === 'error' && <XCircle size={20} />}
            {status === 'idle' && <Activity size={20} />}
            
            <span className="font-bold capitalize">
              {status === 'idle' ? 'Ready to test' : `Status: ${status}`}
            </span>
          </div>

          {/* Response Data */}
          {data && (
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
              <p className="text-slate-500 mb-2">// Response from server:</p>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 font-medium">
              Error: {error}. <br />
              <span className="text-slate-500 font-normal">Make sure your backend is running at http://localhost:5000</span>
            </div>
          )}

          <button 
            onClick={checkHealth}
            disabled={status === 'loading'}
            className="w-full bg-[#0047AB] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {status === 'loading' ? 'Checking...' : 'Run Health Check'}
          </button>
        </div>
      </div>
    </div>
  );
};