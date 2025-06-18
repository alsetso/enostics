# 🎨 Homepage Background Guide

## Quick Background Updates

To change the homepage background, simply edit `src/config/homepage.ts`:

### For Videos
```typescript
export const homepageConfig = {
  background: {
    type: 'video',
    path: '/videos/your-video.mp4',  // ← Change this path
    opacity: 80,
    className: 'object-cover'
  }
}
```

### For Images
```typescript
export const homepageConfig = {
  background: {
    type: 'image',
    path: '/images/your-image.jpg',  // ← Change this path
    opacity: 80,
    className: 'bg-cover bg-center bg-no-repeat'
  }
}
```

### No Background
```typescript
export const homepageConfig = {
  background: {
    type: 'none',
    path: '',
    opacity: 0
  }
}
```

## File Locations

- Put videos in: `public/videos/`
- Put images in: `public/images/` or `public/`
- Reference them with: `/videos/filename.mp4` or `/images/filename.jpg`

## Current Setup

✅ **Currently using**: Video background  
📁 **File**: `/videos/Set-up your endpoint..mp4`  
🎛️ **Opacity**: 80%  
🔄 **Auto-play**: Yes, muted, looping

## Quick Presets

The config file includes presets you can quickly switch to:

```typescript
// Use a preset by copying its values to homepageConfig.background
import { backgroundPresets } from '@/config/homepage'

// Available presets:
// - backgroundPresets.originalImage
// - backgroundPresets.endpointVideo  
// - backgroundPresets.noBackground
```

## Examples

**Switch to original image:**
```typescript
path: '/background.png'
type: 'image'
```

**Use a new video:**
1. Add video to `public/videos/my-video.mp4`
2. Update config: `path: '/videos/my-video.mp4'`

**Adjust opacity:**
```typescript
opacity: 60  // Makes background more transparent
```

That's it! The homepage will automatically use your new background. 🎉 