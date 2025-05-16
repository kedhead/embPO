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

  // Return style tag content for print settings
  return `
    @page {
      size: auto;
      margin: 0.3in 0.5in 0.5in;
    }
    @media print {
      body { 
        margin: 0;
        padding-top: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html { 
        background-color: white !important;
      }
      .print-wrapper {
        padding-top: 0 !important;
      }
      
      /* Fix for image display in print */
      .print-logo {
        display: block !important;
        max-height: 60px !important;
        width: auto !important;
        margin: 0 auto !important;
      }
      
      /* Ensure text colors print correctly */
      .text-gray-900, .text-gray-800, .text-gray-700 {
        color: #000 !important;
      }
      
      /* Fix for displaying colored status badges in print */
      [class*="bg-amber-100"], [class*="bg-green-100"], [class*="bg-red-100"] {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;
};
