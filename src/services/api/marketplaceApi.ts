import { apiService } from './apiService';

// Types for marketplace API responses
export interface MarketplaceKPIs {
  totalSales: string;
  totalCommission: string;
  totalOrders: number;
  aov: string;
  returns: number;
}

export interface ChartDataPoint {
  date: string;
  value: string;
}

export interface MarketplaceChartData {
  sales: ChartDataPoint[];
  shipping: ChartDataPoint[];
}

export interface MarketplaceInsight {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  value: string;
  trend: string;
  icon: string;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  revenue: string;
  unitsSold: number;
  growth: string;
  platform: string;
}

export interface MarketplaceOverviewResponse {
  kpis: MarketplaceKPIs;
  chartData: MarketplaceChartData;
  insights: MarketplaceInsight[];
  topProducts: TopProduct[];
}

class MarketplaceApiService {
  private baseUrl: string;
  private apiKey: string;
  private orgId: string;

  constructor() {
    this.baseUrl = 'http://localhost:8080';
    this.apiKey = 'kapiva-7b485b6a865b2b4a3d728ef2fd4f3';
    this.orgId = '6ce6ee73-e1ef-4020-ad74-4ee45e731201';
  }

  async getMarketplaceOverview(startDate: string, endDate: string): Promise<MarketplaceOverviewResponse> {
    try {
      const url = `${this.baseUrl}/v1/recon/stats/sales`;
      const params = {
        start_date: startDate,
        end_date: endDate
      };

      const headers = {
        'X-API-Key': this.apiKey,
        'X-Org-ID': this.orgId,
        'Content-Type': 'application/json'
      };

      console.log('🔍 Making API call to:', url);
      console.log('📅 Date range:', { startDate, endDate });
      console.log('🔑 Headers:', headers);

      const response = await apiService.get<MarketplaceOverviewResponse>(
        url,
        params,
        {
          headers,
          timeout: 30000,
          retryAttempts: 3
        }
      );

      console.log('✅ API Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching marketplace overview:', error);
      throw error;
    }
  }

  // Helper method to format date for API
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

export const marketplaceApi = new MarketplaceApiService(); 