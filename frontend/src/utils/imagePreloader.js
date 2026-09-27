export const preloadImages = (imageUrls) => {
  if (!imageUrls || !Array.isArray(imageUrls)) return;
  
  imageUrls.forEach(url => {
    if (!url) return;
    const img = new Image();
    img.src = url;
  });
};
