# Search Autocomplete & Highlighting Feature

## Overview

This document describes the implementation of the search autocomplete and text highlighting features for the product search functionality in the Online Shop application.

## Features Implemented

### 1. Search Autocomplete Component

**File**: `src/components/Products/SearchAutocomplete.tsx`

A sophisticated autocomplete component that provides real-time product suggestions as users type their search queries.

#### Key Features:

- **Debounced Search**: 300ms debounce delay to minimize API calls
- **Real-time Suggestions**: Displays up to 8 product suggestions
- **Keyboard Navigation**: Support for arrow keys, Enter, and Escape
- **Loading Indicator**: Shows spinner while fetching results
- **Product Preview**: Displays product image, name, description, price, and stock status
- **Text Highlighting**: Highlights matching search terms in suggestions
- **Click Outside Detection**: Closes suggestions when clicking outside
- **No Results Message**: User-friendly message when no products match

#### Props:

```typescript
interface SearchAutocompleteProps {
  value: string; // Current search value
  onChange: (value: string) => void; // Called when input changes
  onSelectProduct?: (product: Product) => void; // Called when product is selected
  placeholder?: string; // Input placeholder text
  className?: string; // Additional CSS classes
}
```

#### Usage Example:

```tsx
import { SearchAutocomplete } from "@/components/Products/SearchAutocomplete";

<SearchAutocomplete
  value={searchQuery}
  onChange={setSearchQuery}
  onSelectProduct={(product) => navigate(`/products/${product._id}`)}
  placeholder="Search for products..."
/>;
```

### 2. Highlight Text Component

**File**: `src/components/common/HighlightText.tsx`

A utility component that highlights matching text within a string, used for displaying search results with emphasized query terms.

#### Key Features:

- **Case-Insensitive Matching**: Finds matches regardless of case
- **Multiple Matches**: Highlights all occurrences of the search term
- **Special Character Handling**: Properly escapes regex special characters
- **Customizable Styling**: Applies yellow highlight with bold text

#### Props:

```typescript
interface HighlightTextProps {
  text: string; // The text to display
  highlight: string; // The term to highlight
  className?: string; // Additional CSS classes
}
```

#### Usage Example:

```tsx
import { HighlightText } from "@/components/common/HighlightText";

<HighlightText text="Wireless Bluetooth Headphones" highlight="bluetooth" />;
// Renders: Wireless <mark>Bluetooth</mark> Headphones
```

### 3. Enhanced Product Card

**File**: `src/components/Products/ProductCard.tsx`

Updated ProductCard component to support text highlighting in search results.

#### New Props:

- `searchQuery?: string` - The current search query to highlight

#### Updated Fields with Highlighting:

- Product name
- Brand name
- Tags

### 4. Enhanced Product List

**File**: `src/components/Products/ProductList.tsx`

Updated ProductList component to pass search query to individual product cards.

#### New Props:

- `searchQuery?: string` - The current search query to pass to cards

### 5. Enhanced Product Filters

**File**: `src/components/Products/ProductFilters.tsx`

Updated ProductFilters to use the new SearchAutocomplete component instead of a basic input field.

#### Features:

- Integrated autocomplete in filter sidebar
- Navigation to product detail page on suggestion selection
- Maintains existing filter functionality

### 6. Search Bar Component

**File**: `src/components/Layout/SearchBar.tsx`

A standalone search bar component that can be used in the header or other locations.

#### Features:

- Form submission support
- Automatic navigation to products page with search query
- Product suggestion support

## Technical Implementation

### Debouncing Strategy

The autocomplete uses a debounced search to prevent excessive API calls:

```typescript
const debouncedSearch = useCallback((searchQuery: string) => {
  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current);
  }

  debounceTimerRef.current = setTimeout(async () => {
    // Fetch suggestions
  }, 300); // 300ms delay
}, []);
```

### Text Highlighting Algorithm

The highlighting uses regex to split text and mark matching portions:

```typescript
const regex = new RegExp(`(${escapedHighlight})`, 'gi');
const parts = text.split(regex);

return parts.map((part, index) =>
  regex.test(part) ? (
    <mark key={index}>{part}</mark>
  ) : (
    <span key={index}>{part}</span>
  )
);
```

### Keyboard Navigation

The component supports full keyboard navigation:

- **Arrow Down**: Move to next suggestion
- **Arrow Up**: Move to previous suggestion
- **Enter**: Select current suggestion
- **Escape**: Close suggestions dropdown

## Styling

### Autocomplete Dropdown

