import { TotalTransactionsResponse, SalesTransactionsResponse } from '../services/api/types';

export interface TransactionApiResponse {
  order_id: string;
  order_item_id?: string;
  order_value: number;
  settlement_amount: number;
  invoice_date?: string;
  order_date?: string;
  settlement_date: string;
  diff: number;
  platform: string;
  event_type: string;
  event_subtype: string;
  recon_status: string;
  settlement_provider: string;
  business_mode?: string;
  payment_mode?: string;
  shipping_package_code?: string;
  claim_status?: string;
  claim_reason?: string;
  claim_ticket_id?: string;
  metadata?: any;
}

const getBaseMockAttributes = (i: number, orderPrefix: string, platform: string, baseValue: number, diffAmount: number) => {
  const reconStatuses = ['settlement_matched', 'less_payment_received', 'more_payment_received', 'unsettled'];
  const recon_status = reconStatuses[i % 4];

  const eventTypes = ['Sale', 'Return', 'Cancelled'];
  const event_type = eventTypes[i % 3];
  
  const order_value = Math.floor(baseValue + ((i * 17) % (baseValue * 1.5)));
  
  let settlement_amount = order_value;
  let diff = 0;
  
  if (recon_status === 'less_payment_received') {
    settlement_amount = order_value - diffAmount;
    diff = -diffAmount;
  } else if (recon_status === 'more_payment_received') {
    settlement_amount = order_value + diffAmount;
    diff = diffAmount;
  } else if (recon_status === 'unsettled') {
    settlement_amount = 0;
    diff = order_value;
  }
  
  const baseDate = new Date('2026-07-20T10:00:00Z');
  baseDate.setDate(baseDate.getDate() - (i % 30));

  const settlementDate = new Date(baseDate);
  settlementDate.setDate(settlementDate.getDate() + 2);

  return {
    order_id: `${orderPrefix}_MOCK_${10000 + i}`,
    order_value,
    settlement_amount,
    invoice_date: baseDate.toISOString(),
    order_date: baseDate.toISOString(),
    settlement_date: recon_status === 'unsettled' ? '' : settlementDate.toISOString(),
    diff,
    platform,
    event_type,
    event_subtype: '',
    recon_status,
  };
};

const generateAmazonMockData = (): TransactionApiResponse[] => {
  return Array.from({ length: 500 }).map((_, i) => {
    const base = getBaseMockAttributes(i, 'AMZ', 'amazon', 1200, 150);
    return {
      ...base,
      settlement_provider: 'Amazon Pay',
      metadata: {
        breakups: {
          marketplace_fees: {
            selling_fees_amount: base.order_value * 0.1,
            fba_fees_amount: base.order_value * 0.05,
            other_transaction_fee_amount: 10,
          },
          order_value: {
            cgst_amount: base.order_value * 0.09,
            sgst_tax_amount: base.order_value * 0.09,
          },
          taxes: base.order_value * 0.18,
          tcs: base.order_value * 0.01,
          tds: base.order_value * 0.01,
        }
      }
    };
  });
};

const generateFlipkartMockData = (): TransactionApiResponse[] => {
  return Array.from({ length: 500 }).map((_, i) => {
    const base = getBaseMockAttributes(i, 'FK', 'flipkart', 2500, 320);
    return {
      ...base,
      settlement_provider: 'Flipkart',
      metadata: {
        settlement_value: {
          seller_share_offer: base.order_value * 0.9,
          customer_addons_amount: 25,
          taxes: base.order_value * 0.18,
          marketplace_fee: base.order_value * 0.12,
        },
        order_value: {
          buyer_invoice_amount: base.order_value,
        }
      }
    };
  });
};

