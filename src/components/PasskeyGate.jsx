import { useState } from 'react';
import { verifyPasskey } from '../api';

export default function PasskeyGate({ onSuccess }) {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passkey.trim()) {
      setError('Please enter a passkey');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyPasskey(passkey.trim());
      onSuccess();
    } catch (err) {
      setError('Invalid passkey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🍳</div>
          <h1 className="text-2xl font-bold text-amber-900">KH Recipes</h1>
          <p className="text-amber-700 mt-2">Enter your passkey to access recipes</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            placeholder="Enter passkey"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-amber-500 transition-colors"
            autoFocus
          />

          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
