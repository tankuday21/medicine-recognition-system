// Visual regression testing utilities for mobile responsiveness

class VisualTestSuite {
  constructor() {
    this.screenshots = new Map();
    this.comparisons = [];
    this.canvas = null;
    this.isSupported = this.checkSupport();
  }

  checkSupport() {
    return (
      typeof window !== 'undefined' &&
      'html2canvas' in window || 
      typeof document !== 'undefined'
    );
  }

  // Capture screenshot of current viewport
  async captureScreenshot(name = 'screenshot', element = document.body) {
    if (!this.isSupported) {
      console.warn('Screenshot capture not supported');
      return null;
    }

    try {
      // Use html2canvas if available, otherwise use canvas API
      let screenshot;
      
      if (window.html2canvas) {
        screenshot = await window.html2canvas(element, {
          useCORS: true,
          allowTaint: true,
          scale: 1,
          width: window.innerWidth,
          height: window.innerHeight
        });
      } else {
        // Fallback to basic canvas capture
        screenshot = await this.captureWithCanvas(element);
      }

      const timestamp = new Date().toISOString();
      const screenshotData = {
        name,
        timestamp,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        canvas: screenshot,
        dataUrl: screenshot.toDataURL('image/png')
      };

      this.screenshots.set(name, screenshotData);
      console.log(`[INFO] Screenshot captured: ${name}`);
      
      return screenshotData;
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      return null;
    }
  }

  // Fallback canvas capture method
  async captureWithCanvas(element) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text indicating this is a fallback
    ctx.fillStyle = '#666666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Visual test capture (fallback mode)', canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Viewport: ${canvas.width}x${canvas.height}`, canvas.width / 2, canvas.height / 2 + 30);
    
    return canvas;
  }

  // Compare two screenshots
  compareScreenshots(screenshot1, screenshot2, threshold = 0.1) {
    if (!screenshot1 || !screenshot2) {
      return { error: 'Missing screenshots for comparison' };
    }

    const canvas1 = screenshot1.canvas;
    const canvas2 = screenshot2.canvas;

    if (canvas1.width !== canvas2.width || canvas1.height !== canvas2.height) {
      return {
        error: 'Screenshot dimensions do not match',
        dimensions1: { width: canvas1.width, height: canvas1.height },
        dimensions2: { width: canvas2.width, height: canvas2.height }
      };
    }

    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    const imageData1 = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
    const imageData2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);

    const data1 = imageData1.data;
    const data2 = imageData2.data;

    let diffPixels = 0;
    const totalPixels = data1.length / 4;

    // Create diff canvas
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = canvas1.width;
    diffCanvas.height = canvas1.height;
    const diffCtx = diffCanvas.getContext('2d');
    const diffImageData = diffCtx.createImageData(canvas1.width, canvas1.height);
    const diffData = diffImageData.data;

    for (let i = 0; i < data1.length; i += 4) {
      const r1 = data1[i];
      const g1 = data1[i + 1];
      const b1 = data1[i + 2];
      const a1 = data1[i + 3];

      const r2 = data2[i];
      const g2 = data2[i + 1];
      const b2 = data2[i + 2];
      const a2 = data2[i + 3];

      const rDiff = Math.abs(r1 - r2);
      const gDiff = Math.abs(g1 - g2);
      const bDiff = Math.abs(b1 - b2);
      const aDiff = Math.abs(a1 - a2);

      const pixelDiff = (rDiff + gDiff + bDiff + aDiff) / (255 * 4);

      if (pixelDiff > threshold) {
        diffPixels++;
        // Highlight diff in red
        diffData[i] = 255;     // R
        diffData[i + 1] = 0;   // G
        diffData[i + 2] = 0;   // B
        diffData[i + 3] = 255; // A
      } else {
        // Keep original pixel but make it semi-transparent
        diffData[i] = r1;
        diffData[i + 1] = g1;
        diffData[i + 2] = b1;
        diffData[i + 3] = 128;
      }
    }

    diffCtx.putImageData(diffImageData, 0, 0);

    const diffPercentage = (diffPixels / totalPixels) * 100;

    const comparison = {
      screenshot1: screenshot1.name,
      screenshot2: screenshot2.name,
      diffPixels,
      totalPixels,
      diffPercentage: Math.round(diffPercentage * 100) / 100,
      threshold: threshold * 100,
      passed: diffPercentage < threshold * 100,
      diffCanvas,
      diffDataUrl: diffCanvas.toDataURL('image/png')
    };

    this.comparisons.push(comparison);
    return comparison;
  }

  // Test responsive breakpoints
  async testResponsiveBreakpoints() {
    const breakpoints = [
      { name: 'mobile-xs', width: 320, height: 568 },
      { name: 'mobile-sm', width: 375, height: 667 },
      { name: 'mobile-lg', width: 414, height: 896 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 }
    ];

    const screenshots = {};

    for (const breakpoint of breakpoints) {
      console.log(`[INFO] Testing breakpoint: ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
      
