export const OCCASION_FILTERS = [
  { id: 'all', label: 'All Collections' },
  { id: 'festive', label: 'Festive & Wedding Luxe' },
  { id: 'workwear', label: 'Workwear Elegance' },
  { id: 'resort', label: 'Resort & Cocktail' },
  { id: 'under999', label: 'Under ₹999 Essentials' }
];

export const EVREVIA_CATEGORIES = [
  {
    id: 'cat-template',
    name: 'Your Category Name',
    iconName: 'LayoutGrid',
    image: '', // Add image URL here
    occasion: ['all'],
    subcategories: [
      { 
        name: 'Example Subcategory', 
        startingPrice: 0, 
        badge: 'New', 
        occasion: ['all'], 
        images: [] 
      }
    ]
  }
];

