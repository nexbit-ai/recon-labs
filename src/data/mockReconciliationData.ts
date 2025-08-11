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
  settledSales: "900000",
  summaryData: {
    totalTransaction: {
      amount: "1230000",
      number: 480
    },
    netSalesAsPerSalesReport: {
      amount: "1200000",
      number: 468
    },
    paymentReceivedAsPerSettlementReport: {
      amount: "900000",
      number: 450
    },
    totalUnreconciled: {
      amount: "100000",
      number: 30,
      lessPaymentReceivedFromFlipkart: {
        amount: "50000",
        number: 15
      },
      excessPaymentReceivedFromFlipkart: {
        amount: "30000",
        number: 10
      }
    },
    totalReconciled: {
      amount: "1100000",
      number: 450
    },
    pendingPaymentFromMarketplace: {
      amount: "150000",
      number: 20
    },
    pendingDeductions: {
      amount: "25000",
      number: 8
    },
    returnedOrCancelledOrders: {
      amount: "30000",
      number: 12
    }
  },
  totalTDS: "5000",
  totalTDA: "12000",
  monthOrdersPayoutReceived: "900000",
  monthOrdersAwaitedSettlement: {
    salesAmount: "150000",
    salesOrders: 20
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
    typeof data.settledSales === 'string' &&
    data.summaryData &&
    data.summaryData.totalTransaction &&
    typeof data.summaryData.totalTransaction.amount === 'string' &&
    typeof data.summaryData.totalTransaction.number === 'number' &&
    data.summaryData.netSalesAsPerSalesReport &&
    typeof data.summaryData.netSalesAsPerSalesReport.amount === 'string' &&
    typeof data.summaryData.netSalesAsPerSalesReport.number === 'number' &&
    data.summaryData.paymentReceivedAsPerSettlementReport &&
    typeof data.summaryData.paymentReceivedAsPerSettlementReport.amount === 'string' &&
    typeof data.summaryData.paymentReceivedAsPerSettlementReport.number === 'number' &&
    data.summaryData.totalUnreconciled &&
    typeof data.summaryData.totalUnreconciled.amount === 'string' &&
    typeof data.summaryData.totalUnreconciled.number === 'number' &&
    data.summaryData.totalUnreconciled.lessPaymentReceivedFromFlipkart &&
    typeof data.summaryData.totalUnreconciled.lessPaymentReceivedFromFlipkart.amount === 'string' &&
    typeof data.summaryData.totalUnreconciled.lessPaymentReceivedFromFlipkart.number === 'number' &&
    data.summaryData.totalUnreconciled.excessPaymentReceivedFromFlipkart &&
    typeof data.summaryData.totalUnreconciled.excessPaymentReceivedFromFlipkart.amount === 'string' &&
    typeof data.summaryData.totalUnreconciled.excessPaymentReceivedFromFlipkart.number === 'number' &&
    data.summaryData.totalReconciled &&
    typeof data.summaryData.totalReconciled.amount === 'string' &&
    typeof data.summaryData.totalReconciled.number === 'number' &&
    data.summaryData.pendingPaymentFromMarketplace &&
    typeof data.summaryData.pendingPaymentFromMarketplace.amount === 'string' &&
    typeof data.summaryData.pendingPaymentFromMarketplace.number === 'number' &&
    data.summaryData.pendingDeductions &&
    typeof data.summaryData.pendingDeductions.amount === 'string' &&
    typeof data.summaryData.pendingDeductions.number === 'number' &&
    data.summaryData.returnedOrCancelledOrders &&
    typeof data.summaryData.returnedOrCancelledOrders.amount === 'string' &&
    typeof data.summaryData.returnedOrCancelledOrders.number === 'number' &&
    typeof data.totalTDS === 'string' &&
    typeof data.totalTDA === 'string' &&
    typeof data.monthOrdersPayoutReceived === 'string' &&
    data.monthOrdersAwaitedSettlement &&
    typeof data.monthOrdersAwaitedSettlement.salesAmount === 'string' &&
    typeof data.monthOrdersAwaitedSettlement.salesOrders === 'number' &&
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