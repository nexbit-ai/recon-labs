import { MarketplaceReconciliationResponse } from '../services/api/types';

// Enhanced mock data with more realistic values
export const mockReconciliationData: MarketplaceReconciliationResponse = {
  grossSales: "1850000",
  ordersDelivered: {
    amount: "1890000",
    number: 756
  },
  ordersReturned: {
    amount: "40000",
    number: 16
  },
  commission: {
    totalCommission: "123500",
    commissionRate: "6.68"
  },
  TotalTDS: "9250",
  TotalTDA: "18500",
  MonthOrdersPayoutReceived: "1450000",
  MonthOrdersAwaitedSettlement: {
    SalesAmount: "280000",
    SalesOrders: 112
  },
  unsettledReturns: {
    returnAmount: "32000",
    returnsOrders: 12
  },
  difference: "85000",
  returnRate: "2.11",
  commissionRate: "6.68"
};

// Mock data for different months
export const mockDataByMonth: Record<string, MarketplaceReconciliationResponse> = {
  '2025-01': {
    grossSales: "1650000",
    ordersDelivered: {
      amount: "1680000",
      number: 672
    },
    ordersReturned: {
      amount: "30000",
      number: 12
    },
    commission: {
      totalCommission: "110000",
      commissionRate: "6.67"
    },
    TotalTDS: "8250",
    TotalTDA: "16500",
    MonthOrdersPayoutReceived: "1300000",
    MonthOrdersAwaitedSettlement: {
      SalesAmount: "250000",
      SalesOrders: 100
    },
    unsettledReturns: {
      returnAmount: "28000",
      returnsOrders: 10
    },
    difference: "75000",
    returnRate: "1.79",
    commissionRate: "6.67"
  },
  '2025-02': {
    grossSales: "1750000",
    ordersDelivered: {
      amount: "1780000",
      number: 712
    },
    ordersReturned: {
      amount: "30000",
      number: 12
    },
    commission: {
      totalCommission: "116667",
      commissionRate: "6.67"
    },
    TotalTDS: "8750",
    TotalTDA: "17500",
    MonthOrdersPayoutReceived: "1380000",
    MonthOrdersAwaitedSettlement: {
      SalesAmount: "260000",
      SalesOrders: 104
    },
    unsettledReturns: {
      returnAmount: "30000",
      returnsOrders: 11
    },
    difference: "80000",
    returnRate: "1.69",
    commissionRate: "6.67"
  },
  '2025-03': {
    grossSales: "1800000",
    ordersDelivered: {
      amount: "1830000",
      number: 732
    },
    ordersReturned: {
      amount: "30000",
      number: 12
    },
    commission: {
      totalCommission: "120000",
      commissionRate: "6.67"
    },
    TotalTDS: "9000",
    TotalTDA: "18000",
    MonthOrdersPayoutReceived: "1420000",
    MonthOrdersAwaitedSettlement: {
      SalesAmount: "270000",
      SalesOrders: 108
    },
    unsettledReturns: {
      returnAmount: "31000",
      returnsOrders: 11
    },
    difference: "82000",
    returnRate: "1.64",
    commissionRate: "6.67"
  },
  '2025-04': {
    grossSales: "1850000",
    ordersDelivered: {
      amount: "1890000",
      number: 756
    },
    ordersReturned: {
      amount: "40000",
      number: 16
    },
    commission: {
      totalCommission: "123500",
      commissionRate: "6.68"
    },
    TotalTDS: "9250",
    TotalTDA: "18500",
    MonthOrdersPayoutReceived: "1450000",
    MonthOrdersAwaitedSettlement: {
      SalesAmount: "280000",
      SalesOrders: 112
    },
    unsettledReturns: {
      returnAmount: "32000",
      returnsOrders: 12
    },
    difference: "85000",
    returnRate: "2.11",
    commissionRate: "6.68"
  },
  '2025-05': {
    grossSales: "1900000",
    ordersDelivered: {
      amount: "1940000",
      number: 776
    },
    ordersReturned: {
      amount: "40000",
      number: 16
    },
    commission: {
      totalCommission: "126667",
      commissionRate: "6.67"
    },
    TotalTDS: "9500",
    TotalTDA: "19000",
    MonthOrdersPayoutReceived: "1500000",
    MonthOrdersAwaitedSettlement: {
      SalesAmount: "290000",
      SalesOrders: 116
    },
    unsettledReturns: {
      returnAmount: "33000",
      returnsOrders: 13
    },
    difference: "87000",
    returnRate: "2.06",
    commissionRate: "6.67"
  },
  '2025-06': {
    grossSales: "1950000",
    ordersDelivered: {
      amount: "1990000",
      number: 796
    },
    ordersReturned: {
      amount: "40000",
      number: 16
    },
    commission: {
      totalCommission: "130000",
      commissionRate: "6.67"
    },
    TotalTDS: "9750",
    TotalTDA: "19500",
    MonthOrdersPayoutReceived: "1550000",
    MonthOrdersAwaitedSettlement: {
      SalesAmount: "300000",
      SalesOrders: 120
    },
    unsettledReturns: {
      returnAmount: "34000",
      returnsOrders: 13
    },
    difference: "90000",
    returnRate: "2.01",
    commissionRate: "6.67"
  }
};

// Helper function to get mock data for a specific month
export const getMockDataForMonth = (month: string): MarketplaceReconciliationResponse => {
  return mockDataByMonth[month] || mockReconciliationData;
};

// Helper function to validate if the API response has all required fields
export const isValidReconciliationData = (data: any): data is MarketplaceReconciliationResponse => {
  return (
    data &&
    typeof data.grossSales === 'string' &&
    data.ordersDelivered &&
    typeof data.ordersDelivered.amount === 'string' &&
    typeof data.ordersDelivered.number === 'number' &&
    data.ordersReturned &&
    typeof data.ordersReturned.amount === 'string' &&
    typeof data.ordersReturned.number === 'number' &&
    data.commission &&
    typeof data.commission.totalCommission === 'string' &&
    typeof data.commission.commissionRate === 'string' &&
    typeof data.TotalTDS === 'string' &&
    typeof data.TotalTDA === 'string' &&
    typeof data.MonthOrdersPayoutReceived === 'string' &&
    data.MonthOrdersAwaitedSettlement &&
    typeof data.MonthOrdersAwaitedSettlement.SalesAmount === 'string' &&
    typeof data.MonthOrdersAwaitedSettlement.SalesOrders === 'number' &&
    data.unsettledReturns &&
    typeof data.unsettledReturns.returnAmount === 'string' &&
    typeof data.unsettledReturns.returnsOrders === 'number' &&
    typeof data.difference === 'string' &&
    typeof data.returnRate === 'string' &&
    typeof data.commissionRate === 'string'
  );
};

// Helper function to get safe data (API data if valid, mock data if not)
export const getSafeReconciliationData = (apiData: any): MarketplaceReconciliationResponse => {
  if (isValidReconciliationData(apiData)) {
    return apiData;
  }
  console.warn('Invalid API response, falling back to mock data:', apiData);
  return mockReconciliationData;
}; 