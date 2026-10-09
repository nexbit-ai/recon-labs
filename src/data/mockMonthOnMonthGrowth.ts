import { Platform } from './mockData';

export interface MonthOnMonthRow {
  month: string;
  sales: number;
  settlement: number;
  comissionData?: number;
  commission?: number;
}

export interface D2CMonthOnMonthState {
  d2cSalesAndSettlement: Array<{ month: string; sales: number; settlement: number }>;
  d2cVendorSettlements: {
    cod: Record<string, Array<{ month: string; settlement: number }>>;
    noncod: Record<string, Array<{ month: string; settlement: number }>>;
  };
}

export interface MonthOnMonthGrowthState {
  marketplaceData?: MonthOnMonthRow[];
  d2cSalesAndSettlement?: Array<{ month: string; sales: number; settlement: number }>;
  d2cVendorSettlements?: {
    cod?: Record<string, Array<{ month: string; settlement: number }>>;
    noncod?: Record<string, Array<{ month: string; settlement: number }>>;
  };
}

/**
 * Computes trailing month labels (e.g. ["Nov 2024", "Dec 2024", ..., "Apr 2025"])
 * ending on the specified end date, or defaulting to April 2025 to match demo defaults.
 */
export function getTrailingMonths(endDateStr?: string, count: number = 6): string[] {
  let refDate: Date;
  if (endDateStr) {
    const parsed = new Date(endDateStr);
    if (!isNaN(parsed.getTime())) {
      refDate = parsed;
    } else {
      refDate = new Date(2025, 3, 30); // Default April 2025
    }
  } else {
    refDate = new Date(2025, 3, 30);
  }

  const months: string[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    months.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
  }
  return months;
}

/**
 * Generates realistic, audit-consistent demo data for Month on Month Growth
 * based on the active platform and date range.
 */
export function getDemoMonthOnMonthGrowth(
  platform: Platform | string,
  dateRange?: { start?: string; end?: string }
): MonthOnMonthGrowthState {
  const months = getTrailingMonths(dateRange?.end, 6);
  const plat = (platform || 'flipkart').toLowerCase();

  // Growth multipliers across 6 months: ~4-5% compounding monthly growth
  const growthCurve = [0.79, 0.83, 0.87, 0.91, 0.95, 1.0];

  if (plat === 'd2c') {
    // Target final month: Sales ₹52,45,000, Settlement ₹49,30,300 (~94% settlement rate)
    const targetSales = 5245000;
    const targetSettlement = 4930300;

    const salesAndSettlement = months.map((month, idx) => {
      const factor = growthCurve[idx];
      const sales = Math.round((targetSales * factor) / 100) * 100;
      const settlement = Math.round((targetSettlement * factor) / 100) * 100;
      return { month, sales, settlement };
    });

    // Vendor distribution:
    // COD is 45% of total settlement; Prepaid is 55% of total settlement
    // COD split: Delhivery 45%, Xpressbees 25%, Blue Dart 20%, Shadowfax 10%
    // Non-COD split: Razorpay 50%, Cashfree 25%, PayU 15%, PhonePe 10%
    const codVendors = {
      Delhivery: [] as Array<{ month: string; settlement: number }>,
      Xpressbees: [] as Array<{ month: string; settlement: number }>,
      'Blue Dart': [] as Array<{ month: string; settlement: number }>,
      Shadowfax: [] as Array<{ month: string; settlement: number }>,
    };

    const nonCodVendors = {
      Razorpay: [] as Array<{ month: string; settlement: number }>,
      Cashfree: [] as Array<{ month: string; settlement: number }>,
      PayU: [] as Array<{ month: string; settlement: number }>,
      PhonePe: [] as Array<{ month: string; settlement: number }>,
    };

    salesAndSettlement.forEach((row) => {
      const totalSettlement = row.settlement;
      const codTotal = Math.round(totalSettlement * 0.45);
      const nonCodTotal = totalSettlement - codTotal;

      // COD breakdown
      const delhivery = Math.round(codTotal * 0.45);
      const xpressbees = Math.round(codTotal * 0.25);
      const blueDart = Math.round(codTotal * 0.20);
      const shadowfax = codTotal - delhivery - xpressbees - blueDart;

      codVendors.Delhivery.push({ month: row.month, settlement: delhivery });
      codVendors.Xpressbees.push({ month: row.month, settlement: xpressbees });
      codVendors['Blue Dart'].push({ month: row.month, settlement: blueDart });
      codVendors.Shadowfax.push({ month: row.month, settlement: shadowfax });

      // Prepaid breakdown
      const razorpay = Math.round(nonCodTotal * 0.50);
      const cashfree = Math.round(nonCodTotal * 0.25);
      const payU = Math.round(nonCodTotal * 0.15);
      const phonePe = nonCodTotal - razorpay - cashfree - payU;

      nonCodVendors.Razorpay.push({ month: row.month, settlement: razorpay });
      nonCodVendors.Cashfree.push({ month: row.month, settlement: cashfree });
      nonCodVendors.PayU.push({ month: row.month, settlement: payU });
      nonCodVendors.PhonePe.push({ month: row.month, settlement: phonePe });
    });

    return {
      d2cSalesAndSettlement: salesAndSettlement,
      d2cVendorSettlements: {
        cod: codVendors,
        noncod: nonCodVendors,
      },
    };
  }

  // Marketplace configurations
  let targetSales = 10644500;
  let settlementRate = 0.91;
  let commissionRate = 0.08;
  let showCommission = true;

  if (plat === 'amazon') {
    // Amazon target final month: ~₹1.80 Cr sales, ~82% settlement, ~16% fees
    targetSales = 18010000;
    settlementRate = 0.82;
    commissionRate = 0.16;
    showCommission = true;
  } else if (plat === 'amazon_uk') {
    // Amazon UK in £: ~£35,900 sales, ~82% settlement, ~15.5% fees
    targetSales = 35900;
    settlementRate = 0.82;
    commissionRate = 0.155;
    showCommission = true;
  } else if (plat === 'flipkart') {
    // Flipkart target final month: ~₹1.06 Cr sales, ~91% settlement, ~8% commission
    targetSales = 10644500;
    settlementRate = 0.91;
    commissionRate = 0.08;
    showCommission = true;
  } else if (plat === 'other') {
    // Other (CRED): ~₹20.85L sales, ~92% settlement, no commission column
    targetSales = 2085000;
    settlementRate = 0.92;
    commissionRate = 0;
    showCommission = false;
  } else if (plat === 'blinkit' || plat === 'zepto' || plat === 'instamart') {
    // Quick Commerce: ~₹64.88L sales, ~85% settlement, ~12% fees
    targetSales = 6488000;
    settlementRate = 0.85;
    commissionRate = 0.12;
    showCommission = true;
  } else {
    // Default fallback
    targetSales = 8500000;
    settlementRate = 0.90;
    commissionRate = 0.09;
    showCommission = true;
  }

  const marketplaceData: MonthOnMonthRow[] = months.map((month, idx) => {
    const factor = growthCurve[idx];
    const sales = Math.round((targetSales * factor) / 100) * 100;
    const settlement = Math.round((sales * settlementRate) / 100) * 100;
    const comissionData = showCommission ? Math.round((sales * commissionRate) / 100) * 100 : undefined;

    return {
      month,
      sales,
      settlement,
      ...(comissionData !== undefined && { comissionData, commission: comissionData }),
    };
  });

  return { marketplaceData };
}
