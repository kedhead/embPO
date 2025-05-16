export const setupPrintSettings = (): string => {
  // Try to modify print settings using browser APIs
  if (window.matchMedia) {
    const mediaQueryList = window.matchMedia('print');
    mediaQueryList.addEventListener('change', (mql) => {
      if (mql.matches) {
        // Just before printing
        document.title = ''; // Remove the title that shows in header
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
      }
      html { 
        background-color: white;
      }
      .print-wrapper {
        padding-top: 0 !important;
      }
    }
  `;
};
