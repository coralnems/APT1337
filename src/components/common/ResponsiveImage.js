import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

/**
 * ResponsiveImage component that handles lazy loading and responsive sizing
 * 
 * @param {string} src - The source URL of the image
 * @param {string} alt - Alt text for the image
 * @param {string} smallSrc - Source for smaller screens (optional)
 * @param {string} mediumSrc - Source for medium screens (optional)
 * @param {string} largeSrc - Source for large screens (optional)
 * @param {object} sx - Additional MUI styling
 * @param {boolean} lazyLoad - Whether to lazy load the image (default: true)
 * @param {number} width - Image width
 * @param {number} height - Image height
 */
const ResponsiveImage = ({
  src,
  alt,
  smallSrc,
  mediumSrc,
  largeSrc,
  sx = {},
  lazyLoad = true,
  width,
  height,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set default image source
    setImageSrc(src);

    // Create and handle intersection observer for lazy loading
    if (lazyLoad) {
      const imgRef = document.createElement('img');
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Load appropriate image based on screen size
              if (window.innerWidth < 600 && smallSrc) {
                setImageSrc(smallSrc);
              } else if (window.innerWidth < 960 && mediumSrc) {
                setImageSrc(mediumSrc);
              } else if (largeSrc) {
                setImageSrc(largeSrc);
              } else {
                setImageSrc(src);
              }
              observer.disconnect();
            }
          });
        },
        { rootMargin: '200px' }
      );

      const currentImageRef = imgRef;
      observer.observe(currentImageRef);

      return () => {
        observer.disconnect();
      };
    } else {
      // Non-lazy loading path
      if (window.innerWidth < 600 && smallSrc) {
        setImageSrc(smallSrc);
      } else if (window.innerWidth < 960 && mediumSrc) {
        setImageSrc(mediumSrc);
      } else if (largeSrc) {
        setImageSrc(largeSrc);
      }
    }
  }, [src, smallSrc, mediumSrc, largeSrc, lazyLoad]);

  return (
    <Box 
      sx={{ 
        position: 'relative',
        overflow: 'hidden',
        ...sx 
      }}
    >
      {!isLoaded && (
        <Box 
          className="content-placeholder"
          sx={{ width: '100%', height: height || '100%' }}
        />
      )}
      <img
        src={imageSrc || src}
        alt={alt}
        loading={lazyLoad ? 'lazy' : 'eager'}
        onLoad={() => setIsLoaded(true)}
        style={{ 
          width: width || '100%', 
          height: height || 'auto',
          display: isLoaded ? 'block' : 'none'
        }}
        {...props}
      />
    </Box>
  );
};

export default ResponsiveImage;
