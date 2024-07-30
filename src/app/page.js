// src/app/page.js
'use client';

import React, { useState } from 'react';
import ImageCropper from '../components/ImageCropper';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    setError(null); // Clear any previous errors
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedImage(event.target?.result?.toString() || null);
        };
        reader.onerror = () => {
          setError('Error reading file');
        };
        reader.readAsDataURL(file);
      } else {
        setError('Please select a valid image file');
      }
    }
  };

  const handleCrop = (croppedImageData) => {
    setCroppedImage(croppedImageData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Image Search</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="mb-6 text-center">
              <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Choose an image
                <input id="file-upload" name="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
              </label>
            </div>
            {error && (
              <p className="text-red-500 text-center mb-4">{error}</p>
            )}
            {selectedImage && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">Crop Your Image</h2>
                <ImageCropper imageUrl={selectedImage} onCrop={handleCrop} />
              </div>
            )}
            {croppedImage && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">Cropped Image</h2>
                <div className="flex justify-center">
                  <img src={croppedImage} alt="Cropped" className="max-w-full rounded-lg shadow-sm" />
                </div>
                <div className="mt-4 text-center">
                  <a
                    href={croppedImage}
                    download="cropped_image.jpg"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Cropped Image
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}