import React, { useState, useRef, useEffect } from 'react';

const ImageCropper = ({ imageUrl, onCrop }) => {
  const [cropArea, setCropArea] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState('');
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setImageLoaded(true);
      setImageDimensions({ width: image.width, height: image.height });
    };
    image.src = imageUrl;
  }, [imageUrl]);

  const initializeCropArea = () => {
    const containerRect = containerRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    const size = isMobile ? Math.min(containerRect.width, containerRect.height, 300) : Math.min(containerRect.width, containerRect.height, 400) / 2;
    setCropArea({
      x: (containerRect.width - size) / 2,
      y: (containerRect.height - size) / 2,
      width: size,
      height: size,
    });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    if (!cropArea) {
      initializeCropArea();
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDragging(true);
    setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (!cropArea) return;
    if (isDragging) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newX = Math.max(0, Math.min(x - dragStart.x, rect.width - cropArea.width));
      const newY = Math.max(0, Math.min(y - dragStart.y, rect.height - cropArea.height));
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handleResize(x, y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (direction, e) => {
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    setResizeStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setResizeDirection(direction);
    setIsResizing(true);
  };

  const handleResize = (x, y) => {
    if (!cropArea) return;
    let newCropArea = { ...cropArea };
    const rect = containerRef.current.getBoundingClientRect();

    switch (resizeDirection) {
      case 'se':
        newCropArea.width = Math.max(50, Math.min(x - cropArea.x, rect.width - cropArea.x));
        newCropArea.height = Math.max(50, Math.min(y - cropArea.y, rect.height - cropArea.y));
        break;
      case 'sw':
        newCropArea.width = Math.max(50, Math.min(cropArea.x + cropArea.width - x, cropArea.x + cropArea.width));
        newCropArea.height = Math.max(50, Math.min(y - cropArea.y, rect.height - cropArea.y));
        newCropArea.x = Math.min(x, cropArea.x + cropArea.width - 50);
        break;
      case 'ne':
        newCropArea.width = Math.max(50, Math.min(x - cropArea.x, rect.width - cropArea.x));
        newCropArea.height = Math.max(50, Math.min(cropArea.y + cropArea.height - y, cropArea.y + cropArea.height));
        newCropArea.y = Math.min(y, cropArea.y + cropArea.height - 50);
        break;
      case 'nw':
        newCropArea.width = Math.max(50, Math.min(cropArea.x + cropArea.width - x, cropArea.x + cropArea.width));
        newCropArea.height = Math.max(50, Math.min(cropArea.y + cropArea.height - y, cropArea.y + cropArea.height));
        newCropArea.x = Math.min(x, cropArea.x + cropArea.width - 50);
        newCropArea.y = Math.min(y, cropArea.y + cropArea.height - 50);
        break;
    }

    setCropArea(newCropArea);
  };

  const handleCrop = () => {
    if (!cropArea || !imageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = cropArea.width * scaleX;
    canvas.height = cropArea.height * scaleY;

    ctx.drawImage(
      image,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const croppedImage = canvas.toDataURL('image/jpeg');
    onCrop(croppedImage);
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative overflow-hidden cursor-crosshair border border-gray-300 rounded-lg"
        style={{ width: '100%', height: '400px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          ref={imageRef} 
          src={imageUrl} 
          alt="Original" 
          className="max-w-full h-auto"
          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
        />
        {cropArea && (
          <>
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              style={{
                clipPath: `polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, ${cropArea.x}px ${cropArea.y}px, ${cropArea.x}px ${cropArea.y + cropArea.height}px, ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px, ${cropArea.x + cropArea.width}px ${cropArea.y}px, ${cropArea.x}px ${cropArea.y}px)`
              }}
            />
            <div
              className="absolute border-2 border-white"
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
              }}
            >
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-white cursor-se-resize" onMouseDown={(e) => handleResizeStart('se', e)} />
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-white cursor-sw-resize" onMouseDown={(e) => handleResizeStart('sw', e)} />
              <div className="absolute top-0 right-0 w-4 h-4 bg-white cursor-ne-resize" onMouseDown={(e) => handleResizeStart('ne', e)} />
              <div className="absolute top-0 left-0 w-4 h-4 bg-white cursor-nw-resize" onMouseDown={(e) => handleResizeStart('nw', e)} />
            </div>
          </>
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
          disabled={!cropArea}
        >
          Crop Image
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;