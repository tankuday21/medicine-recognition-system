// RTL (Right-to-Left) language support utilities

export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const isRTLLanguage = (languageCode) => {
  return RTL_LANGUAGES.includes(languageCode);
};

export const getDirectionClass = (languageCode) => {
  return isRTLLanguage(languageCode) ? 'rtl' : 'ltr';
};

export const getTextAlignClass = (languageCode, defaultAlign = 'left') => {
  if (isRTLLanguage(languageCode)) {
    switch (defaultAlign) {
      case 'left':
        return 'text-right';
      case 'right':
        return 'text-left';
      default:
        return `text-${defaultAlign}`;
    }
  }
  return `text-${defaultAlign}`;
};

export const getFlexDirectionClass = (languageCode, reverse = false) => {
  const isRTL = isRTLLanguage(languageCode);
  
  if (reverse) {
    return isRTL ? 'flex-row' : 'flex-row-reverse';
  }
  
  return isRTL ? 'flex-row-reverse' : 'flex-row';
};

export const getMarginClass = (languageCode, side, size) => {
  const isRTL = isRTLLanguage(languageCode);
  
  if (side === 'left') {
    return isRTL ? `mr-${size}` : `ml-${size}`;
  } else if (side === 'right') {
    return isRTL ? `ml-${size}` : `mr-${size}`;
  }
  
  return `m${side[0]}-${size}`;
};

export const getPaddingClass = (languageCode, side, size) => {
  const isRTL = isRTLLanguage(languageCode);
  
  if (side === 'left') {
    return isRTL ? `pr-${size}` : `pl-${size}`;
  } else if (side === 'right') {
    return isRTL ? `pl-${size}` : `pr-${size}`;
  }
  
  return `p${side[0]}-${size}`;
};

export const getBorderClass = (languageCode, side, width = '1') => {
  const isRTL = isRTLLanguage(languageCode);
  
  if (side === 'left') {
    return isRTL ? `border-r-${width}` : `border-l-${width}`;
  } else if (side === 'right') {
    return isRTL ? `border-l-${width}` : `border-r-${width}`;
  }
  
  return `border-${side[0]}-${width}`;
};

export const getRoundedClass = (languageCode, corners) => {
  const isRTL = isRTLLanguage(languageCode);
  
  if (corners.includes('left')) {
    const newCorners = corners.replace('left', isRTL ? 'right' : 'left');
    return `rounded-${newCorners}`;
  } else if (corners.includes('right')) {
    const newCorners = corners.replace('right', isRTL ? 'left' : 'right');
    return `rounded-${newCorners}`;
  }
  
  return `rounded-${corners}`;
};

// CSS-in-JS style helpers for RTL
export const rtlStyle = (languageCode, ltrStyles, rtlStyles = {}) => {
  const isRTL = isRTLLanguage(languageCode);
  
  if (isRTL) {
    return { ...ltrStyles, ...rtlStyles };
  }
  
  return ltrStyles;
};

// Transform CSS properties for RTL
export const transformStylesForRTL = (languageCode, styles) => {
  if (!isRTLLanguage(languageCode)) {
    return styles;
  }
  
  const transformedStyles = { ...styles };
  
  // Transform margin and padding
  if (styles.marginLeft !== undefined) {
    transformedStyles.marginRight = styles.marginLeft;
    delete transformedStyles.marginLeft;
  }
  if (styles.marginRight !== undefined) {
    transformedStyles.marginLeft = styles.marginRight;
    delete transformedStyles.marginRight;
  }
  if (styles.paddingLeft !== undefined) {
    transformedStyles.paddingRight = styles.paddingLeft;
    delete transformedStyles.paddingLeft;
  }
  if (styles.paddingRight !== undefined) {
    transformedStyles.paddingLeft = styles.paddingRight;
    delete transformedStyles.paddingRight;
  }
  
  // Transform border
  if (styles.borderLeft !== undefined) {
    transformedStyles.borderRight = styles.borderLeft;
    delete transformedStyles.borderLeft;
  }
  if (styles.borderRight !== undefined) {
    transformedStyles.borderLeft = styles.borderRight;
    delete transformedStyles.borderRight;
  }
  
  // Transform positioning
  if (styles.left !== undefined) {
    transformedStyles.right = styles.left;
    delete transformedStyles.left;
  }
  if (styles.right !== undefined) {
    transformedStyles.left = styles.right;
    delete transformedStyles.right;
  }
  
  // Transform text alignment
  if (styles.textAlign === 'left') {
    transformedStyles.textAlign = 'right';
  } else if (styles.textAlign === 'right') {
    transformedStyles.textAlign = 'left';
  }
  
  // Transform flex direction
  if (styles.flexDirection === 'row') {
    transformedStyles.flexDirection = 'row-reverse';
  } else if (styles.flexDirection === 'row-reverse') {
    transformedStyles.flexDirection = 'row';
  }
  
  return transformedStyles;
};

// Direction-aware class names
export const directionAwareClass = (languageCode, baseClass, rtlClass) => {
  return isRTLLanguage(languageCode) ? rtlClass : baseClass;
};

export default {
  RTL_LANGUAGES,
  isRTLLanguage,
  getDirectionClass,
  getTextAlignClass,
  getFlexDirectionClass,
  getMarginClass,
  getPaddingClass,
  getBorderClass,
  getRoundedClass,
  rtlStyle,
  transformStylesForRTL,
  directionAwareClass
};