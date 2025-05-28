export const setupPrintSettings = (): string => {
  // Try to modify print settings using browser APIs
  if (window.matchMedia) {
    const mediaQueryList = window.matchMedia('print');
    mediaQueryList.addEventListener('change', (mql) => {
      if (mql.matches) {
        // Just before printing
        document.title = ''; // Remove the title that shows in header
        
        // Make sure images are loaded before printing
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          if (!img.complete) {
            console.log('Waiting for image to load:', img.src);
            img.addEventListener('load', () => console.log('Image loaded:', img.src));
            img.addEventListener('error', () => console.log('Image failed to load:', img.src));
          }
        });
      }
    });
  }

  // Return an empty string as styles are now fully in print.css
  return ""; 
};
