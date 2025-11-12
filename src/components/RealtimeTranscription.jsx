import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function RealtimeTranscription() {
  const [socket, setSocket] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    setSocket(newSocket);

    // Listen for connection
    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setError('');
    });

    // Listen for connection errors
    newSocket.on('connect_error', (err) => {
      console.error('❌ Connection error:', err);
      setError('Failed to connect to server');
      setStatus('error');
    });

    // Listen for transcripts
    newSocket.on('transcript', (data) => {
      console.log('📝 Transcript received:', data);
      
      if (data.is_final) {
        setFinalTranscript(prev => prev + data.text + ' ');
        setInterimTranscript('');
      } else {
        setInterimTranscript(data.text);
      }
    });

    // Listen for status updates
    newSocket.on('transcription-status', (data) => {
      console.log('📊 Status:', data.status);
      setStatus(data.status);
    });

    // Listen for errors
    newSocket.on('transcription-error', (data) => {
      console.error('❌ Transcription error:', data.error);
      setError(`Error: ${data.error}`);
      setStatus('error');
      stopRecording();
    });

    // Listen for save confirmation
    newSocket.on('transcription-saved', (data) => {
      console.log('💾 Transcription saved:', data.id);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      console.log('🎤 Requesting microphone access...');

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;
      console.log('✅ Microphone access granted');

      // Create AudioContext for processing
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });

      const source = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      // Start transcription on backend
      socket.emit('start-transcription');
      console.log('📡 Starting transcription...');

      // Process audio chunks
      processorRef.current.onaudioprocess = (e) => {
        if (!isRecording) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = convertFloat32ToInt16(inputData);
        
        if (socket && socket.connected) {
          socket.emit('audio-data', pcmData.buffer);
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      setIsRecording(true);
      setStatus('recording');
      setFinalTranscript('');
      setInterimTranscript('');
      console.log('🎙️ Recording started');

    } catch (error) {
      console.error('❌ Microphone error:', error);
      setError('Microphone access denied. Please allow microphone access and try again.');
      setStatus('error');
    }
  };

  const stopRecording = () => {
    console.log('⏹️ Stopping recording...');

    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Stop transcription on backend
    if (socket && socket.connected) {
      socket.emit('stop-transcription');
    }

    setIsRecording(false);
    setStatus('idle');
    console.log('✅ Recording stopped');
  };

  const clearTranscript = () => {
    setFinalTranscript('');
    setInterimTranscript('');
    setError('');
  };

  // Helper function to convert Float32 to Int16
  const convertFloat32ToInt16 = (buffer) => {
    const l = buffer.length;
    const buf = new Int16Array(l);
    
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      buf[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    return buf;
  };

  return (
    <div className="realtime-container">
      {/* Header */}
      <div className="realtime-header">
        <h2 className="realtime-title">🎤 Live Transcription</h2>
        <div className={`status-indicator status-indicator--${status}`}>
          {status === 'recording' && '● Recording'}
          {status === 'connected' && '● Connected'}
          {status === 'idle' && '○ Ready'}
          {status === 'error' && '⚠ Error'}
          {status === 'saved' && '✓ Saved'}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Controls */}
      <div className="realtime-controls">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`btn ${isRecording ? 'btn-recording' : 'btn-primary'}`}
          disabled={status === 'error' && !socket?.connected}
        >
          {isRecording ? '⏹ Stop Recording' : '🎤 Start Live Transcription'}
        </button>
        
        {finalTranscript && !isRecording && (
          <button onClick={clearTranscript} className="btn btn-secondary">
            🗑️ Clear
          </button>
        )}
      </div>

      {/* Transcript Display */}
      <div className="transcript-display">
        <div className="transcript-final">
          {finalTranscript || (
            <span className="transcript-placeholder">
              {isRecording 
                ? '🎤 Listening... Start speaking!' 
                : '✨ Click "Start Live Transcription" and watch your words appear in real-time...'}
            </span>
          )}
        </div>
        
        {interimTranscript && (
          <div className="transcript-interim">
            {interimTranscript}...
          </div>
        )}
      </div>

      {/* Info */}
      <div className="realtime-info">
        <p>💡 Powered by AssemblyAI Real-Time API</p>
        <p className="usage-info">📊 Free Tier: 5 hours total • Real-time transcription</p>
      </div>
    </div>
  );
}
