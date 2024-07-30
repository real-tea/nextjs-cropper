// src/components/ImageCropper.js
import React, { useState, useRef, useEffect } from 'react';

const ImageCropper = ({ imageUrl, onCrop }) => {
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      image.onload = () => {
        setImageLoaded(true);
        setImageDimensions({ width: image.width, height: image.height });
        initializeCropArea(image.width, image.height);
      };
    }
  }, [imageUrl]);

  const initializeCropArea = (width, height) => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // Auto crop for mobile
      const size = Math.min(width, height, 300);
      setCropArea({
        x: (width - size) / 2,
        y: (height - size) / 2,
        width: size,
        height: size,
      });
    } else {
      // Default crop area for desktop
      const size = Math.min(width, height, 400) / 2;
      setCropArea({
        x: (width - size) / 2,
        y: (height - size) / 2,
        width: size,
        height: size,
      });
    }
  };

  useEffect(() => {
    if (imageLoaded) {
      drawImage();
    }
  }, [cropArea, imageLoaded]);

  const drawImage = () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (image && canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;
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
  };

  const handleMouseDown = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDragging(true);
    setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newX = Math.max(0, Math.min(x - dragStart.x, imageDimensions.width - cropArea.width));
      const newY = Math.max(0, Math.min(y - dragStart.y, imageDimensions.height - cropArea.height));
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResize = (direction, e) => {
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let newWidth, newHeight, newX, newY;

    switch (direction) {
      case 'se':
        newWidth = x - cropArea.x;
        newHeight = y - cropArea.y;
        break;
      case 'sw':
        newWidth = cropArea.x + cropArea.width - x;
        newHeight = y - cropArea.y;
        newX = x;
        break;
      case 'ne':
        newWidth = x - cropArea.x;
        newHeight = cropArea.y + cropArea.height - y;
        newY = y;
        break;
      case 'nw':
        newWidth = cropArea.x + cropArea.width - x;
        newHeight = cropArea.y + cropArea.height - y;
        newX = x;
        newY = y;
        break;
    }

    // Ensure minimum size and maximum bounds
    const minSize = 50;
    newWidth = Math.max(minSize, Math.min(newWidth, imageDimensions.width - cropArea.x));
    newHeight = Math.max(minSize, Math.min(newHeight, imageDimensions.height - cropArea.y));

    setCropArea(prev => ({
      x: newX !== undefined ? newX : prev.x,
      y: newY !== undefined ? newY : prev.y,
      width: newWidth,
      height: newHeight,
    }));
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
        ref={containerRef}
        className="relative overflow-hidden cursor-move border border-gray-300 rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          ref={imageRef} 
          src={imageUrl} 
          alt="Original" 
          className="max-w-full" 
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
          >
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-white cursor-se-resize" onMouseDown={(e) => handleResize('se', e)} />
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-white cursor-sw-resize" onMouseDown={(e) => handleResize('sw', e)} />
            <div className="absolute top-0 right-0 w-4 h-4 bg-white cursor-ne-resize" onMouseDown={(e) => handleResize('ne', e)} />
            <div className="absolute top-0 left-0 w-4 h-4 bg-white cursor-nw-resize" onMouseDown={(e) => handleResize('nw', e)} />
          </div>
        )}
      </div>
      <canvas
        ref={canvasRef}
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