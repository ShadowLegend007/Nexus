import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Video, Square, X, RefreshCw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function MediaCaptureModal({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [mode, setMode] = useState('photo'); // 'photo' or 'video'
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const chunksRef = useRef([]);

  const startStream = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: mode === 'video'
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error('Error accessing media devices.', err);
      setError('Could not access camera/microphone. Please allow permissions.');
    }
  }, [facingMode, mode, stream]);

  useEffect(() => {
    startStream();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode, mode]);

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // If using user-facing camera, flip the image horizontally
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        // Convert blob to File
        const file = new File([blob], `photo_${Date.now()}.png`, { type: 'image/png' });
        onCapture(file);
      }
    }, 'image/png');
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    
    try {
      // Try to use webm if supported, fallback to mp4 if needed (safari)
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : MediaRecorder.isTypeSupported('video/mp4')
            ? 'video/mp4'
            : '';

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
        const ext = mimeType && mimeType.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `video_${Date.now()}.${ext}`, { type: blob.type });
        onCapture(file);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(200); // collect 200ms chunks
      setRecording(true);
    } catch (err) {
      console.error('Error starting recording', err);
      setError('Could not start recording video.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleAction = () => {
    if (mode === 'photo') {
      capturePhoto();
    } else {
      if (recording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title="Capture Media">
      <div className="flex flex-col space-y-4 items-center">
        {error ? (
          <div className="p-4 text-center text-error bg-error/10 rounded-xl border border-error/20 w-full">
            {error}
          </div>
        ) : (
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-border-primary">
            {!stream && <RefreshCw className="animate-spin text-white opacity-50" size={32} />}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-transform ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            
            {recording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
                <div className="w-2.5 h-2.5 bg-error rounded-full animate-pulse" />
                <span className="text-white text-xs font-mono font-bold">{formatTime(recordingTime)}</span>
              </div>
            )}
            
            <button
              onClick={toggleCamera}
              className="absolute top-4 left-4 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all border border-white/10"
              title="Flip Camera"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        )}

        <div className="flex w-full items-center justify-between mt-2">
          <div className="flex gap-2">
            <button
              onClick={() => { if (!recording) setMode('photo'); }}
              disabled={recording}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${mode === 'photo' ? 'bg-primary text-white' : 'bg-surface-dark text-text-muted hover:text-white disabled:opacity-50'}`}
              style={{ border: mode === 'photo' ? 'none' : '1px solid var(--border-primary)' }}
            >
              Photo
            </button>
            <button
              onClick={() => { if (!recording) setMode('video'); }}
              disabled={recording}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${mode === 'video' ? 'bg-primary text-white' : 'bg-surface-dark text-text-muted hover:text-white disabled:opacity-50'}`}
              style={{ border: mode === 'video' ? 'none' : '1px solid var(--border-primary)' }}
            >
              Video
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="p-3 text-text-muted hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <button
              onClick={handleAction}
              disabled={!!error || !stream}
              className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
                recording ? 'border-error bg-error/20' : 'border-primary bg-primary/20 hover:bg-primary/40'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {mode === 'photo' ? (
                <div className="w-12 h-12 bg-white rounded-full transition-transform active:scale-90" />
              ) : recording ? (
                <div className="w-6 h-6 bg-error rounded-md transition-transform active:scale-90" />
              ) : (
                <div className="w-12 h-12 bg-error rounded-full transition-transform active:scale-90" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
