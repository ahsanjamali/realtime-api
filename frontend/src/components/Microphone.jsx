import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import'../styles/Microphone.css';

const Microphone = ({ onAudioData }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    const setupMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            sampleSize: 16,
          }
        });

        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm',
        });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            setAudioChunks((prev) => [...prev, e.data]);
          }
        };

        setMediaRecorder(recorder);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    setupMediaRecorder();
    
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder]);

  useEffect(() => {
    if (audioChunks.length > 0 && onAudioData) {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      onAudioData(audioBlob);
      setAudioChunks([]);
    }
  }, [audioChunks, onAudioData]);

  const toggleRecording = () => {
    if (!mediaRecorder) return;

    if (isRecording) {
      mediaRecorder.stop();
    } else {
      setAudioChunks([]);
      mediaRecorder.start(100);
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="microphone-container">
      <motion.button
        onClick={toggleRecording}
        className={`mic-button ${isRecording ? 'recording' : ''}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className={`pulse-ring ${isRecording ? 'active' : ''}`}
          animate={{
            boxShadow: isRecording
              ? [
                  '0 0 0 0px rgba(239, 68, 68, 0.2)',
                  '0 0 0 20px rgba(239, 68, 68, 0)',
                ]
              : '0 0 0 0px rgba(239, 68, 68, 0)',
          }}
          transition={{
            repeat: isRecording ? Infinity : 0,
            duration: 1.5,
          }}
        />
        <Mic
          className={`mic-icon ${isRecording ? 'mic-icon-recording' : 'mic-icon-idle'}`}
        />
      </motion.button>
    </div>
  );
};

export default Microphone;