- Fixed positioning below input
- Maximum height with scroll
- Hover and keyboard selection states
- Responsive design

### Highlighted Text

- Yellow background (`bg-yellow-200`)
- Bold font weight
- Subtle padding and border radius

## Performance Considerations

1. **Debouncing**: Reduces API calls by waiting for user to stop typing
2. **Limited Results**: Shows only 8 suggestions to prevent overwhelming UI
3. **Efficient Regex**: Uses escaped regex for safe text matching
4. **Memoization**: Uses useCallback for debounced search function

## Testing

### SearchAutocomplete Tests

**File**: `src/components/Products/SearchAutocomplete.test.tsx`

- Input rendering and interaction
- Suggestion display
- Text highlighting
- Product selection
- Loading states
- No results handling
- Keyboard navigation
- Stock status display
- Price display

### HighlightText Tests

**File**: `src/components/common/HighlightText.test.tsx`

- Text rendering without highlights
- Case-insensitive matching
- Multiple occurrences
- Special character handling
- Custom className support
- Partial matches
- Edge cases

## Integration

### Product Service

The autocomplete uses the existing `searchProducts` method:

```typescript
async searchProducts(query: string): Promise<Product[]> {
  const response = await this.api.get<Product[]>(`/products/search?q=${query}`);
  return response.data;
}
```

### Pages Integration

The Products page passes search query to ProductList:

```tsx
<ProductList
  products={products}
  loading={loading}
  searchQuery={filters.search}
/>
```

## User Experience Improvements

### Before

- Basic text input for search
- No real-time feedback
- No search term highlighting
- Manual navigation to products

### After

- **Real-time Suggestions**: See matching products as you type
- **Visual Feedback**: Highlighted matching terms in results
- **Quick Navigation**: Click suggestion to go directly to product
- **Better Discovery**: See product images, prices, and stock status in suggestions
- **Keyboard Friendly**: Full keyboard navigation support
- **Responsive**: Works on desktop and mobile devices

## Accessibility Features

1. **Keyboard Navigation**: Full keyboard support for power users
2. **Screen Reader Support**: Semantic HTML with proper ARIA labels
3. **Focus Management**: Proper focus handling and visual indicators
4. **High Contrast**: Highlighted text works with high contrast modes

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements for future iterations:

1. **Search History**: Store and display recent searches
2. **Popular Searches**: Show trending search terms
3. **Category Grouping**: Group suggestions by product category
4. **Search Analytics**: Track popular search terms
5. **Voice Search**: Add speech-to-text input
6. **Advanced Filters in Autocomplete**: Quick category/price filters in dropdown
7. **Product Comparison**: Add products to comparison from suggestions
8. **Wishlist Integration**: Quick add to wishlist from suggestions

## Performance Metrics

Target performance metrics:

- **Autocomplete Response**: < 500ms from typing to suggestions
- **Debounce Delay**: 300ms (configurable)
- **Max Suggestions**: 8 products
- **Suggestion Rendering**: < 100ms
- **Highlight Rendering**: < 50ms per card

## Dependencies

No additional dependencies required. Uses:

- React hooks (useState, useEffect, useRef, useCallback)
- Existing product service
- TailwindCSS for styling

## Configuration

The component is highly configurable through props:

```typescript
// Customize debounce delay
const DEBOUNCE_DELAY = 300; // ms

// Customize max suggestions
const MAX_SUGGESTIONS = 8;

// Customize highlight styling
<mark className="bg-yellow-200 font-semibold px-0.5 rounded">
```

## Troubleshooting

### Suggestions not appearing

- Check product service is running
- Verify API endpoint `/products/search` is accessible
- Check browser console for errors

### Highlighting not working

- Ensure `searchQuery` prop is passed correctly
- Check that search query is not empty
- Verify HighlightText component is imported

### Performance issues

- Increase debounce delay if too many API calls
- Reduce max suggestions count
- Check network tab for slow API responses

## Related Files

- `src/components/Products/SearchAutocomplete.tsx`
- `src/components/Products/SearchAutocomplete.test.tsx`
- `src/components/common/HighlightText.tsx`
- `src/components/common/HighlightText.test.tsx`
- `src/components/Products/ProductCard.tsx`
- `src/components/Products/ProductList.tsx`
- `src/components/Products/ProductFilters.tsx`
- `src/components/Layout/SearchBar.tsx`
- `src/services/product.service.ts`

## Conclusion

The search autocomplete and text highlighting features significantly enhance the product discovery experience by providing real-time feedback, visual emphasis on matching terms, and quick navigation to products. The implementation is performant, accessible, and well-tested.
