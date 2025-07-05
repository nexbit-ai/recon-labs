export interface KPI {
  id: string;
  label: string;
  value: number;
  change: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
}

export interface ChannelBreakdown {
  channel: string;
  revenue: number;
}

export interface TopProduct {
  product: string;
  revenue: number;
}

export interface Anomaly {
  message: string;
  timestamp: string;
}

export interface SalesRow {
  id: string;
  orderId: string;
  date: string;
  channel: string;
  customer: string;
  items: number;
  total: number;
  status: string;
}

export interface ProductRow {
  id: string;
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  returns: number;
  returnRate: number;
}

export interface FinanceMockData {
  kpis: KPI[];
  sales_over_time: SalesDataPoint[];
  sales_by_channel: ChannelBreakdown[];
  top_products: TopProduct[];
  anomalies: Anomaly[];
  sales_table: SalesRow[];
  products_table: ProductRow[];
  returns_table: SalesRow[];
}

// Helper function to get number of days from date range string
const getDaysFromRange = (dateRange: string): number => {
  switch (dateRange) {
    case 'Last 1 day':
      return 1;
    case 'Last 7 days':
      return 7;
    case 'Last 30 days':
      return 30;
    case 'Last 90 days':
      return 90;
    case 'Year to Date':
      return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24));
    default:
      return 30;
  }
};

// Helper function to get appropriate data scaling factor
const getDataScaleFactor = (days: number): number => {
  if (days <= 1) return 0.1;
  if (days <= 7) return 0.5;
  if (days <= 30) return 1;
  if (days <= 90) return 2.5;
  return 4; // Year to Date
};

// Helper function to get time interval for data points
const getTimeInterval = (days: number): number => {
  if (days <= 1) return 1; // Half-hourly data points
  if (days <= 7) return 1; // Daily data points
  if (days <= 30) return 1; // Daily data points
  if (days <= 90) return 3; // Every 3 days
  return 7; // Weekly data points
};