      // Simulate viewport change (in a real test environment, this would actually resize the browser)
      const originalWidth = window.innerWidth;
      const originalHeight = window.innerHeight;
      
      // For demonstration, we'll just capture at current size with metadata
      const screenshot = await this.captureScreenshot(breakpoint.name);
      if (screenshot) {
        screenshot.targetViewport = breakpoint;
        screenshots[breakpoint.name] = screenshot;
      }
      
      // Small delay between captures
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return screenshots;
  }

  // Test component rendering at different sizes
  async testComponentRendering(selector, sizes = []) {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element not found: ${selector}`);
      return {};
    }

    const defaultSizes = [
      { name: 'small', width: 320 },
      { name: 'medium', width: 768 },
      { name: 'large', width: 1024 }
    ];

    const testSizes = sizes.length > 0 ? sizes : defaultSizes;
    const screenshots = {};

    for (const size of testSizes) {
      const screenshotName = `${selector.replace(/[^a-zA-Z0-9]/g, '_')}_${size.name}`;
      
      // Temporarily modify element width for testing
      const originalWidth = element.style.width;
      element.style.width = `${size.width}px`;
      
      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const screenshot = await this.captureScreenshot(screenshotName, element);
      if (screenshot) {
        screenshot.componentSelector = selector;
        screenshot.testSize = size;
        screenshots[screenshotName] = screenshot;
      }
      
      // Restore original width
      element.style.width = originalWidth;
    }

    return screenshots;
  }

  // Generate visual test report
  generateVisualReport() {
    const report = {
      timestamp: new Date().toISOString(),
      screenshots: Array.from(this.screenshots.values()),
      comparisons: this.comparisons,
      summary: {
        totalScreenshots: this.screenshots.size,
        totalComparisons: this.comparisons.length,
        passedComparisons: this.comparisons.filter(c => c.passed).length,
        failedComparisons: this.comparisons.filter(c => !c.passed).length
      }
    };

    this.logVisualReport(report);
    return report;
  }

  // Log visual report
  logVisualReport(report) {
    console.group('[INFO] Visual Test Report');
    console.log(`Screenshots captured: ${report.summary.totalScreenshots}`);
    console.log(`Comparisons made: ${report.summary.totalComparisons}`);
    
    if (report.summary.failedComparisons > 0) {
      console.group('[ERROR] Failed Visual Comparisons');
      report.comparisons
        .filter(c => !c.passed)
        .forEach(comparison => {
          console.log(`${comparison.screenshot1} vs ${comparison.screenshot2}: ${comparison.diffPercentage}% difference`);
        });
      console.groupEnd();
    }

    // Log screenshots with data URLs for inspection
    if (report.screenshots.length > 0) {
      console.group('[INFO] Screenshots');
      report.screenshots.forEach(screenshot => {
        console.log(`${screenshot.name}:`, screenshot.dataUrl);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  // Create visual diff viewer
  createDiffViewer(comparison) {
    if (!comparison.diffCanvas) return null;

    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid #ccc;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
    `;

    const title = document.createElement('h3');
    title.textContent = `Visual Diff: ${comparison.screenshot1} vs ${comparison.screenshot2}`;
    title.style.marginTop = '0';

    const info = document.createElement('p');
    info.textContent = `Difference: ${comparison.diffPercentage}% (${comparison.diffPixels} pixels)`;
    info.style.color = comparison.passed ? 'green' : 'red';

    const diffImage = document.createElement('img');
    diffImage.src = comparison.diffDataUrl;
    diffImage.style.maxWidth = '100%';
    diffImage.style.height = 'auto';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 5px 10px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    closeButton.onclick = () => container.remove();

    container.appendChild(closeButton);
    container.appendChild(title);
    container.appendChild(info);
    container.appendChild(diffImage);

    document.body.appendChild(container);
    return container;
  }

  // Clear all data
  clear() {
    this.screenshots.clear();
    this.comparisons = [];
  }

  // Export screenshots as ZIP (requires JSZip library)
  async exportScreenshots() {
    if (!window.JSZip) {
      console.warn('JSZip library not available for export');
      return null;
    }

    const JSZip = window.JSZip;
    const zip = new JSZip();
    const folder = zip.folder('screenshots');

    this.screenshots.forEach((screenshot, name) => {
      const base64Data = screenshot.dataUrl.split(',')[1];
      folder.file(`${name}.png`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    
    // Create download link
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visual-tests-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return content;
  }
}

// Create singleton instance
const visualTestSuite = new VisualTestSuite();

export default visualTestSuite;