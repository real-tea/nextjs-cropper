import React, { useState, useRef, useEffect } from "react";

const ImageCropper = ({ imageUrl, onCrop }) => {
  const [cropArea, setCropArea] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState("");
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      initializeCropArea();
    };
    image.src = imageUrl;
  }, [imageUrl]);

  const initializeCropArea = () => {
    const containerRect = containerRef.current.getBoundingClientRect();
    const size = Math.min(containerRect.width, containerRect.height, 300) / 2;
    setCropArea({
      x: (containerRect.width - size) / 2,
      y: (containerRect.height - size) / 2,
      width: size,
      height: size,
    });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    if (!cropArea) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDragging(true);
    setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (!cropArea) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      const newX = Math.max(0, Math.min(x - dragStart.x, rect.width - cropArea.width));
      const newY = Math.max(0, Math.min(y - dragStart.y, rect.height - cropArea.height));
      setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      handleResize(x, y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (direction, e) => {
    e.stopPropagation();
    setResizeDirection(direction);
    setIsResizing(true);
  };

  const handleResize = (x, y) => {
    if (!cropArea) return;
    let newCropArea = { ...cropArea };
    const rect = containerRef.current.getBoundingClientRect();

    const resizeCorner = (dx, dy) => {
      newCropArea.width = Math.max(50, Math.min(newCropArea.width + dx, rect.width - newCropArea.x));
      newCropArea.height = Math.max(50, Math.min(newCropArea.height + dy, rect.height - newCropArea.y));
      if (resizeDirection.includes('w')) newCropArea.x = Math.min(x, newCropArea.x + newCropArea.width - 50);
      if (resizeDirection.includes('n')) newCropArea.y = Math.min(y, newCropArea.y + newCropArea.height - 50);
    };

    switch (resizeDirection) {
      case "se": resizeCorner(x - (cropArea.x + cropArea.width), y - (cropArea.y + cropArea.height)); break;
      case "sw": resizeCorner(cropArea.x - x, y - (cropArea.y + cropArea.height)); break;
      case "ne": resizeCorner(x - (cropArea.x + cropArea.width), cropArea.y - y); break;
      case "nw": resizeCorner(cropArea.x - x, cropArea.y - y); break;
      case "n": newCropArea.height = cropArea.y + cropArea.height - y; newCropArea.y = y; break;
      case "s": newCropArea.height = y - cropArea.y; break;
      case "e": newCropArea.width = x - cropArea.x; break;
      case "w": newCropArea.width = cropArea.x + cropArea.width - x; newCropArea.x = x; break;
    }

    setCropArea(newCropArea);
  };

  const handleCrop = () => {
    if (!cropArea || !imageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
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

    const croppedImage = canvas.toDataURL("image/jpeg");
    onCrop(croppedImage);
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative overflow-hidden cursor-crosshair border border-gray-300 rounded-lg"
        style={{ width: "100%", height: "400px" }}
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
          style={{ objectFit: "contain", width: "100%", height: "100%" }}
        />
        {cropArea && (
          <>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, 
                  rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.5) ${cropArea.x}px, 
                  transparent ${cropArea.x}px, transparent ${cropArea.x + cropArea.width}px, 
                  rgba(0,0,0,0.5) ${cropArea.x + cropArea.width}px, rgba(0,0,0,0.5) 100%),
                  linear-gradient(to bottom, 
                  rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.5) ${cropArea.y}px, 
                  transparent ${cropArea.y}px, transparent ${cropArea.y + cropArea.height}px, 
                  rgba(0,0,0,0.5) ${cropArea.y + cropArea.height}px, rgba(0,0,0,0.5) 100%)`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "0 0, 0 0",
                backgroundSize: "100% 100%, 100% 100%",
              }}
            />
            <div
              className="absolute"
              style={{
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                border: '2px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              {/* Overlay grid */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-white opacity-50" />
                ))}
              </div>
              
              {/* Corner handles */}
              {['nw', 'ne', 'se', 'sw'].map((corner) => (
                <div
                  key={corner}
                  className="absolute w-4 h-4 bg-white rounded-full shadow-md cursor-move"
                  style={{
                    [corner[0]]: '-6px',
                    [corner[1]]: '-6px',
                    cursor: `${corner}-resize`,
                  }}
                  onMouseDown={(e) => handleResizeStart(corner, e)}
                />
              ))}
              
              {/* Edge handles */}
              {['n', 's', 'e', 'w'].map((edge) => (
                <div
                  key={edge}
                  className="absolute bg-white rounded-full shadow-md cursor-move"
                  style={{
                    [edge]: '-4px',
                    [edge === 'n' || edge === 's' ? 'left' : 'top']: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: edge === 'n' || edge === 's' ? '2rem' : '8px',
                    height: edge === 'n' || edge === 's' ? '8px' : '2rem',
                    cursor: `${edge}-resize`,
                  }}
                  onMouseDown={(e) => handleResizeStart(edge, e)}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
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