// Helper function to generate appropriate time format
const getTimeFormat = (days: number, date: Date): string => {
  if (days <= 1) {
    // For "Last 1 day", show only time in HH:MM format
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  return date.toISOString().slice(0, 10); // Just date for multiple days
};

// Dynamic data generation function
export const generateMockData = (dateRange: string): FinanceMockData => {
  const days = getDaysFromRange(dateRange);
  const scaleFactor = getDataScaleFactor(days);
  const timeInterval = getTimeInterval(days);
  
  // Base revenue values
  const baseRevenue = 245000;
  const baseOrders = 3421;
  const baseAOV = 71.6;
  const baseReturns = 314;
  
  // Scale values based on time range
  const scaledRevenue = Math.floor(baseRevenue * scaleFactor);
  const scaledOrders = Math.floor(baseOrders * scaleFactor);
  const scaledAOV = baseAOV * (1 + (scaleFactor - 1) * 0.1); // AOV grows slightly with scale
  const scaledReturns = Math.floor(baseReturns * scaleFactor);

  // Generate KPIs with scaled values
  const kpis: KPI[] = [
    {
      id: 'totalRevenue',
      label: 'Total Revenue',
      value: scaledRevenue,
      change: Math.round(12.5 * (1 + Math.random() * 0.4 - 0.2) * 100) / 100, // Add some variation, rounded to 2 decimal places
    },
    {
      id: 'orders',
      label: 'Orders',
      value: scaledOrders,
      change: Math.round(-4.2 * (1 + Math.random() * 0.4 - 0.2) * 100) / 100,
    },
    {
      id: 'aov',
      label: 'Average Order Value',
      value: Math.round(scaledAOV * 100) / 100,
      change: Math.round(5.1 * (1 + Math.random() * 0.4 - 0.2) * 100) / 100,
    },
    {
      id: 'returns',
      label: 'Returns',
      value: scaledReturns,
      change: Math.round(1.8 * (1 + Math.random() * 0.4 - 0.2) * 100) / 100,
    },
  ];

  // Generate sales_over_time data with appropriate data points
  const sales_over_time: SalesDataPoint[] = [];
  const numDataPoints = days <= 1 ? 48 : Math.max(days / timeInterval, 7); // 48 half-hour intervals for 1 day
  
  for (let i = 0; i < numDataPoints; i++) {
    const date = new Date();
    
    if (days <= 1) {
      // Half-hourly data for same day (every 30 minutes)
      const minutesBack = (numDataPoints - 1 - i) * 30;
      date.setMinutes(date.getMinutes() - minutesBack);
      // Round to nearest half hour
      const minutes = date.getMinutes();
      const roundedMinutes = Math.round(minutes / 30) * 30;
      date.setMinutes(roundedMinutes);
      date.setSeconds(0);
      date.setMilliseconds(0);
    } else {
      // Daily or multi-day intervals
      date.setDate(date.getDate() - (numDataPoints - 1 - i) * timeInterval);
    }
    
    // Calculate base revenue per time unit (half-hourly for same day, daily for multi-day)
    const baseRevenue = days <= 1 
      ? scaledRevenue / 48 // baseHalfHourly for half-hour data
      : scaledRevenue / days; // baseDaily for daily data
    
    const variation = 0.3; // 30% variation
    const revenue = Math.floor(baseRevenue * (1 + (Math.random() - 0.5) * variation));
    
    sales_over_time.push({
      date: getTimeFormat(days, date),
      revenue: Math.max(revenue, 0),
    });
  }

  // Generate channel data with scaled values
  const sales_by_channel: ChannelBreakdown[] = [
    { channel: 'Shopify', revenue: Math.floor(scaledRevenue * 0.49) },
    { channel: 'Amazon', revenue: Math.floor(scaledRevenue * 0.31) },
    { channel: 'Flipkart', revenue: Math.floor(scaledRevenue * 0.20) },
  ];

  // Generate top products with scaled values
  const top_products: TopProduct[] = [
    { product: 'Product A', revenue: Math.floor(scaledRevenue * 0.143) },
    { product: 'Product B', revenue: Math.floor(scaledRevenue * 0.118) },
    { product: 'Product C', revenue: Math.floor(scaledRevenue * 0.098) },
    { product: 'Product D', revenue: Math.floor(scaledRevenue * 0.090) },
    { product: 'Product E', revenue: Math.floor(scaledRevenue * 0.078) },
  ];

  // Generate anomalies based on time range
  const anomalies: Anomaly[] = [];
  const numAnomalies = Math.max(1, Math.floor(days / 10)); // More anomalies for longer periods
  
  for (let i = 0; i < numAnomalies; i++) {
    const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
    const channels = ['Shopify', 'Amazon', 'Flipkart'];
    const types = [
      `Spike in sales detected for ${products[i % products.length]}`,
      `Return rate increased for ${products[i % products.length]}`,
      `Low revenue on ${channels[i % channels.length]} channel`,
      `High conversion rate on ${channels[i % channels.length]}`,
      `Inventory alert for ${products[i % products.length]}`,
    ];
    
    const hoursAgo = Math.floor(Math.random() * (days * 24));
    const timestamp = hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;
    
    anomalies.push({
      message: types[i % types.length],
      timestamp,
    });
  }

  // Generate sales table data
  const numSalesRows = Math.min(Math.max(days, 10), 100); // Between 10 and 100 rows
  const sales_table: SalesRow[] = Array.from({ length: numSalesRows }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * days));
    
    return {
      id: `order-${i + 1}`,
      orderId: `#${10000 + i + 1}`,
      date: date.toISOString().slice(0, 10),
      channel: ['Shopify', 'Amazon', 'Flipkart'][i % 3],
      customer: ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Wilson', 'Carol Brown'][i % 5],
      items: Math.floor(1 + Math.random() * 5),
      total: parseFloat((20 + Math.random() * 300).toFixed(2)),
      status: ['Shipped', 'Processing', 'Delivered', 'Cancelled'][i % 4],
    };
  });

  // Generate products table data
  const numProductRows = Math.min(Math.max(Math.floor(days / 3), 5), 20); // Between 5 and 20 products
  const products_table: ProductRow[] = Array.from({ length: numProductRows }, (_, i) => {
    const baseUnits = Math.floor(100 * scaleFactor);
    const baseRevenue = Math.floor(10000 * scaleFactor);
    
    return {
      id: `prod-${i + 1}`,
      name: `Product ${String.fromCharCode(65 + i)}`,
      sku: `SKU-${i + 1}`,
      unitsSold: Math.floor(baseUnits + Math.random() * baseUnits),
      revenue: Math.floor(baseRevenue + Math.random() * baseRevenue),
      returns: Math.floor(1 + Math.random() * Math.max(50 * scaleFactor, 10)),
      returnRate: parseFloat((Math.random() * 5).toFixed(1)),
    };
  });

  return {
    kpis,
    sales_over_time,
    sales_by_channel,
    top_products,
    anomalies,
    sales_table,
    products_table,
    returns_table: [], // Keep empty for now
  };
};

// Export the default data for backward compatibility
const mockData = generateMockData('Last 30 days');
export default mockData; 