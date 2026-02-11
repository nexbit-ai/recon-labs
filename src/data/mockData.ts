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
  type?: string;
  severity?: 'positive' | 'warning' | 'info' | 'critical';
  supportingData?: {
    currentValue: number;
    previousValue: number;
    percentageChange: number;
    timeSeriesData: { date: string; value: number; baseline?: number }[];
    additionalMetrics?: { label: string; value: string | number }[];
    recommendation?: string;
  };
}

export interface SalesRow {
  id: string;
  orderId: string;
  date: string;
  channel: string;
  customer: string;
  items: number;
  total: number;
  shippingFees: number;
  marketplaceCommission: number;
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
  marketplace_commissions_over_time: SalesDataPoint[];
  shipping_fees_over_time: SalesDataPoint[];
  sales_by_channel: ChannelBreakdown[];
  top_products: TopProduct[];
  anomalies: Anomaly[];
  sales_table: SalesRow[];
  products_table: ProductRow[];
  returns_table: SalesRow[];
}

export type Platform = 'shopify' | 'amazon' | 'flipkart' | 'myntra' | 'd2c' | 'other';

export interface PlatformData {
  [key: string]: FinanceMockData;
}

// Platform distribution weights (unequal distribution)
const PLATFORM_WEIGHTS: Record<Platform, number> = {
  shopify: 0.35,    // 35% - highest
  amazon: 0.28,     // 28% - second highest  
  flipkart: 0.22,   // 22% - third
  myntra: 0.15,     // 15% - lowest
  d2c: 0.25,        // 25% - D2C platform
  other: 0.10,      // 10% - generic "Other" / CRED
};

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

