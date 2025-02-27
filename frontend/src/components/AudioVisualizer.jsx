import React, { useEffect, useRef } from "react";
import useAudioStore from "./store/audioStore";
import "../styles/AudioVisualizer.css";

const AudioVisualizer = () => {
  const { audioStream, stopAudio } = useAudioStore();
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!audioStream) return;

    const canvas = canvasRef.current;
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(audioStream);

    source.connect(analyser);
    // Don't connect to destination as the audio is already playing
    // analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvas.width = 400; // Fixed size for orb-like circle
    canvas.height = 400;

    const ctx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const barWidth = (WIDTH / bufferLength) * 2.5;

    let animationFrameId;

    const renderFrame = () => {
      animationFrameId = requestAnimationFrame(renderFrame);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];

        // Create a linear gradient for each bar
        const gradient = ctx.createLinearGradient(
          x,
          HEIGHT - barHeight,
          x,
          HEIGHT
        );
        gradient.addColorStop(0, "violet"); // Start color
        gradient.addColorStop(1, "pink"); // End color

        ctx.fillStyle = gradient;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    renderFrame();

    // Clean up when the stream ends
    audioStream.addEventListener("inactive", () => {
      stopAudio();
      cancelAnimationFrame(animationFrameId);
      if (audioContext.state !== "closed") {
        audioContext.close();
      }
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, [audioStream, stopAudio]);

  return (
    <div className="audio-visualizer">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default AudioVisualizer;
