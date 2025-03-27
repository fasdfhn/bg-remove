import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Images } from "./components/Images";
import { processImages, initializeModel, getModelInfo } from "../lib/process";

interface AppError {
  message: string;
}

export interface ImageFile {
  id: number;
  file: File;
  processedFile?: File;
}

// Sample images from Unsplash - new selection
const sampleImages = [
  "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=986&q=80", // Fashion model
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", // Red shoe
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80", // Houseplant
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=768&q=80"  // Product shot
];

// Check if the user is on mobile Safari
const isMobileSafari = () => {
  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  const webkit = !!ua.match(/WebKit/i);
  const iOSSafari = iOS && webkit && !ua.match(/CriOS/i) && !ua.match(/OPiOS/i) && !ua.match(/FxiOS/i);
  return iOSSafari && 'ontouchend' in document;
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [isWebGPU, setIsWebGPU] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);

  useEffect(() => {
    if (isMobileSafari()) {
      window.location.href = 'https://m.bg-swap.com';
      return;
    }

    // Only check iOS on load since that won't change
    const { isIOS: isIOSDevice } = getModelInfo();
    setIsIOS(isIOSDevice);
    setIsLoading(false);
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      processedFile: undefined
    }));
    setImages(prev => [...prev, ...newImages]);
    
    // Initialize model if this is the first image
    if (images.length === 0) {
      setIsLoading(true);
      setError(null);
      try {
        const initialized = await initializeModel();
        if (!initialized) {
          throw new Error("Failed to initialize background removal model");
        }
      } catch (err) {
        setError({
          message: err instanceof Error ? err.message : "An unknown error occurred"
        });
        setImages([]); // Clear the newly added images if model fails to load
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }
    
    for (const image of newImages) {
      try {
        const result = await processImages([image.file]);
        if (result && result.length > 0) {
          setImages(prev => prev.map(img =>
            img.id === image.id
              ? { ...img, processedFile: result[0] }
              : img
          ));
        }
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  }, [images.length]);

  const handlePaste = async (event: React.ClipboardEvent) => {
    const clipboardItems = event.clipboardData.items;
    const imageFiles: File[] = [];
    for (const item of clipboardItems) {
      if (item.type.startsWith("image")) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }
    if (imageFiles.length > 0) {
      onDrop(imageFiles);
    }
  };  

  const handleSampleImageClick = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'sample-image.jpg', { type: 'image/jpeg' });
      onDrop([file]);
    } catch (error) {
      console.error('Error loading sample image:', error);
    }
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".mp4"],
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800" onPaste={handlePaste}>
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">
                BG Swap
              </h1>
            </div>
          </div>
          {isIOS && (
            <p className="text-sm text-gray-300 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Using optimized iOS background removal
            </p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb */}
        {images.length > 0 && (
          <div className="flex items-center text-sm text-gray-300 mb-4">
            <span className="hover:text-pink-400 cursor-pointer" onClick={() => setImages([])}>Home</span>
            <svg className="w-4 h-4 mx-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span className="text-white">Your Images ({images.length})</span>
          </div>
        )}

        {/* Main content */}
        {images.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hero section */}
            <div className="bg-black/30 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 shadow-xl">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
                  alt="Professional background removal example"
                  className="w-full object-cover h-[300px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    AI Background Removal
                  </h2>
                  <p className="text-xl text-gray-300">
                    Fast, Free, and Powerful
                  </p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-pink-500/20 p-2 rounded-full mr-4 mt-1">
                      <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg">Instant Results</h3>
                      <p className="text-gray-400">Remove backgrounds in seconds with our advanced AI technology</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-500/20 p-2 rounded-full mr-4 mt-1">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg">Secure & Private</h3>
                      <p className="text-gray-400">Your images are handled with the highest privacy standards</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-500/20 p-2 rounded-full mr-4 mt-1">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg">Professional Quality</h3>
                      <p className="text-gray-400">Perfect for e-commerce, social media, and creative projects</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Upload section */}
            <div className="space-y-6">
              <div
                {...getRootProps()}
                className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all duration-300 ease-in-out bg-black/30 backdrop-blur-sm h-[300px] flex flex-col items-center justify-center
                  ${isDragAccept ? "border-green-400 bg-green-900/20" : ""}
                  ${isDragReject ? "border-red-400 bg-red-900/20" : ""}
                  ${isDragActive ? "border-blue-400 bg-blue-900/20" : "border-gray-600 hover:border-pink-400"}
                  ${isLoading ? "cursor-not-allowed opacity-75" : ""}
                `}
              >
                <input {...getInputProps()} className="hidden" disabled={isLoading} />
                <div className="flex flex-col items-center gap-4">
                  {isLoading ? (
                    <>
                      <div className="w-16 h-16 rounded-full border-4 border-pink-500/30 border-t-pink-500 animate-spin"></div>
                      <p className="text-xl text-gray-300 font-medium">
                        Loading background removal model...
                      </p>
                      <p className="text-sm text-gray-400">This may take a few moments</p>
                    </>
                  ) : error ? (
                    <>
                      <div className="bg-red-500/20 rounded-full p-4">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <p className="text-xl text-red-400 font-medium mb-2">{error.message}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setError(null);
                          setIsLoading(true);
                          initializeModel().then(() => setIsLoading(false)).catch(err => {
                            setError({
                              message: err instanceof Error ? err.message : "An unknown error occurred"
                            });
                            setIsLoading(false);
                          });
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-colors shadow-lg shadow-purple-900/30"
                      >
                        Try Again
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-30 animate-pulse"></div>
                        <div className="relative bg-black/50 rounded-full p-5">
                          <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-2xl font-medium text-white">
                        {isDragActive
                          ? "Drop to upload"
                          : "Drag & drop images here"}
                      </p>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>or</span>
                        <button 
                          className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-colors shadow-lg shadow-purple-900/30"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Browse files
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, WEBP</p>
                    </>
                  )}
                </div>
              </div>

              {/* Sample images */}
              <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <h3 className="text-xl text-white font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Try with a sample image
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sampleImages.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleImageClick(url)}
                      className="relative aspect-square overflow-hidden rounded-xl border border-white/10 hover:border-pink-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-lg shadow-black/30 group"
                    >
                      <img
                        src={url}
                        alt={`Sample ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                        <span className="text-white text-sm font-medium px-3 py-1 bg-pink-500/70 rounded-full">Use this image</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <Images images={images} onDelete={(id) => setImages(prev => prev.filter(img => img.id !== id))} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} BG Swap. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6 text-sm">
                <li><a href="/privacy" className="text-gray-400 hover:text-pink-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-pink-400 transition-colors">Terms of Service</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-pink-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-500 max-w-3xl">
            <p>BG Swap is an advanced AI-powered background removal tool that helps you remove backgrounds from images instantly. Perfect for product photography, portraits, ID photos, and more. Our tool processes all images locally on your device, ensuring complete privacy and security.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