const generateD2CMockData = (): TransactionApiResponse[] => {
  return Array.from({ length: 500 }).map((_, i) => {
    const base = getBaseMockAttributes(i, 'D2C', 'd2c', 4000, 850);
    const paymentMode = i % 2 === 0 ? 'Prepaid' : 'COD';
    const couriers = ['Delhivery', 'Blue Dart', 'Shadowfax'];
    return {
      ...base,
      payment_mode: paymentMode,
      shipping_package_code: `PKG_${8000 + i}`,
      settlement_provider: paymentMode === 'Prepaid' ? 'PayU' : couriers[i % 3],
      metadata: {
        shipping_courier: couriers[i % 3],
        breakups: {
          commission_amount: base.order_value * 0.02,
        }
      }
    };
  });
};

const AMAZON_MOCK_DATA = generateAmazonMockData();
const FLIPKART_MOCK_DATA = generateFlipkartMockData();
const D2C_MOCK_DATA = generateD2CMockData();

const getMockColumnsForPlatform = (platform: string) => {
  const baseColumns = [
    { key: 'order_id', title: 'Order ID', type: 'string' },
    { key: 'recon_status', title: 'Status', type: 'enum', values: ['settlement_matched', 'less_payment_received', 'more_payment_received', 'unsettled'] },
    { key: 'order_value', title: 'Expected Payout', type: 'number' },
    { key: 'settlement_amount', title: 'Settlement Amount', type: 'number' },
    { key: 'diff', title: 'Difference', type: 'number' },
    { key: 'invoice_date', title: 'Invoice Date', type: 'date' },
    { key: 'settlement_date', title: 'Settlement Date', type: 'date' },
  ];
  return baseColumns;
};

export const mockTransactionsApi = {
  getTotalTransactions: async (params: any) => {
    await new Promise(r => setTimeout(r, 400));
    
    const platform = (params.platform || 'amazon').toLowerCase();
    let sourceData = AMAZON_MOCK_DATA;
    if (platform === 'flipkart') sourceData = FLIPKART_MOCK_DATA;
    if (platform === 'd2c') sourceData = D2C_MOCK_DATA;

    let filteredData = sourceData;
    
    if (params.status_in) {
      const statuses = params.status_in.split(',');
      filteredData = filteredData.filter(d => statuses.includes(d.recon_status));
    } else if (params.status) {
      const statuses = params.status.split(',');
      filteredData = filteredData.filter(d => statuses.includes(d.recon_status));
    }
    
    const totalCount = filteredData.length;
    const limit = params.limit || 10;
    const page = params.page || 1;
    const start = (page - 1) * limit;
    
    const paginatedData = params.count_only === 'true' ? [] : filteredData.slice(start, start + limit);
    
    return {
      success: true,
      data: {
        message: 'Success',
        data: paginatedData,
        columns: getMockColumnsForPlatform(platform),
        pagination: {
          current_count: paginatedData.length,
          has_next: start + limit < totalCount,
          has_prev: page > 1,
          limit,
          page,
          total_count: totalCount,
          total_pages: Math.ceil(totalCount / limit)
        }
      }
    };
  },
  getSalesTransactions: async (params: any) => {
    await new Promise(r => setTimeout(r, 400));
    
    const platform = (params.platform || 'amazon').toLowerCase();
    let sourceData = AMAZON_MOCK_DATA;
    if (platform === 'flipkart') sourceData = FLIPKART_MOCK_DATA;
    if (platform === 'd2c') sourceData = D2C_MOCK_DATA;

    const totalCount = sourceData.length;
    const limit = params.limit || 10;
    const page = params.page || 1;
    const start = (page - 1) * limit;
    
    const paginatedData = params.count_only === 'true' ? [] : sourceData.slice(start, start + limit);
    
    return {
      success: true,
      data: {
        platform: params.platform || 'amazon',
        count: totalCount,
        transactions: paginatedData,
        columns: getMockColumnsForPlatform(platform).map(c => ({ key: c.key, title: c.title, type: c.type })),
        pagination: {
          current_count: paginatedData.length,
          has_next: start + limit < totalCount,
          has_prev: page > 1,
          limit,
          page,
          total_count: totalCount,
          total_pages: Math.ceil(totalCount / limit)
        }
      }
    };
  }
};
