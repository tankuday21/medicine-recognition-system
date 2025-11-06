# Developer Quick Start - Mobile-First Development

## 🚀 Getting Started with Mobile Components

### Copy-Paste Component Templates

#### Template 1: Basic Mobile Container
```tsx
export const MyComponent: React.FC = () => {
  return (
    <main className="mobile-safe-area px-mobile py-mobile">
      <h1 className="text-mobile-h1">Title</h1>
      <p className="text-mobile-body">Description text</p>
    </main>
  );
};
```

#### Template 2: Mobile Card Component
```tsx
export const MyCard: React.FC = () => {
  return (
    <div className="card-mobile space-mobile-y">
      <h3 className="text-mobile-h3">Card Title</h3>
      <p className="text-mobile-body">Card content</p>
      <button className="btn-mobile-primary tap-target">
        Action
      </button>
    </div>
  );
};
```

#### Template 3: Mobile Form
```tsx
export const MyForm: React.FC = () => {
  return (
    <form className="space-mobile-y">
      <div>
        <label className="text-mobile-body font-medium mb-2 block">
          Field Label
        </label>
        <input
          type="text"
          className="mobile-input w-full"
          placeholder="Enter text..."
        />
      </div>
      <button type="submit" className="btn-mobile-primary w-full tap-target">
        Submit
      </button>
    </form>
  );
};
```

#### Template 4: Mobile Grid
```tsx
export const MyGrid: React.FC = () => {
  const items = [1, 2, 3, 4, 5, 6];
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-mobile">
      {items.map(item => (
        <div key={item} className="card-mobile">
          <p className="text-mobile-body">Item {item}</p>
        </div>
      ))}
    </div>
  );
};
```

#### Template 5: Mobile List
```tsx
export const MyList: React.FC = () => {
  const items = ['Item 1', 'Item 2', 'Item 3'];
  
  return (
    <div className="space-mobile-y">
      {items.map((item, index) => (
        <div key={index} className="list-item-mobile">
          <span className="text-mobile-body">{item}</span>
        </div>
      ))}
    </div>
  );
};
```

#### Template 6: Mobile Alert
```tsx
export const MyAlert: React.FC = () => {
  return (
    <div className="alert-mobile bg-blue-50 border border-blue-200 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-mobile-h3">Alert Title</h4>
          <p className="text-mobile-body">Alert message</p>
        </div>
      </div>
    </div>
  );
};
```

#### Template 7: Mobile Button Group
```tsx
export const MyButtonGroup: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-mobile">
      <button className="btn-mobile-primary flex-1 tap-target">
        Primary
      </button>
      <button className="btn-mobile-secondary flex-1 tap-target">
        Secondary
      </button>
    </div>
  );
};
```

#### Template 8: Mobile Modal
```tsx
interface MyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyModal: React.FC<MyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-mobile">
      <div className="modal-mobile-content">
        <div className="p-mobile space-mobile-y">
          <h2 className="text-mobile-h2">Modal Title</h2>
          <p className="text-mobile-body">Modal content</p>
          <button 
            onClick={onClose}
            className="btn-mobile-primary w-full tap-target"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
```

## 📝 Step-by-Step Development Process

### Step 1: Planning
```
[ ] What is the component's purpose?
[ ] What breakpoints do I need?
[ ] Should it be full-width?
[ ] Does it need safe area handling?
[ ] Are there touch interactions?
```

### Step 2: Structure (Mobile-First)
```
[ ] Start with mobile layout (320px)
[ ] Add small phone optimizations (375px)
[ ] Plan tablet view (768px)
[ ] Plan desktop view (1024px+)
```

### Step 3: Implementation
```
[ ] Use mobile-first utilities
[ ] Apply responsive padding: px-mobile, p-mobile
[ ] Use responsive typography: text-mobile-*
[ ] Ensure proper touch targets (48x48px min)
[ ] Add safe area to main containers
```

### Step 4: Testing
```
[ ] Test at 375px (minimum)
[ ] Test at 768px (tablet)
[ ] Test at 1920px (desktop)
[ ] Test portrait and landscape
[ ] Test touch interactions
[ ] Check screen reader
```

## 🎯 Common Patterns

### Pattern 1: Responsive Hero Section
```tsx
<section className="mobile-safe-area px-mobile py-mobile space-mobile-y">
  <h1 className="text-mobile-h1 text-center">Main Title</h1>
  <p className="text-mobile-body text-center">Subtitle</p>
</section>
```

### Pattern 2: Two-Column Mobile → Desktop
```tsx
<div className="flex flex-col sm:flex-row gap-mobile">
  <div className="flex-1">Left column</div>
  <div className="flex-1">Right column</div>
</div>
```

### Pattern 3: Image + Text Mobile Layout
```tsx
<div className="space-mobile-y">
  <div className="image-container-mobile">
    <img src="..." alt="..." />
  </div>
  <h3 className="text-mobile-h3">Title</h3>
  <p className="text-mobile-body">Description</p>
</div>
```

