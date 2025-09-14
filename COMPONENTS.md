# VoicedNut Mini App Documentation

## Overview

The VoicedNut mini app has been enhanced with modern design, smooth animations, and a responsive interface that works seamlessly on both desktop and mobile devices. This document outlines the key components, styles, and best practices for maintaining and extending the application.

## Design System

### Theme Variables

The theme system uses CSS variables for consistent styling:

```css
/* Theme Colors */
--tg-theme-primary: #6366f1;
--tg-theme-secondary: #818cf8;
--tg-theme-accent: #4f46e5;

/* Spacing */
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;

/* Border Radius */
--radius-sm: 0.375rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
```

### Glassmorphism Effect

Use the `glass` utility class for frosted glass effects:

```tsx
<div className="card glass">{/* Content */}</div>
```

### Animations

Built-in animations are available via utility classes:

- `animate-in`: Fade and slide in animation
- `animate-up`: Slide up animation
- `hover-scale`: Scale on hover (desktop only)

## Components

### AsyncContent

A wrapper component for handling loading and error states:

```tsx
<AsyncContent
  isLoading={isLoading}
  error={error}
  data={data}
  loadingFallback={<LoadingSpinner />}
>
  {(data) => (
    // Render content
  )}
</AsyncContent>
```

### DataCard

A flexible card component for displaying statistics:

```tsx
<DataCard
  title="Total Calls"
  value="1,234"
  trend={{
    value: 15,
    isPositive: true,
  }}
  icon={<span>📞</span>}
/>
```

### Forms

Form elements use consistent styling classes:

```tsx
<form className="form glass">
  <div className="form-group">
    <label className="form-label">Label</label>
    <input className="form-input" />
  </div>
  <button className="form-button">Submit</button>
</form>
```

## Mobile Optimization

### Touch Targets

All interactive elements follow touch-friendly guidelines:

- Minimum touch target size: 44x44px
- Clear visual feedback on touch
- Proper spacing between elements

### Safe Areas

The layout automatically adapts to device safe areas:

```css
.page-container {
  padding-top: calc(var(--space-md) + var(--safe-area-inset-top));
  /* ... other safe area insets */
}
```

### Performance

Optimizations for mobile devices:

- Smooth scrolling with momentum
- Reduced motion support
- Touch-specific interactions
- System dark mode support

## Best Practices

1. **CSS Classes**

   - Use BEM naming convention
   - Prefer utility classes for common patterns
   - Keep component-specific styles scoped

2. **Component Structure**

   - Use TypeScript interfaces for props
   - Implement proper loading states
   - Handle errors gracefully
   - Support mobile interactions

3. **Navigation**

   - Use RouteNavigator for transitions
   - Implement proper auth checks
   - Handle loading states

4. **WebSocket Integration**
   - Use WebSocketProvider context
   - Handle reconnection gracefully
   - Show connection status

## Examples

### Basic Page Structure

```tsx
const MyPage: FC = () => (
  <div className="page-container">
    <h1 className="dashboard__title gradient-text">Page Title</h1>

    <div className="card glass animate-in">{/* Content */}</div>
  </div>
);
```

### Data Display

```tsx
const StatsSection: FC<{ data: Stats }> = ({ data }) => (
  <div className="dashboard__stats">
    <DataCard
      title="Metric"
      value={data.value}
      trend={data.trend}
      icon={<Icon />}
    />
  </div>
);
```

### Form Implementation

```tsx
const MyForm: FC = () => (
  <form className="form glass" onSubmit={handleSubmit}>
    <div className="form-group">
      <label className="form-label">Input</label>
      <input className="form-input" />
    </div>

    <button className="form-button" type="submit">
      Submit
    </button>
  </form>
);
```

## Future Enhancements

1. **Animation System**

   - Add more transition presets
   - Implement page transitions
   - Add micro-interactions

2. **Theme System**

   - Add more color schemes
   - Implement theme switching
   - Add custom theme support

3. **Component Library**
   - Create more reusable components
   - Add component documentation
   - Implement storybook
