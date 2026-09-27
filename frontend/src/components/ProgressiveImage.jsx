import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

export default function ProgressiveImage({ src, alt, className = '', style = {}, onMouseOver, onMouseOut, fallbackText = 'Image Unavailable' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset state if src changes
    setLoaded(false);
    setError(false);
    
    if (!src) {
      setError(true);
      return;
    }

    const img = new Image();
    img.src = src;
    
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <div className={`progressive-image-container ${className}`} style={style} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      {/* Skeleton Shimmer Layer */}
      {(!loaded && !error) && <div className="skeleton-shimmer"></div>}
      
      {/* Actual Image Layer */}
      {!error && (
        <img 
          src={src} 
          alt={alt || "Product Image"} 
          className={`progressive-image ${loaded ? 'loaded' : ''}`} 
        />
      )}

      {/* Error / Fallback Layer */}
      {error && (
        <div className="progressive-image-fallback">
          <ImageOff size={24} />
          <span>{fallbackText}</span>
        </div>
      )}
    </div>
  );
}