### Pattern 4: Responsive Tab Navigation
```tsx
<nav className="flex flex-wrap gap-mobile">
  <button className="btn-mobile-secondary tap-target">Tab 1</button>
  <button className="btn-mobile-secondary tap-target">Tab 2</button>
  <button className="btn-mobile-secondary tap-target">Tab 3</button>
</nav>
```

### Pattern 5: Mobile-Friendly Table
```tsx
<div className="overflow-x-auto scrollable-safe">
  <table className="w-full text-mobile-body">
    {/* Table content */}
  </table>
</div>
```

## ✅ Checklist Before Committing

- [ ] Component works on 375px
- [ ] Component works on 768px
- [ ] Component works on 1920px
- [ ] Uses `text-mobile-*` for typography
- [ ] Uses `p-mobile` for padding
- [ ] Uses `gap-mobile` for spacing
- [ ] Buttons are 48x48px minimum
- [ ] Has proper touch feedback
- [ ] Safe area handled on main container
- [ ] Images are responsive
- [ ] Forms have 16px input font size
- [ ] No horizontal scrolling
- [ ] Focus states visible
- [ ] Tested on real device

## 🔍 Debugging Tips

### Issue: Text too small
**Solution**: Use `text-mobile-body` or explicitly set `text-xs sm:text-sm`

### Issue: Spacing too tight
**Solution**: Replace `gap-*` with `gap-mobile`

### Issue: Buttons hard to tap
**Solution**: Add `tap-target` class

### Issue: Content behind notch
**Solution**: Add `mobile-safe-area` to main container

### Issue: Input zooms on iOS
**Solution**: Ensure `font-size: 16px` on input

### Issue: Grid breaks on mobile
**Solution**: Use `grid-mobile` or `grid-cols-2 sm:grid-cols-3`

### Issue: Footer not at bottom
**Solution**: Add `mobile-safe-area-bottom` to footer

## 📚 Quick Reference Sizes

### Font Sizes
```
Body text:     14px (mobile) → 16px (tablet/desktop)
Subheading:    16px (mobile) → 18px (desktop)
Heading:       18px (mobile) → 20px (desktop)
Title:         20px (mobile) → 24px (desktop)
```

### Spacing
```
Mobile:  12px  (3 * 4px)
Tablet:  16px  (4 * 4px)
Desktop: 24px  (6 * 4px)
```

### Touch Targets
```
Minimum: 44px  (iOS standard)
Recommended: 48px
Large: 56px
Spacing between: 8px minimum
```

### Breakpoints
```
Mobile Start:    320px
Small Phone:     375px
Large Phone:     414px
Tablet Start:    768px
Desktop Start:   1024px
Large Desktop:   1280px+
```

## 🎨 Using Utility Classes

### Stacking Components Vertically
```tsx
// Automatic responsive spacing (12px mobile → 24px desktop)
<div className="space-mobile-y">
  <Component1 />
  <Component2 />
  <Component3 />
</div>
```

### Grid Layouts
```tsx
// 2 cols mobile, 3 cols tablet, 4 cols desktop
<div className="grid-mobile lg:grid-cols-4">
  {items.map(item => <Item key={item.id} />)}
</div>
```

### Full-Width Buttons
```tsx
// Full width on mobile, auto on desktop
<button className="btn-mobile-primary w-full sm:w-auto">
  Action
</button>
```

### Safe Area Handling
```tsx
// All sides safe area
<main className="mobile-safe-area">
  Content
</main>

// Just bottom (for footers)
<footer className="mobile-safe-area-bottom">
  Footer
</footer>
```

## 🚀 Performance Tips

1. **Use `px-mobile` instead of `px-4`** - Scales responsively
2. **Use `gap-mobile` instead of `gap-4`** - Responsive spacing
3. **Use `text-mobile-*` for typography** - Consistent scaling
4. **Group related utilities** - Better readability
5. **Lazy load images** - Better performance
6. **Use responsive images** - Smaller file sizes

## 📞 Need Help?

- **General Questions**: Check `MOBILE_QUICK_REFERENCE.md`
- **Implementation Details**: See `MOBILE_RESPONSIVENESS_GUIDE.md`
- **Testing**: Read `MOBILE_TESTING_GUIDE.md`
- **All Changes**: Review `MOBILE_IMPLEMENTATION_SUMMARY.md`

## 🎓 Learning Path

1. **Start Here**: Read this file
2. **Quick Reference**: Study `MOBILE_QUICK_REFERENCE.md`
3. **Create Components**: Use templates above
4. **Test Components**: Follow `MOBILE_TESTING_GUIDE.md`
5. **Advanced**: Read `MOBILE_RESPONSIVENESS_GUIDE.md`

## 💡 Best Practices Summary

- ✅ Mobile-first design
- ✅ Touch-friendly sizes
- ✅ Responsive typography
- ✅ Proper spacing
- ✅ Safe area handling
- ✅ Visual feedback
- ✅ Keyboard support
- ✅ Screen reader friendly
- ✅ Test on real devices
- ✅ Document decisions

---

**Ready to build?** Start with Template 1 above and adapt it to your needs!

**Questions?** Check the documentation files or review completed components (Header, MultiImageUpload, App).

**Success!** If you follow these patterns, your mobile components will be professional and consistent across the app.