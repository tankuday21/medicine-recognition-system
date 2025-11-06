# Mobile Development Quick Reference

## Quick Start for Mobile Components

### 1. Typography Classes (Use These!)
```tsx
// For main titles
<h1 className="text-mobile-h1">Large Heading</h1>

// For section titles  
<h2 className="text-mobile-h2">Section Title</h2>

// For subsections
<h3 className="text-mobile-h3">Subsection</h3>

// For body text
<p className="text-mobile-body">Body content</p>
```

### 2. Button Classes (Always Use!)
```tsx
// Primary button
<button className="btn-mobile-primary tap-target">
  Primary Action
</button>

// Secondary button
<button className="btn-mobile-secondary tap-target">
  Secondary Action
</button>

// Ghost button
<button className="btn-mobile-ghost tap-target">
  Ghost Action
</button>
```

### 3. Card/Container Classes
```tsx
// Mobile card
<div className="card-mobile space-mobile-y">
  <h3 className="text-mobile-h3">Title</h3>
  <p className="text-mobile-body">Content</p>
</div>

// Mobile container with safe area
<main className="mobile-safe-area px-mobile py-mobile">
  {/* Content */}
</main>
```

### 4. Spacing Utilities
```tsx
// For spacing between items vertically
<div className="space-mobile-y">
  {/* Items will have 3px → 4px → 6px spacing */}
</div>

// For gap between grid items
<div className="grid grid-cols-2 sm:grid-cols-3 gap-mobile">
  {/* Items */}
</div>

// For responsive padding
<div className="p-mobile">
  {/* Padding: 3px → 4px → 6px */}
</div>
```

### 5. Responsive Text/Images
```tsx
// Responsive text sizing
<p className="text-xs sm:text-sm md:text-base lg:text-lg">
  Text that scales with screen
</p>

// Image container (square on all screens)
<div className="image-container-mobile">
  <img src="..." alt="..." />
</div>

// Responsive grid for images
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
  {/* Images */}
</div>
```

### 6. Safe Area Handling (Important for Notches!)
```tsx
// For main containers
<main className="mobile-safe-area">
  {/* Handles notches and home indicators */}
</main>

// For footer
<footer className="mobile-safe-area-bottom">
  {/* Safe bottom padding */}
</footer>

// For headers
<header className="mobile-safe-area">
  {/* Safe all-around padding */}
</header>
```

### 7. Touch Feedback
```tsx
// Visual feedback on touch
<button className="touch-feedback">
  Interactive
</button>

// Subtle feedback
<div className="touch-feedback-subtle">
  Subtle interaction
</div>
```

## Common Responsive Patterns

### Full-Width Button
```tsx
<button className="btn-mobile-primary w-full sm:w-auto tap-target px-6 py-3">
  Action
</button>
```

### Stack Layout (Vertical on Mobile, Horizontal on Desktop)
```tsx
<div className="stack-mobile-horizontal">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Mobile Alert/Notification
```tsx
<div className="alert-mobile bg-blue-50 border border-blue-200 rounded-xl">
  <div className="flex items-start gap-3">
    <Icon className="flex-shrink-0" />
    <div className="flex-1">
      <h4 className="text-mobile-h3">Title</h4>
      <p className="text-mobile-body">Message</p>
    </div>
  </div>
</div>
```

### Responsive Grid
```tsx
// 2 columns on mobile, 3 on tablet, 4 on desktop
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-mobile">
  {/* Items */}
</div>

// Or use shorthand
<div className="grid-mobile">
  {/* Items */}
</div>
```

## Responsive Breakpoints Reference

```
Mobile:      320px - 374px  (xs, sm)
Tablet:      375px - 767px  (md, lg)  
Desktop:     768px - 1023px (xl)
Large:       1024px+        (2xl)
```

## DO's and DON'Ts

### ✅ DO's
- ✅ Use `text-mobile-*` classes for typography
- ✅ Use `tap-target` for buttons (minimum 48x48px)
- ✅ Use `px-mobile` for horizontal padding
- ✅ Use `gap-mobile` for responsive gaps
- ✅ Wrap main content with `mobile-safe-area`
- ✅ Use responsive font sizes (text-xs sm:text-sm md:text-base)
- ✅ Test at 375px width minimum
- ✅ Use `space-mobile-y` for vertical spacing
- ✅ Use `btn-mobile-*` classes for buttons

### ❌ DON'Ts
- ❌ Don't use fixed padding values on mobile (use px-mobile instead)
- ❌ Don't make buttons smaller than 44x44px on mobile
- ❌ Don't use hover-only states (won't work on touch)
- ❌ Don't set font size below 14px on mobile
- ❌ Don't forget `mobile-safe-area` on main containers
- ❌ Don't use gap values smaller than 3px (12px visual)
- ❌ Don't make touch targets too close together
- ❌ Don't ignore landscape orientation
- ❌ Don't forget responsive padding values

## Testing Checklist

- [ ] Test at 320px width (iPhone SE)
- [ ] Test at 375px width (iPhone)
- [ ] Test at 390px width (iPhone 14)
- [ ] Test at 430px width (iPhone 14 Pro Max)
- [ ] Test at 768px (iPad)
- [ ] Portrait and landscape orientations
- [ ] Touch interactions on actual device
- [ ] Scroll behavior smooth on mobile
- [ ] No horizontal scroll
- [ ] Safe area respected on notched devices
- [ ] Text readable at all sizes
- [ ] Buttons easy to tap
- [ ] Images load properly
- [ ] Performance acceptable

## Useful Shortcuts

### Responsive Text
```tsx
text-xs sm:text-sm md:text-base
text-sm sm:text-base md:text-lg
text-base sm:text-lg md:text-xl
```

### Responsive Padding
```tsx
px-3 sm:px-4 md:px-6
py-2 sm:py-3 md:py-4
p-3 sm:p-4 md:p-6
```

### Responsive Spacing
```tsx
gap-2 sm:gap-3 md:gap-4
space-y-2 sm:space-y-3 md:space-y-4
mb-2 sm:mb-3 md:mb-4
```

## Color Palette for Medical UI
```css
Primary:    #0ea5e9 (Sky Blue)
Secondary:  #64748b (Slate)
Success:    #10b981 (Emerald)
Warning:    #f59e0b (Amber)
Error:      #ef4444 (Red)
Medical:    #dc2626 (Red) for alerts
```

## Margin & Padding Sizes
```
Mobile:  12px (3)
Tablet:  16px (4)
Desktop: 24px (6)
Large:   32px (8)
```

## Font Sizes (Scaled)
```
Mobile → Tablet → Desktop → Large
11px → 12px → 14px → 16px  (xs)
12px → 14px → 16px → 18px  (sm)
14px → 16px → 18px → 20px  (base)
16px → 18px → 20px → 24px  (lg)
18px → 20px → 24px → 28px  (xl)
```

## Common Issues & Solutions

### Issue: Text too small on mobile
**Solution:** Use `text-mobile-body` or `text-xs sm:text-sm md:text-base`

### Issue: Buttons hard to tap
**Solution:** Add `tap-target` class and ensure min-height: 48px

### Issue: Content doesn't respect notch
**Solution:** Add `mobile-safe-area` to main container

### Issue: Horizontal scrolling
**Solution:** Check for `overflow-x: hidden` and responsive width

### Issue: Input zooms on iOS
**Solution:** Ensure `font-size: 16px` and `16px` line-height

### Issue: Gap too small on mobile
**Solution:** Use `gap-mobile` which scales responsively

---

**Last Updated**: 2024
**For Support**: Check MOBILE_RESPONSIVENESS_GUIDE.md