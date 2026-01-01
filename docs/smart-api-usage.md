# Smart API Usage - Product Updates

## Overview

The product detail page now intelligently detects what changed and calls the **minimum necessary API** instead of always doing full updates.

## Change Detection Logic

### 1. **Status Only** → `PATCH /api/v1/products/{id}/status`

**When:** Only product status changed (draft/active/inactive/archived)  
**Why:** Lightweight update, no need to send full product data  
**Example:**

```typescript
// User changes status from "draft" to "active"
productApi.updateProductStatus(productId, { status: "active" });
```

### 2. **Variants Changed** → `PUT /api/v1/products/{id}` (Full Update)

**When:** Any variant modified (added, updated, or deleted)  
**Why:** Variants require full product context  
**Includes:**

- General product info
- All images (general + variant-specific)
- All variants with full data
- Status and metadata

**Example:**

```typescript
// User adds new variant or modifies existing variant
productApi.updateProduct(productId, {
  name: "Product Name",
  description: "...",
  basePrice: 99.99,
  categoryId: "100",
  images: [...generalImages, ...variantImages],
  isActive: true,
  variants: [...]
})
```

### 3. **Media Only** → `PATCH /api/v1/products/{id}` (General Info Update)

**When:** Only images/thumbnail changed, no other fields modified  
**Why:** Partial update is sufficient  
**Example:**

```typescript
// User uploads new product images
productApi.updateProductInfo(productId, {
  name: "Product Name",
  description: "...",
  basePrice: 99.99,
  categoryId: "100",
  images: ["url1", "url2", "url3"],
});
```

### 4. **General Info** → `PATCH /api/v1/products/{id}` (General Info Update)

**When:** Name, description, price, or category changed (with or without media changes)  
**Why:** Partial update handles all general fields  
**Example:**

```typescript
// User updates product name and description
productApi.updateProductInfo(productId, {
  name: "Updated Product Name",
  description: "Updated description",
  basePrice: 89.99,
  categoryId: "100",
  images: [...]
})
```

## Change Detection Implementation

```typescript
const detectChanges = () => {
  if (!originalData) return { type: "none" };

  const changes = {
    status: productData.status !== originalData.status,
    generalInfo:
      productData.name !== originalData.name ||
      productData.description !== originalData.description ||
      productData.basePrice !== originalData.basePrice ||
      productData.categoryId !== originalData.categoryId,
    media:
      productData.thumbnail !== originalData.thumbnail ||
      JSON.stringify(productData.images) !==
        JSON.stringify(originalData.images),
    variants:
      JSON.stringify(productData.variants) !==
      JSON.stringify(originalData.variants),
  };

  // Priority: status > variants > media > generalInfo
  if (
    changes.status &&
    !changes.generalInfo &&
    !changes.media &&
    !changes.variants
  ) {
    return { type: "status" };
  }
  if (changes.variants) {
    return { type: "full" }; // Variants changed = full update
  }
  if (changes.media && !changes.generalInfo) {
    return { type: "media" }; // Only images changed
  }
  if (changes.generalInfo || changes.media) {
    return { type: "generalInfo" }; // General info or combined with media
  }

  return { type: "none" };
};
```

## Benefits

✅ **Performance:** Only sends necessary data  
✅ **Efficiency:** Reduces backend processing time  
✅ **Clarity:** Logs show which endpoint was called and why  
✅ **User Feedback:** Toast messages indicate the type of update  
✅ **Data Integrity:** Updates originalData baseline after successful save

## Console Logging

The system logs which API endpoint is being called:

```
=== SMART SAVE DETECTION ===
Change type detected: status
============================
📍 Calling STATUS update endpoint
```

```
=== SMART SAVE DETECTION ===
Change type detected: full
============================
📍 Calling FULL update endpoint (variants changed)
```

```
=== SMART SAVE DETECTION ===
Change type detected: media
============================
📍 Calling GENERAL INFO update endpoint (media)
```

## Priority Order

1. **Status-only** (highest priority - most specific)
2. **Variants** (requires full update)
3. **Media-only** (partial update)
4. **General Info** (partial update, default for mixed changes)

## Edge Cases

- **No changes:** Shows info toast "No changes to save"
- **Multiple fields:** Uses the highest priority change type
- **After save:** Updates `originalData` to new baseline for next comparison
- **Variant images:** Included in variant-specific ProductImage objects with type=VARIANT, key=color
