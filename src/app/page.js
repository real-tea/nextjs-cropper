// src/app/page.js
'use client';

import React, { useState } from 'react';
import ImageCropper from '../components/ImageCropper';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = (croppedImageData) => {
    setCroppedImage(croppedImageData);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="p-8 w-full">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Image Cropper</h1>
            <div className="mb-6 text-center">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span className="inline-block px-4 py-2 border border-gray-300 rounded-md shadow-sm">Choose an image</span>
                <input id="file-upload" name="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
              </label>
            </div>
            {selectedImage && (
              <div className="mt-6">
                <ImageCropper imageUrl={selectedImage} onCrop={handleCrop} />
              </div>
            )}
            {croppedImage && (
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2 text-center text-gray-800">Cropped Image</h2>
                <img src={croppedImage} alt="Cropped" className="max-w-full rounded-lg shadow-md" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}