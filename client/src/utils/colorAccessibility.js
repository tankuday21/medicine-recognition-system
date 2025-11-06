// Color Accessibility Utilities
// Utilities for checking and improving color accessibility

/**
 * Calculate relative luminance of a color
 * @param {string} color - Hex color string
 * @returns {number} Relative luminance value
 */
export const getRelativeLuminance = (color) => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const sRGB = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
};

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} Contrast ratio
 */
export const getContrastRatio = (color1, color2) => {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if color combination meets WCAG accessibility standards
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {string} level - WCAG level ('AA' or 'AAA')
 * @param {string} size - Text size ('normal' or 'large')
 * @returns {boolean} Whether the combination meets standards
 */
export const meetsWCAGStandards = (foreground, background, level = 'AA', size = 'normal') => {
  const ratio = getContrastRatio(foreground, background);
  
  const thresholds = {
    'AA': {
      normal: 4.5,
      large: 3
    },
    'AAA': {
      normal: 7,
      large: 4.5
    }
  };
  
  return ratio >= thresholds[level][size];
};

/**
 * Get accessible color suggestions
 * @param {string} baseColor - Base color to work with
 * @param {string} background - Background color
 * @returns {object} Suggested accessible colors
 */
export const getAccessibleColorSuggestions = (baseColor, background = '#ffffff') => {
  const suggestions = {
    lighter: [],
    darker: []
  };
  
  // Generate lighter variations
  for (let i = 10; i <= 90; i += 10) {
    const lightColor = lightenColor(baseColor, i);
    if (meetsWCAGStandards(lightColor, background)) {
      suggestions.lighter.push({
        color: lightColor,
        ratio: getContrastRatio(lightColor, background)
      });
    }
  }
  
  // Generate darker variations
  for (let i = 10; i <= 90; i += 10) {
    const darkColor = darkenColor(baseColor, i);
    if (meetsWCAGStandards(darkColor, background)) {
      suggestions.darker.push({
        color: darkColor,
        ratio: getContrastRatio(darkColor, background)
      });
    }
  }
  
  return suggestions;
};

/**
 * Lighten a color by a percentage
 * @param {string} color - Hex color
 * @param {number} percent - Percentage to lighten
 * @returns {string} Lightened color
 */
export const lightenColor = (color, percent) => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

/**
 * Darken a color by a percentage
 * @param {string} color - Hex color
 * @param {number} percent - Percentage to darken
 * @returns {string} Darkened color
 */
export const darkenColor = (color, percent) => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  
  return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
    (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
    (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
};

export default {
  getRelativeLuminance,
  getContrastRatio,
  meetsWCAGStandards,
  getAccessibleColorSuggestions,
  lightenColor,
  darkenColor
};