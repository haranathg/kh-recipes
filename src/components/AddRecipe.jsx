import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseRecipe } from '../api';
import RecipePreview from './RecipePreview';

const CATEGORIES = [
  'Breakfast',
  'Mains',
  'Sides',
  'Desserts',
  'Snacks',
  'Drinks',
  'Sauces & Dips',
  'Other'
];

export default function AddRecipe({ onSave }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('voice'); // 'voice' | 'text'
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const [interimText, setInterimText] = useState('');

  // Keep ref in sync with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Initialize speech recognition once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English - better recognition of Indian ingredients

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        // Show interim results while speaking
        setInterimText(interimTranscript);

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript + ' ');
          setInterimText('');
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please enable it in your browser settings or use the Type tab.');
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Please try again and speak clearly.');
        } else if (event.error === 'network') {
          setError('Network error. Speech recognition requires an internet connection.');
        }
      };

      recognition.onend = () => {
        // Use ref to get current value
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setIsRecording(false);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    } else {
      if (!recognitionRef.current) {
        setError('Speech recognition not supported in this browser. Please use the Type tab.');
        return;
      }
      setIsRecording(true);
      setError('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        setError('Could not start recording. Please try again.');
        setIsRecording(false);
      }
    }
  };

  const handleFormat = async () => {
    if (!transcript.trim()) {
      setError('Please enter or dictate a recipe first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const recipe = await parseRecipe(transcript.trim());
      setParsedRecipe(recipe);
    } catch (err) {
      setError(err.message || 'Failed to format recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (recipe) => {
    try {
      await onSave(recipe);
      navigate('/');
    } catch (err) {
      setError('Failed to save recipe');
    }
  };

  const handleBack = () => {
    if (parsedRecipe) {
      setParsedRecipe(null);
    } else {
      navigate('/');
    }
  };

  // Show preview if we have a parsed recipe
  if (parsedRecipe) {
    return (
      <RecipePreview
        recipe={parsedRecipe}
        onSave={handleSave}
        onBack={() => setParsedRecipe(null)}
        categories={CATEGORIES}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 text-amber-700 hover:text-amber-900"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-amber-900">Add Recipe</h1>
      </header>

      {/* Mode Tabs */}
      <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm">
        <button
          onClick={() => setMode('voice')}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            mode === 'voice'
              ? 'bg-amber-500 text-white'
              : 'text-amber-800 hover:bg-amber-50'
          }`}
        >
          🎤 Voice
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            mode === 'text'
              ? 'bg-amber-500 text-white'
              : 'text-amber-800 hover:bg-amber-50'
          }`}
        >
          ✏️ Type
        </button>
      </div>

      {/* Voice Mode */}
      {mode === 'voice' && (
        <div className="text-center">
          <div className="relative inline-block">
            {isRecording && (
              <div className="absolute inset-0 bg-red-400 rounded-full animate-pulse-ring"></div>
            )}
            <button
              onClick={toggleRecording}
              className={`relative w-28 h-28 rounded-full text-4xl shadow-lg transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
              }`}
            >
              {isRecording ? '⏹' : '🎤'}
            </button>
          </div>
          <p className="mt-4 text-amber-800 font-medium">
            {isRecording ? 'Tap to stop' : 'Tap to start dictating'}
          </p>
        </div>
      )}

      {/* Transcript / Text Input */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-amber-800 mb-2">
          {mode === 'voice' ? 'Transcript' : 'Recipe'}
        </label>
        <div className="relative">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={
              mode === 'voice'
                ? 'Your dictation will appear here. You can edit it before formatting.'
                : "Type or paste your recipe here. Include ingredients, amounts, and cooking steps. For example: This is my chocolate chip cookies recipe. You need 2 cups flour, 1 cup butter..."
            }
            className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-amber-400 transition-colors"
          />
          {/* Show interim text while speaking */}
          {isRecording && interimText && (
            <div className="absolute bottom-2 left-2 right-2 p-2 bg-amber-100 rounded-lg text-amber-700 text-sm italic">
              {interimText}...
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleFormat}
          disabled={loading || !transcript.trim()}
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Formatting...
            </span>
          ) : (
            '✨ Format Recipe'
          )}
        </button>
        <button
          onClick={() => setTranscript('')}
          disabled={!transcript.trim()}
          className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-amber-50 rounded-xl">
        <p className="text-sm text-amber-800">
          <strong>💡 Tips:</strong> Describe your recipe naturally. Include the name, ingredients with amounts, and cooking steps. You can edit the text before formatting if the voice recognition makes mistakes.
        </p>
      </div>
    </div>
  );
}
