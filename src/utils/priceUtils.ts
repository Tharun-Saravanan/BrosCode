/**
 * Utility functions for handling price formatting and conversion
 */

/**
 * Safely formats a price value for Indian currency display
 * @param price - The price value (number or string)
 * @returns Formatted price string with Indian locale
 */
export const formatPrice = (price: number | string): string => {
  try {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericPrice)) {
      return '0';
    }
    
    return numericPrice.toLocaleString('en-IN');
  } catch (error) {
    console.error('Error formatting price:', error);
    return '0';
  }
};

/**
 * Safely converts a price value to a number
 * @param price - The price value (number or string)
 * @returns Numeric price value
 */
export const ensureNumericPrice = (price: number | string): number => {
  try {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numericPrice) ? 0 : numericPrice;
  } catch (error) {
    console.error('Error converting price to number:', error);
    return 0;
  }
};

/**
 * Formats price for display with Indian Rupee symbol
 * @param price - The price value (number or string)
 * @returns Formatted price string with ₹ symbol
 */
export const formatPriceWithCurrency = (price: number | string): string => {
  return `₹${formatPrice(price)}`;
};
