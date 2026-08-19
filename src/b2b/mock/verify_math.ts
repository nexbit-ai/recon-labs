import { headline, channelPerformance, reconLineItems } from './index.ts';
import {
  blinkitSettlements,
  blinkitDeductionRecords,
  blinkitCreditDebitNotes
} from './blinkitRecon.ts';

let errors: string[] = [];

function check(label: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) > 1) {
    errors.push(`[ERROR] ${label}: Actual ${actual} != Expected ${expected}`);
  } else {
    console.log(`[OK] ${label}: ${actual}`);
  }
}

// 1. Headline
const rec = headline.find(h => h.key === 'receivable')!.value;
const sett = headline.find(h => h.key === 'settled')!.value;
const leak = headline.find(h => h.key === 'leakage')!.value;
check('Headline Receivable = Settled + Leakage', rec, sett + leak);

// 2. Channel Performance
const sumExpected = channelPerformance.reduce((acc, c) => acc + c.settled + c.leakage, 0);
const sumSettled = channelPerformance.reduce((acc, c) => acc + c.settled, 0);
check('Channels Sum Expected == Headline Receivable', sumExpected, rec);
check('Channels Sum Settled == Headline Settled', sumSettled, sett);

// 3. Recon Line Items
const sumReconExpected = reconLineItems.reduce((acc, c) => acc + c.expected, 0);
check('Recon Line Items Expected == 1 Crore', sumReconExpected, 10000000);
reconLineItems.forEach(li => {
  check(`Recon Item ${li.id} Variance = Expected - Paid`, li.variance, li.expected - li.paid);
  const sumBreakdown = li.varianceBreakdown.reduce((acc, b) => acc + b.amount, 0);
  check(`Recon Item ${li.id} Breakdown Sum == Variance`, Math.abs(sumBreakdown), li.variance);
});

// 4. Hero Settlement 1025
const heroSet = blinkitSettlements.find(s => s.id === 'BLK-SET-1025')!;
const heroRev = heroSet.components.find(c => c.label.includes('Revenue'))!.amount;
const heroComms = heroSet.components.find(c => c.label === 'Commission')!.amount;
const heroCommsGST = heroSet.components.find(c => c.label === 'Commission GST')!.amount;
const heroShip = heroSet.components.find(c => c.label === 'Shipping')!.amount;
const heroShipGST = heroSet.components.find(c => c.label === 'Shipping GST')!.amount;
const heroStorage = heroSet.components.find(c => c.label === 'Storage')!.amount;
const heroCourier = heroSet.components.find(c => c.label === 'Courier')!.amount;
const heroTDS = heroSet.components.find(c => c.label === 'TDS')!.amount;
const heroTCS = heroSet.components.find(c => c.label === 'TCS')!.amount;
const heroCNDN = heroSet.components.find(c => c.label === 'Credit/Debit Notes')!.amount;

let sumComps = heroSet.components.reduce((acc, c) => {
  return acc + (c.type === 'revenue' ? c.amount : -c.amount);
}, 0);
check('Hero Settlement Components Sum == Expected', sumComps, heroSet.expected);
check('Hero Difference', heroSet.difference, heroSet.expected - heroSet.actual);

// 5. Deduction Drilldowns
function sumRecords(key: keyof typeof blinkitDeductionRecords) {
  return blinkitDeductionRecords[key].reduce((acc, r) => acc + r.amount, 0);
}
check('Commission Records Sum == Settlement Commission', sumRecords('commission'), heroComms);
check('Shipping Records Sum == Settlement Shipping', sumRecords('shipping'), heroShip);
check('Storage Records Sum == Settlement Storage', sumRecords('storage'), heroStorage);
check('Courier Records Sum == Settlement Courier', sumRecords('courier'), heroCourier);
check('CNDN Records Sum == Settlement CNDN', sumRecords('cndn'), heroCNDN);

if (errors.length > 0) {
  console.log("ERRORS FOUND:");
  console.log(errors.join("\n"));
} else {
  console.log("ALL VERIFICATIONS PASSED");
}
