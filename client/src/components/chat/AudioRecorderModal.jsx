import React, { useRef, useState, useEffect } from 'react';
import { Mic, Square, X, RefreshCw, Send, Play, Pause } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function AudioRecorderModal({ onCapture, onCancel }) {
  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    const startStream = async () => {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setStream(newStream);
        setError(null);
      } catch (err) {
        console.error('Error accessing microphone.', err);
        setError('Could not access microphone. Please allow permissions.');
      }
    };
    startStream();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const startRecording = () => {
    if (!stream) return;
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    chunksRef.current = [];
    
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Error starting recording', err);
      setError('Could not start recording audio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleSend = () => {
    if (!audioBlob) return;
    const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'weba';
    const file = new File([audioBlob], `audio_${Date.now()}.${ext}`, { type: audioBlob.type });
    onCapture(file);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title="Voice Message">
      <div className="flex flex-col space-y-6 items-center py-4">
        {error ? (
          <div className="p-4 text-center text-error bg-error/10 rounded-xl border border-error/20 w-full">
            {error}
          </div>
        ) : (
          <>
            {audioUrl ? (
              <div className="w-full flex flex-col items-center gap-4">
                <audio 
                  ref={audioRef} 
                  src={audioUrl} 
                  onEnded={() => setIsPlaying(false)}
                  className="hidden" 
                />
                
                <div className="flex items-center justify-between w-full p-4 bg-surface-dark rounded-xl border border-border-primary">
                  <button 
                    onClick={togglePlayback}
                    className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                  </button>
                  <div className="flex-1 px-4 h-12 flex items-center justify-center">
                     {/* Placeholder for audio visualization */}
                     <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                       <div className="absolute inset-y-0 left-0 bg-primary w-1/2" style={{ animation: isPlaying ? 'pulse 1s infinite' : 'none' }}></div>
                     </div>
                  </div>
                  <span className="text-sm font-mono text-text-muted">{formatTime(recordingTime)}</span>
                </div>
                
                <div className="flex items-center gap-4 w-full">
                  <button 
                    onClick={() => { setAudioBlob(null); setAudioUrl(null); }}
                    className="flex-1 py-3 text-text-muted hover:text-white transition-colors bg-surface-dark rounded-xl border border-border-primary"
                  >
                    Discard
                  </button>
                  <Button onClick={handleSend} className="flex-1 py-3 flex items-center justify-center gap-2">
                    <Send size={18} />
                    Attach Audio
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 w-full">
                {!stream && <RefreshCw className="animate-spin text-text-muted" size={24} />}
                
                <div className="relative flex items-center justify-center">
                   {recording && (
                     <>
                       <div className="absolute w-32 h-32 bg-error/20 rounded-full animate-ping" />
                       <div className="absolute w-24 h-24 bg-error/40 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                     </>
                   )}
                   
                   <button
                     onClick={recording ? stopRecording : startRecording}
                     disabled={!stream}
                     className={`w-20 h-20 rounded-full flex items-center justify-center z-10 transition-all ${
                       recording ? 'bg-surface border-4 border-error hover:scale-105' : 'bg-primary hover:bg-primary/80 hover:scale-105'
                     } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl`}
                   >
                     {recording ? (
                       <Square size={28} className="text-error" fill="currentColor" />
                     ) : (
                       <Mic size={32} className="text-white" />
                     )}
                   </button>
                </div>
                
                <div className="text-2xl font-mono font-bold text-white tracking-widest">
                  {formatTime(recordingTime)}
                </div>
                
                <div className="text-sm text-text-muted mt-2">
                  {recording ? 'Tap to stop recording' : 'Tap to start recording'}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
