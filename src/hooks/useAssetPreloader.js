import { useEffect } from 'react';

/**
 * Custom hook to preload assets (images, 3D models, etc.) that will be needed soon
 * 
 * @param {array} assets - Array of asset URLs to preload
 * @param {string} type - Type of assets ('image', 'model', etc.)
 */
const useAssetPreloader = (assets = [], type = 'image') => {
  useEffect(() => {
    if (!assets || assets.length === 0) return;

    const preloadedAssets = [];

    const preloadAssets = async () => {
      if (type === 'image') {
        // Preload images
        assets.forEach(src => {
          const img = new Image();
          img.src = src;
          preloadedAssets.push(img);
        });
      } else if (type === 'model' || type === '3d') {
        // For 3D models, we'll fetch the files but not process them
        assets.forEach(async (modelUrl) => {
          try {
            const response = await fetch(modelUrl, { method: 'HEAD' });
            if (response.ok) {
              console.log(`Preloaded 3D model: ${modelUrl}`);
            }
          } catch (error) {
            console.warn(`Failed to preload model ${modelUrl}:`, error);
          }
        });
      } else if (type === 'font') {
        // Preload fonts
        assets.forEach(fontUrl => {
          const fontLink = document.createElement('link');
          fontLink.href = fontUrl;
          fontLink.rel = 'preload';
          fontLink.as = 'font';
          fontLink.crossOrigin = 'anonymous';
          document.head.appendChild(fontLink);
          preloadedAssets.push(fontLink);
        });
      }
    };

    preloadAssets();

    // Cleanup function
    return () => {
      preloadedAssets.forEach(asset => {
        if (asset instanceof HTMLLinkElement && asset.parentNode) {
          asset.parentNode.removeChild(asset);
        }
      });
    };
  }, [assets, type]);
};

export default useAssetPreloader;
