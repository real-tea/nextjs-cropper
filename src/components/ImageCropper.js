// src/components/ImageCropper.js
import React, { useState, useRef, useEffect } from 'react';

const ImageCropper = ({ imageUrl, onCrop }) => {
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      image.onload = () => {
        setImageLoaded(true);
      };
    }
  }, [imageUrl]);

  useEffect(() => {
    if (imageLoaded) {
      const image = imageRef.current;
      const canvas = canvasRef.current;

      if (image && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            image,
            cropArea.x,
            cropArea.y,
            cropArea.width,
            cropArea.height,
            0,
            0,
            canvas.width,
            canvas.height
          );
        }
      }
    }
  }, [cropArea, imageLoaded]);

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropArea({ ...cropArea, x, y });
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCropArea({ ...cropArea, width: x - cropArea.x, height: y - cropArea.y });
    }
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const croppedImage = canvas.toDataURL('image/jpeg');
      onCrop(croppedImage);
    }
  };

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden cursor-crosshair border border-gray-300 rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <img 
          ref={imageRef} 
          src={imageUrl} 
          alt="Original" 
          className="max-w-full" 
          onLoad={() => setImageLoaded(true)}
        />
        {imageLoaded && (
          <div
            className="absolute border-2 border-white"
            style={{
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height,
            }}
          />
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="hidden"
      />
      <div className="mt-4 text-center">
        <button
          className="px-6 py-2 font-semibold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-200"
          onClick={handleCrop}
          disabled={!imageLoaded}
        >
          Crop Image
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;