import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  loading = 'lazy',
  fallback = null,
  aspectRatio = 'auto',
  objectFit = 'cover',
  priority = false,
  onLoad,
  onError,
  placeholder = 'loading'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    if (priority) {
      // Preload priority images immediately
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setIsLoaded(true);
        onLoad?.();
      };
      img.onerror = () => {
        setError(true);
        onError?.();
      };
    }
  }, [src, priority, onLoad, onError]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setError(true);
    onError?.();
    if (fallback) {
      setImgSrc(fallback);
      setError(false);
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'video': return 'aspect-video';
      case 'square': return 'aspect-square';
      case 'portrait': return 'aspect-[3/4]';
      case 'wide': return 'aspect-[21/9]';
      default: return '';
    }
  };

  const getObjectFitClass = () => {
    switch (objectFit) {
      case 'contain': return 'object-contain';
      case 'fill': return 'object-fill';
      case 'none': return 'object-none';
      case 'scale-down': return 'object-scale-down';
      default: return 'object-cover';
    }
  };

  if (error && !fallback) {
    return (
      <div 
        className={`image-error text-xs sm:text-sm ${getAspectRatioClass()} ${className}`} 
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🖼️</div>
          <div>Image unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${getAspectRatioClass()} ${className}`} 
      style={{ width, height }}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0">
          {placeholder === 'blur' ? (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
          ) : placeholder === 'skeleton' ? (
            <div className="absolute inset-0 image-loading">
              <div className="h-full w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
              <div className="text-gray-600 text-xs sm:text-sm">Loading...</div>
            </div>
          )}
        </div>
      )}

      {/* Main image */}
      <motion.img
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        className={`w-full h-full transition-opacity duration-500 ${getObjectFitClass()} ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Overlay for Netflix-style hover effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100 pointer-events-none" />
    </div>
  );
};

export default OptimizedImage; 