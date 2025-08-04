import { MarketplaceReconciliationResponse } from '../services/api/types';

export const mockReconciliationData: MarketplaceReconciliationResponse = {
  grossSales: "1200000",
  ordersDelivered: {
    amount: "1230000",
    number: 480
  },
  ordersReturned: {
    amount: "30000",
    number: 12
  },
  commission: {
    totalCommission: "80000",
    commissionRate: "6.67"
  },
  TotalTDS: "5000",
  TotalTDA: "12000",
  MonthOrdersPayoutReceived: "900000",
  MonthOrdersAwaitedSettlement: {
    SalesAmount: "150000",
    SalesOrders: 20
  },
  unsettledReturns: {
    returnAmount: "22000",
    returnsOrders: 8
  },
  difference: "100000",
  returnRate: "2.5",
  commissionRate: "6.67"
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