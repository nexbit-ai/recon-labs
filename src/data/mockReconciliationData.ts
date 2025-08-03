import { MarketplaceReconciliationResponse } from '../services/api/types';

export const mockReconciliationData: MarketplaceReconciliationResponse = {
  grossSales: 1200000,
  ordersDelivered: {
    amount: 1230000,
    number: 480
  },
  ordersReturned: {
    amount: -30000,
    number: 12
  },
  commission: 80000,
  netReceivable: 1033000,
  awaitedSettlement: {
    amount: 150000,
    orders: 20
  },
  unsettledReturns: {
    amount: 22000,
    returns: 8
  },
  tcs: 12000,
  tds: 5000,
  payoutReceived: 900000,
  difference: 100000
};

// Helper function to validate if the API response has all required fields
export const isValidReconciliationData = (data: any): data is MarketplaceReconciliationResponse => {
  return (
    data &&
    typeof data.grossSales === 'number' &&
    data.ordersDelivered &&
    typeof data.ordersDelivered.amount === 'number' &&
    typeof data.ordersDelivered.number === 'number' &&
    data.ordersReturned &&
    typeof data.ordersReturned.amount === 'number' &&
    typeof data.ordersReturned.number === 'number' &&
    typeof data.commission === 'number' &&
    typeof data.netReceivable === 'number' &&
    data.awaitedSettlement &&
    typeof data.awaitedSettlement.amount === 'number' &&
    typeof data.awaitedSettlement.orders === 'number' &&
    data.unsettledReturns &&
    typeof data.unsettledReturns.amount === 'number' &&
    typeof data.unsettledReturns.returns === 'number' &&
    typeof data.tcs === 'number' &&
    typeof data.tds === 'number' &&
    typeof data.payoutReceived === 'number' &&
    typeof data.difference === 'number'
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