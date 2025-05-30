/**
 * Format large numbers with abbreviations (K, M, B)
 * @param {number} num - The number to format
 * @param {number} digits - Number of decimal places (default: 1)
 * @returns {string} Formatted number string
 */
export const formatLargeNumber = (num, digits = 1) => {
  if (!num || isNaN(num)) return '0';
  
  const si = [
    { value: 1E9, symbol: 'B' },
    { value: 1E6, symbol: 'M' },
    { value: 1E3, symbol: 'K' }
  ];
  
  for (let i = 0; i < si.length; i++) {
    if (num >= si[i].value) {
      return (num / si[i].value).toFixed(digits).replace(/\.0+$/, '') + si[i].symbol;
    }
  }
  
  return num.toString();
};

/**
 * Format currency with proper Japanese formatting
 * @param {number} amount - The amount to format
 * @param {boolean} abbreviated - Whether to abbreviate large numbers
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, abbreviated = false) => {
  if (!amount || isNaN(amount)) return '¥0';
  
  if (abbreviated && Math.abs(amount) >= 10000) {
    return `¥${formatLargeNumber(amount)}`;
  }
  
  return `¥${amount.toLocaleString('ja-JP')}`;
};

/**
 * Format percentage with proper decimal places
 * @param {number} value - The percentage value
 * @param {number} digits - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, digits = 1) => {
  if (!value || isNaN(value)) return '0%';
  return `${value.toFixed(digits)}%`;
};

/**
 * Format date according to user's date format settings
 * @param {Date|string} date - The date to format
 * @param {string} dateFormat - The date format setting (e.g., 'YYYY-MM-DD', 'MM/DD/YYYY', etc.)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, dateFormat = 'YYYY-MM-DD') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  
  switch (dateFormat) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    
    case 'YYYY年MM月DD日':
      return `${year}年${month}月${day}日`;
    
    case 'MM月DD日, YYYY年':
      return `${month}月${day}日, ${year}年`;
    
    default:
      // Fallback to ISO format
      return `${year}-${month}-${day}`;
  }
};