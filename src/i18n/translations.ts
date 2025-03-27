// Language translations for the application

export const translations = {
  en: {
    // Header
    home: "Home",
    pricing: "Pricing",
    contact: "Contact",
    
    // Hero section
    removeBackground: "Remove Image",
    backgroundsInstantly: "Backgrounds Instantly",
    heroDescription: "Professional-quality background removal powered by AI. 100% free with no usage limits. Perfect for product photos, portraits, and design work.",
    getStarted: "Get Started",
    viewSamples: "View Samples",
    
    // Upload section
    uploadYourImage: "Upload Your Image",
    dragAndDrop: "Drag & drop your image or click to browse",
    dropHere: "Drop your image here",
    dragHere: "Drag & drop your image here",
    or: "or",
    browseFiles: "Browse Files",
    supportsFormats: "Supports JPG, PNG, WEBP",
    processing: "Processing your image...",
    tryAgain: "Try Again",
    
    // Sample images
    tryWithSample: "Or try with a sample:",
    useThisImage: "Use this image",
    
    // Features
    fast: "Fast",
    fastDescription: "Results in seconds, no waiting",
    free: "Free",
    freeDescription: "No cost, no hidden fees",
    unlimited: "Unlimited",
    unlimitedDescription: "No usage restrictions",
    
    // How it works
    howItWorks: "How It Works",
    howItWorksDescription: "Remove backgrounds in three simple steps",
    step1Title: "Upload Your Image",
    step1Description: "Drag and drop your image or select from your device. We support JPG, PNG, and WEBP formats.",
    step2Title: "AI Processing",
    step2Description: "Our advanced AI technology automatically detects and removes the background from your image.",
    step3Title: "Download Result",
    step3Description: "Download your image with the background removed. Ready to use for your projects.",
    
    // Results page
    yourImages: "Your Images",
    backToHome: "Back to Home",
    
    // Footer
    product: "Product",
    features: "Features",
    api: "API",
    integrations: "Integrations",
    resources: "Resources",
    documentation: "Documentation",
    tutorials: "Tutorials",
    blog: "Blog",
    support: "Support",
    company: "Company",
    about: "About",
    privacy: "Privacy",
    terms: "Terms",
    allRightsReserved: "All rights reserved.",
    footerDescription: "BG Swap is a free, unlimited AI-powered background removal tool that delivers professional results instantly. No sign-up required, no usage limits, and no watermarks.",
    
    // Pricing tooltip
    comingSoon: "Coming Soon!",
    pricingMessage: "BG Swap is currently 100% free! Take advantage of unlimited usage now before we introduce our premium plans."
  },
  es: {
    // Header
    home: "Inicio",
    pricing: "Precios",
    contact: "Contacto",
    
    // Hero section
    removeBackground: "Elimina el Fondo",
    backgroundsInstantly: "de Imágenes al Instante",
    heroDescription: "Eliminación de fondos de calidad profesional impulsada por IA. 100% gratis y sin límites de uso. Perfecto para fotos de productos, retratos y diseño.",
    getStarted: "Comenzar",
    viewSamples: "Ver Ejemplos",
    
    // Upload section
    uploadYourImage: "Sube tu Imagen",
    dragAndDrop: "Arrastra y suelta tu imagen o haz clic para explorar",
    dropHere: "Suelta tu imagen aquí",
    dragHere: "Arrastra y suelta tu imagen aquí",
    or: "o",
    browseFiles: "Explorar Archivos",
    supportsFormats: "Compatible con JPG, PNG, WEBP",
    processing: "Procesando tu imagen...",
    tryAgain: "Intentar de Nuevo",
    
    // Sample images
    tryWithSample: "O prueba con un ejemplo:",
    useThisImage: "Usar esta imagen",
    
    // Features
    fast: "Rápido",
    fastDescription: "Resultados en segundos, sin esperas",
    free: "Gratis",
    freeDescription: "Sin costo, sin tarifas ocultas",
    unlimited: "Ilimitado",
    unlimitedDescription: "Sin restricciones de uso",
    
    // How it works
    howItWorks: "Cómo Funciona",
    howItWorksDescription: "Elimina fondos en tres simples pasos",
    step1Title: "Sube tu Imagen",
    step1Description: "Arrastra y suelta tu imagen o selecciona desde tu dispositivo. Soportamos formatos JPG, PNG y WEBP.",
    step2Title: "Procesamiento IA",
    step2Description: "Nuestra avanzada tecnología de IA detecta y elimina automáticamente el fondo de tu imagen.",
    step3Title: "Descarga el Resultado",
    step3Description: "Descarga tu imagen con el fondo eliminado. Lista para usar en tus proyectos.",
    
    // Results page
    yourImages: "Tus Imágenes",
    backToHome: "Volver al Inicio",
    
    // Footer
    product: "Producto",
    features: "Características",
    api: "API",
    integrations: "Integraciones",
    resources: "Recursos",
    documentation: "Documentación",
    tutorials: "Tutoriales",
    blog: "Blog",
    support: "Soporte",
    company: "Empresa",
    about: "Acerca de",
    privacy: "Privacidad",
    terms: "Términos",
    allRightsReserved: "Todos los derechos reservados.",
    footerDescription: "BG Swap es una herramienta gratuita e ilimitada de eliminación de fondos impulsada por IA que ofrece resultados profesionales al instante. No requiere registro, sin límites de uso y sin marcas de agua.",
    
    // Pricing tooltip
    comingSoon: "¡Próximamente!",
    pricingMessage: "¡BG Swap es actualmente 100% gratis! Aprovecha el uso ilimitado ahora antes de que introduzcamos nuestros planes premium."
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en; 