// Dynamic data generation function with platform filtering
export const generateMockData = (dateRange: string, selectedPlatforms: Platform[] = ['shopify', 'amazon', 'flipkart', 'myntra']): FinanceMockData => {
  const days = getDaysFromRange(dateRange);
  const scaleFactor = getDataScaleFactor(days);
  const timeInterval = getTimeInterval(days);
  
  // Base revenue values
  const baseRevenue = 245000;
  const baseOrders = 3421;
  const baseAOV = 71.6;
  const baseReturns = 314;
  
  // Calculate total weight for selected platforms
  const totalWeight = selectedPlatforms.reduce((sum, platform) => sum + PLATFORM_WEIGHTS[platform], 0);
  
  // Scale values based on time range and filter by selected platforms
  const fullScaledRevenue = Math.floor(baseRevenue * scaleFactor);
  const scaledRevenue = Math.floor(fullScaledRevenue * totalWeight); // Revenue for selected platforms only
  const scaledOrders = Math.floor(baseOrders * scaleFactor * totalWeight);
  const scaledAOV = baseAOV * (1 + (scaleFactor - 1) * 0.1); // AOV grows slightly with scale
  const scaledReturns = Math.floor(baseReturns * scaleFactor * totalWeight);

  // Generate KPIs with scaled values for selected platforms
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
  const marketplace_commissions_over_time: SalesDataPoint[] = [];
  const shipping_fees_over_time: SalesDataPoint[] = [];
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
    
    // Marketplace commissions (typically 8-15% of revenue, varying by platform)
    const commissionRate = 0.08 + (Math.random() * 0.07); // 8-15% range
    const baseCommission = baseRevenue * commissionRate;
    const commission = Math.floor(baseCommission * (1 + (Math.random() - 0.5) * variation));
    
    // Shipping fees (typically 3-8% of revenue)
    const shippingRate = 0.03 + (Math.random() * 0.05); // 3-8% range
    const baseShipping = baseRevenue * shippingRate;
    const shipping = Math.floor(baseShipping * (1 + (Math.random() - 0.5) * variation));
    
    const dateStr = getTimeFormat(days, date);
    
    sales_over_time.push({
      date: dateStr,
      revenue: Math.max(revenue, 0),
    });
    
    marketplace_commissions_over_time.push({
      date: dateStr,
      revenue: Math.max(commission, 0),
    });
    
    shipping_fees_over_time.push({
      date: dateStr,
      revenue: Math.max(shipping, 0),
    });
  }

  // Generate channel data with scaled values for selected platforms only
  const sales_by_channel: ChannelBreakdown[] = selectedPlatforms.map(platform => {
    const weight = PLATFORM_WEIGHTS[platform] / totalWeight; // Normalize weight
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    return {
      channel: platformName,
      revenue: Math.floor(scaledRevenue * weight),
    };
  });

  // Generate top products with scaled values based on selected platforms
  const top_products: TopProduct[] = [
    { product: 'Product A', revenue: Math.floor(scaledRevenue * 0.143) },
    { product: 'Product B', revenue: Math.floor(scaledRevenue * 0.118) },
    { product: 'Product C', revenue: Math.floor(scaledRevenue * 0.098) },
    { product: 'Product D', revenue: Math.floor(scaledRevenue * 0.090) },
    { product: 'Product E', revenue: Math.floor(scaledRevenue * 0.078) },
  ];

  // Prepare selected channels for reuse
  const selectedChannels = selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1));

  // Generate comprehensive insights and anomalies
  const anomalies: Anomaly[] = [];
  const numAnomalies = Math.max(5, Math.floor(days / 3) + 3); // Ensure at least 5 insights
  
  const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
  const channels = selectedChannels;
  
  const insightTypes = [
    {
      type: 'spike',
      message: (product: string) => `Sales spike detected: ${product} revenue increased by ${25 + Math.floor(Math.random() * 50)}% compared to last period`,
      severity: 'positive'
    },
    {
      type: 'trend',
      message: (channel: string) => `Growing trend: ${channel} channel showing consistent ${5 + Math.floor(Math.random() * 15)}% week-over-week growth`,
      severity: 'positive'
    },
    {
      type: 'anomaly',
      message: (product: string) => `Anomaly detected: ${product} return rate increased to ${2 + Math.random() * 3}% (${Math.random() > 0.5 ? 'above' : 'below'} normal range)`,
      severity: 'warning'
    },
    {
      type: 'optimization',
      message: (channel: string) => `Opportunity: ${channel} conversion rate is ${15 + Math.floor(Math.random() * 25)}% higher on weekends`,
      severity: 'info'
    },
    {
      type: 'alert',
      message: (product: string) => `Inventory alert: ${product} stock levels dropping, projected stockout in ${3 + Math.floor(Math.random() * 10)} days`,
      severity: 'critical'
    },
    {
      type: 'performance',
      message: (channel: string) => `Performance insight: ${channel} average order value increased by $${5 + Math.floor(Math.random() * 15)} this period`,
      severity: 'positive'
    },
         {
       type: 'seasonal',
       message: () => `Seasonal pattern: ${Math.random() > 0.5 ? 'Weekend' : 'Weekday'} sales are ${10 + Math.floor(Math.random() * 20)}% higher than historical average`,
       severity: 'info' as const
     },
     {
       type: 'commission',
       message: (channel: string) => `Cost optimization: ${channel} marketplace fees have ${Math.random() > 0.5 ? 'decreased' : 'increased'} by ${1 + Math.random() * 3}% this month`,
       severity: 'positive' as const
     },
     {
       type: 'customer',
       message: () => `Customer insight: Repeat customer rate is ${35 + Math.floor(Math.random() * 25)}%, showing strong loyalty`,
       severity: 'positive' as const
     },
     {
       type: 'fraud',
       message: () => `Security alert: ${Math.floor(Math.random() * 5) + 1} potentially fraudulent transactions detected and flagged`,
       severity: 'critical' as const
     }
  ];
  
  for (let i = 0; i < numAnomalies; i++) {
    const insightType = insightTypes[i % insightTypes.length];
    let message = '';
    
         if (insightType.type === 'spike' || insightType.type === 'anomaly' || insightType.type === 'performance' || insightType.type === 'alert') {
       message = (insightType.message as (product: string) => string)(products[i % products.length]);
     } else if (insightType.type === 'trend' || insightType.type === 'optimization' || insightType.type === 'commission') {
       message = (insightType.message as (channel: string) => string)(channels[i % channels.length]);
     } else {
       message = (insightType.message as () => string)();
     }
    
    const hoursAgo = Math.floor(Math.random() * (days * 24));
    const timestamp = hoursAgo < 1 ? 'Just now' : 
                     hoursAgo < 24 ? `${hoursAgo}h ago` : 
                     `${Math.floor(hoursAgo / 24)}d ago`;
    
     // Generate supporting evidence data for this insight
     const generateSupportingData = (insightType: any, currentProduct?: string, currentChannel?: string) => {
       const baseValue = Math.floor(Math.random() * 50000) + 10000;
       const changePercent = 25 + Math.floor(Math.random() * 50); // 25-75% change
       const previousValue = Math.floor(baseValue / (1 + changePercent / 100));
       
       // Generate time series data showing the trend
       const timeSeriesData: { date: string; value: number; baseline?: number }[] = [];
       const daysBack = Math.min(days, 14); // Show up to 14 days of supporting data
       
       for (let j = daysBack; j >= 0; j--) {
         const date = new Date();
         date.setDate(date.getDate() - j);
         const dateStr = date.toISOString().slice(0, 10);
         
         let value, baseline;
         if (insightType.severity === 'positive') {
           // Show upward trend
           baseline = previousValue;
           value = j === 0 ? baseValue : 
                   j < 3 ? previousValue + (baseValue - previousValue) * (1 - j / 3) :
                   previousValue + Math.random() * (previousValue * 0.1);
         } else if (insightType.severity === 'warning' || insightType.severity === 'critical') {
           // Show concerning trend
           baseline = baseValue;
           value = j === 0 ? previousValue :
                   j < 3 ? baseValue - (baseValue - previousValue) * (1 - j / 3) :
                   baseValue + Math.random() * (baseValue * 0.1);
         } else {
           // Neutral trend with some variation
           baseline = (baseValue + previousValue) / 2;
           value = baseline + (Math.random() - 0.5) * baseline * 0.2;
         }
         
         timeSeriesData.push({
           date: dateStr,
           value: Math.floor(value),
           baseline: Math.floor(baseline)
         });
       }
       
       // Generate additional metrics based on insight type
       const additionalMetrics: { label: string; value: string | number }[] = [];
       switch (insightType.type) {
         case 'spike':
           additionalMetrics.push(
             { label: 'Peak Revenue', value: `$${baseValue.toLocaleString()}` },
             { label: 'Previous Period', value: `$${previousValue.toLocaleString()}` },
             { label: 'Days in Trend', value: '3 days' },
             { label: 'Conversion Rate', value: `${(3.2 + Math.random() * 2).toFixed(1)}%` }
           );
           break;
         case 'trend':
           additionalMetrics.push(
             { label: 'Growth Rate', value: `${changePercent}%` },
             { label: 'Trend Duration', value: `${Math.floor(Math.random() * 7) + 7} days` },
             { label: 'Market Share', value: `${(15 + Math.random() * 10).toFixed(1)}%` }
           );
           break;
         case 'anomaly':
           additionalMetrics.push(
             { label: 'Return Rate', value: `${(2 + Math.random() * 3).toFixed(1)}%` },
             { label: 'Normal Range', value: '1.2% - 2.8%' },
             { label: 'Total Returns', value: Math.floor(Math.random() * 50) + 20 },
             { label: 'Avg Return Value', value: `$${Math.floor(Math.random() * 100) + 50}` }
           );
           break;
         case 'alert':
           additionalMetrics.push(
             { label: 'Current Stock', value: Math.floor(Math.random() * 100) + 50 },
             { label: 'Daily Sales Rate', value: `${Math.floor(Math.random() * 20) + 10} units/day` },
             { label: 'Reorder Point', value: Math.floor(Math.random() * 50) + 25 },
             { label: 'Lead Time', value: `${Math.floor(Math.random() * 5) + 3} days` }
           );
           break;
         case 'performance':
           additionalMetrics.push(
             { label: 'AOV Increase', value: `$${Math.floor(Math.random() * 15) + 5}` },
             { label: 'Units per Order', value: (1.5 + Math.random()).toFixed(1) },
             { label: 'Customer Segments', value: 'Premium buyers' }
           );
           break;
         case 'fraud':
           additionalMetrics.push(
             { label: 'Risk Score', value: `${(7.5 + Math.random() * 2).toFixed(1)}/10` },
             { label: 'Flagged Amount', value: `$${Math.floor(Math.random() * 5000) + 1000}` },
             { label: 'False Positive Rate', value: '12%' }
           );
           break;
         default:
           additionalMetrics.push(
             { label: 'Confidence Level', value: '94%' },
             { label: 'Data Points', value: Math.floor(Math.random() * 1000) + 500 }
           );
       }
       
       // Generate recommendations
       let recommendation = '';
       switch (insightType.severity) {
         case 'positive':
           recommendation = 'Consider increasing marketing spend on this high-performing product/channel to maximize growth opportunity.';
           break;
         case 'warning':
           recommendation = 'Monitor closely and investigate underlying causes. Consider adjusting pricing or inventory strategies.';
           break;
         case 'critical':
           recommendation = 'Immediate attention required. Review processes and implement corrective measures within 24 hours.';
           break;
         default:
           recommendation = 'Continue monitoring trends and optimize based on seasonal patterns and customer behavior.';
       }
       
       return {
         currentValue: baseValue,
         previousValue,
         percentageChange: Math.round(changePercent),
         timeSeriesData,
         additionalMetrics,
         recommendation
       };
     };

     anomalies.push({
       message,
       timestamp,
       type: insightType.type,
       severity: insightType.severity as 'positive' | 'warning' | 'info' | 'critical',
       supportingData: generateSupportingData(insightType, 
         (insightType.type === 'spike' || insightType.type === 'anomaly' || insightType.type === 'performance' || insightType.type === 'alert') 
           ? products[i % products.length] : undefined,
         (insightType.type === 'trend' || insightType.type === 'optimization' || insightType.type === 'commission') 
           ? channels[i % channels.length] : undefined
       ),
     });
  }

  // Generate sales table data for selected platforms only
  const numSalesRows = Math.min(Math.max(days, 10), 100); // Between 10 and 100 rows
  const sales_table: SalesRow[] = Array.from({ length: numSalesRows }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * days));
    
    const channel = selectedChannels[i % selectedChannels.length];
    const total = parseFloat((20 + Math.random() * 300).toFixed(2));
    
    // Calculate shipping fees (3-8% of total)
    const shippingRate = 0.03 + (Math.random() * 0.05);
    const shippingFees = parseFloat((total * shippingRate).toFixed(2));
    
    // Calculate marketplace commission (0% for Shopify, 8-15% for others)
    let marketplaceCommission = 0;
    if (channel !== 'Shopify') {
      const commissionRate = 0.08 + (Math.random() * 0.07); // 8-15% for marketplaces
      marketplaceCommission = parseFloat((total * commissionRate).toFixed(2));
    }
    
    return {
      id: `order-${i + 1}`,
      orderId: `#${10000 + i + 1}`,
      date: date.toISOString().slice(0, 10),
      channel,
      customer: ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Wilson', 'Carol Brown'][i % 5],
      items: Math.floor(1 + Math.random() * 5),
      total,
      shippingFees,
      marketplaceCommission,
      status: ['Shipped', 'Processing', 'Delivered', 'Cancelled'][i % 4],
    };
  });

  // Generate products table data based on selected platforms
  const numProductRows = Math.min(Math.max(Math.floor(days / 3), 5), 20); // Between 5 and 20 products
  const products_table: ProductRow[] = Array.from({ length: numProductRows }, (_, i) => {
    const baseUnits = Math.floor(100 * scaleFactor * totalWeight);
    const baseRevenue = Math.floor(10000 * scaleFactor * totalWeight);
    
    return {
      id: `prod-${i + 1}`,
      name: `Product ${String.fromCharCode(65 + i)}`,
      sku: `SKU-${i + 1}`,
      unitsSold: Math.floor(baseUnits + Math.random() * baseUnits),
      revenue: Math.floor(baseRevenue + Math.random() * baseRevenue),
      returns: Math.floor(1 + Math.random() * Math.max(50 * scaleFactor * totalWeight, 10)),
      returnRate: parseFloat((Math.random() * 5).toFixed(1)),
    };
  });

  return {
    kpis,
    sales_over_time,
    marketplace_commissions_over_time,
    shipping_fees_over_time,
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