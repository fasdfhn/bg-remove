import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Images } from "./components/Images";
import { processImages, initializeModel, getModelInfo } from "../lib/process";
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext";

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

// Wrap the app with the language provider
const AppWithLanguage = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

// Main app content with translations
const AppContent = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [isWebGPU, setIsWebGPU] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [showPricingTooltip, setShowPricingTooltip] = useState(false);

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

  // Language switcher component
  const LanguageSwitcher = () => {
    return (
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => setLanguage('en')} 
          className={`px-2 py-1 rounded ${language === 'en' ? 'bg-white text-indigo-600' : 'text-white/70 hover:text-white'}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage('es')} 
          className={`px-2 py-1 rounded ${language === 'es' ? 'bg-white text-indigo-600' : 'text-white/70 hover:text-white'}`}
        >
          ES
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white" onPaste={handlePaste}>
      {/* Header with language switcher */}
      <header className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1 className="text-2xl font-bold">BG Swap</h1>
              </a>
            </div>
            <div className="flex items-center space-x-6">
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <a 
                      href="/" 
                      className="hover:text-indigo-200 transition-colors"
                    >
                      {t('home')}
                    </a>
                  </li>
                  <li>
                    <div className="relative">
                      <button 
                        onClick={() => setShowPricingTooltip(!showPricingTooltip)}
                        className="hover:text-indigo-200 transition-colors cursor-pointer"
                      >
                        {t('pricing')}
                      </button>
                      
                      {showPricingTooltip && (
                        <div className="absolute z-10 mt-2 -left-24 w-64 bg-white text-gray-800 rounded-lg shadow-xl p-4 text-sm">
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-white"></div>
                          <p className="font-semibold text-indigo-600 mb-1">{t('comingSoon')}</p>
                          <p>{t('pricingMessage')}</p>
                          <button 
                            onClick={() => setShowPricingTooltip(false)}
                            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                  <li><a href="/contact" className="hover:text-indigo-200 transition-colors">{t('contact')}</a></li>
                </ul>
              </nav>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main content with translations */}
      <main>
        {images.length === 0 ? (
          <>
            {/* Hero section with translations */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white py-20">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero text - centered at the top */}
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                    {t('removeBackground')} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                      {t('backgroundsInstantly')}
                    </span>
                  </h2>
                  <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
                    {t('heroDescription')}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 justify-center mt-8">
                    <button 
                      className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:from-violet-700 hover:to-indigo-700 transition-all"
                      onClick={() => document.getElementById('upload-section')?.scrollIntoView({behavior: 'smooth'})}
                    >
                      {t('getStarted')}
                    </button>
                    <a 
                      href="#samples" 
                      className="px-8 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-lg font-medium shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all"
                    >
                      {t('viewSamples')}
                    </a>
                  </div>
                </div>
                
                {/* Upload box with translations */}
                <div className="relative max-w-3xl mx-auto">
                  <div className="absolute -inset-4 bg-gradient-to-r from-violet-200 to-indigo-200 rounded-3xl blur-xl opacity-50"></div>
                  <div className="relative bg-white p-6 rounded-2xl shadow-xl">
                    <div id="upload-section" className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('uploadYourImage')}</h3>
                      <p className="text-gray-600 mb-6">{t('dragAndDrop')}</p>
                      
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                          ${isDragAccept ? "border-green-500 bg-green-50" : ""}
                          ${isDragReject ? "border-red-500 bg-red-50" : ""}
                          ${isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"}
                          ${isLoading ? "cursor-not-allowed opacity-75" : ""}
                        `}
                      >
                        <input {...getInputProps()} className="hidden" disabled={isLoading} />
                        
                        {isLoading ? (
                          <div className="py-6">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Processing your image...</p>
                          </div>
                        ) : error ? (
                          <div className="py-6 text-center">
                            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-600 mb-2">{error.message}</p>
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
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                            >
                              Try Again
                            </button>
                          </div>
                        ) : (
                          <div className="py-8">
                            <svg className="w-16 h-16 text-indigo-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-lg font-medium text-gray-700 mb-2">
                              {isDragActive ? "Drop your image here" : "Drag & drop your image here"}
                            </p>
                            <p className="text-gray-500 mb-4">or</p>
                            <button 
                              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Browse Files
                            </button>
                            <p className="text-xs text-gray-400 mt-4">Supports JPG, PNG, WEBP</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div id="samples">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('tryWithSample')}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {sampleImages.map((url, index) => (
                          <button
                            key={index}
                            onClick={() => handleSampleImageClick(url)}
                            className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm hover:shadow-md group"
                          >
                            <img
                              src={url}
                              alt={`Sample ${index + 1}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                              <span className="text-white text-xs font-medium">Use this image</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Feature boxes with translations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-indigo-600 font-bold text-xl mb-1">{t('fast')}</div>
                    <p className="text-gray-600 text-sm">{t('fastDescription')}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-indigo-600 font-bold text-xl mb-1">{t('free')}</div>
                    <p className="text-gray-600 text-sm">{t('freeDescription')}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-indigo-600 font-bold text-xl mb-1">{t('unlimited')}</div>
                    <p className="text-gray-600 text-sm">{t('unlimitedDescription')}</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-100 rounded-full opacity-50 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-violet-100 rounded-full opacity-50 blur-3xl"></div>
            </section>
            
            {/* How it works section with translations */}
            <section className="py-20 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-900">{t('howItWorks')}</h2>
                  <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                    {t('howItWorksDescription')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  <div className="bg-white p-8 rounded-xl shadow-md">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                      <span className="text-xl font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{t('step1Title')}</h3>
                    <p className="text-gray-600">{t('step1Description')}</p>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="bg-white p-8 rounded-xl shadow-md">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                      <span className="text-xl font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{t('step2Title')}</h3>
                    <p className="text-gray-600">{t('step2Description')}</p>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="bg-white p-8 rounded-xl shadow-md">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                      <span className="text-xl font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{t('step3Title')}</h3>
                    <p className="text-gray-600">{t('step3Description')}</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{t('yourImages')}</h2>
                <button 
                  onClick={() => setImages([])} 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('backToHome')}
                </button>
              </div>
              <Images images={images} onDelete={(id) => setImages(prev => prev.filter(img => img.id !== id))} />
            </div>
          </section>
        )}
      </main>

      {/* Footer with translations */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 mr-3 text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="text-xl font-bold">BG Swap</h3>
              </div>
              <p className="text-gray-400">
                BG Swap is a free, unlimited AI-powered background removal tool that delivers professional results instantly. No sign-up required, no usage limits, and no watermarks.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} BG Swap. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Export the wrapped component
export default AppWithLanguage;
