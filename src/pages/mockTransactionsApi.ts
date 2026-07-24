import { TotalTransactionsResponse, SalesTransactionsResponse } from '../services/api/types';
export interface TransactionApiResponse {
  order_id: string;
  order_value: number;
  settlement_amount: number;
  invoice_date: string;
  settlement_date: string;
  diff: number;
  platform: string;
  event_type: string;
  event_subtype: string;
  recon_status: string;
  settlement_provider: string;
}


const generateMockData = (): TransactionApiResponse[] => {
  return Array.from({ length: 500 }).map((_, i) => {
    // Distribute equally across Matched, Less Payment, More Payment, Unsettled
    const reconStatuses = ['settlement_matched', 'less_payment_received', 'more_payment_received', 'unsettled'];
    const recon_status = reconStatuses[i % 4];

    // Distribute equally across Sale, Return, Cancelled
    const eventTypes = ['Sale', 'Return', 'Cancelled'];
    const event_type = eventTypes[i % 3];
    
    const order_value = 1000 + (i * 15) % 3000;
    
    let settlement_amount = order_value;
    let diff = 0;
    
    if (recon_status === 'less_payment_received') {
      settlement_amount = order_value - 200;
      diff = -200;
    } else if (recon_status === 'more_payment_received') {
      settlement_amount = order_value + 200;
      diff = 200;
    } else if (recon_status === 'unsettled') {
      settlement_amount = 0;
      diff = order_value;
    }
    
    const baseDate = new Date('2026-07-20T10:00:00Z');
    baseDate.setDate(baseDate.getDate() - (i % 30));

    const settlementDate = new Date(baseDate);
    settlementDate.setDate(settlementDate.getDate() + 2);
    
    return {
      order_id: `ORD_MOCK_${10000 + i}`,
      order_value,
      settlement_amount,
      invoice_date: baseDate.toISOString(),
      settlement_date: recon_status === 'unsettled' ? '' : settlementDate.toISOString(),
      diff,
      platform: i % 2 === 0 ? 'Amazon' : 'Flipkart',
      event_type,
      event_subtype: '',
      recon_status,
      settlement_provider: 'Amazon Pay'
    };
  });
};

const ALL_MOCK_DATA = generateMockData();

const MOCK_COLUMNS = [
  { key: 'order_id', title: 'Order ID', type: 'string' },
  { key: 'recon_status', title: 'Status', type: 'enum', values: ['settlement_matched', 'less_payment_received', 'more_payment_received', 'unsettled'] },
  { key: 'order_value', title: 'Expected Payout', type: 'number' },
  { key: 'settlement_amount', title: 'Settlement Amount', type: 'number' },
  { key: 'diff', title: 'Difference', type: 'number' },
  { key: 'invoice_date', title: 'Invoice Date', type: 'date' },
  { key: 'settlement_date', title: 'Settlement Date', type: 'date' },
];

export const mockTransactionsApi = {
  getTotalTransactions: async (params: any) => {
    await new Promise(r => setTimeout(r, 400));
    let filteredData = ALL_MOCK_DATA;
    
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
        columns: MOCK_COLUMNS,
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
    const totalCount = ALL_MOCK_DATA.length;
    const limit = params.limit || 10;
    const page = params.page || 1;
    const start = (page - 1) * limit;
    
    const paginatedData = params.count_only === 'true' ? [] : ALL_MOCK_DATA.slice(start, start + limit);
    
    return {
      success: true,
      data: {
        platform: params.platform || 'Amazon',
        count: totalCount,
        transactions: paginatedData,
        columns: MOCK_COLUMNS.map(c => ({ key: c.key, title: c.title, type: c.type })),
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
