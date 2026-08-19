import { blinkitSettlements } from './blinkitRecon.js';
import fs from 'fs';

let content = fs.readFileSync('blinkitRecon.ts', 'utf8');

function recalculate(settlementId) {
  const set = blinkitSettlements.find(s => s.id === settlementId);
  const expected = set.expected;
  
  // Calculate total deductions excluding 'Revenue' and 'Other adjustments'
  let totalDeds = 0;
  for (const comp of set.components) {
    if (comp.label === 'Revenue / Invoice Value' || comp.label === 'Other adjustments') continue;
    // all others are type 'deduction' and have positive amounts in data
    totalDeds += comp.amount;
  }
  
  // Let's set Revenue so that Revenue - totalDeds is close to Expected, then 'Other adjustments' will cover the gap.
  // We can just keep the deductions, and set Revenue = Expected + totalDeds.
  // Then we don't even need 'Other adjustments' or we can set it to 0.
  // Or, we can just change 'Other adjustments' to absorb the massive gap, but that looks weird in UI (e.g. +8,00,000 adjustment).
  
  // Let's scale Revenue.
  const newRevenue = expected + totalDeds;
  
  // Update Revenue component in file
  // Wait, if we change Revenue, then TDS, TCS, Commission (which are % of revenue) will look wrong!
  // Commission is 2% of revenue. 
  // Let's calculate exactly based on Revenue = R
  // Commission = 0.02 * R
  // Commission GST = 0.18 * Commission = 0.0036 * R
  // TDS = 0.002 * R (wait, in 1024 it's 4296 which is 0.2% of 2148200)
  // TCS = 0.02 * R
  // Shipping, Storage, Courier, CNDN remain fixed (or we can keep them as is)
  
  // Total Revenue-based deductions = 0.02*R + 0.0036*R + 0.002*R + 0.02*R = 0.0456 * R
  // Fixed Deductions = Shipping + Shipping GST + Storage + Courier + CNDN
  
  let fixedDeds = 0;
  for (const comp of set.components) {
    if (['Shipping', 'Shipping GST', 'Storage', 'Courier', 'Credit/Debit Notes'].includes(comp.label)) {
      fixedDeds += comp.amount;
    }
  }
  
  // R - 0.0456 * R - fixedDeds + Other = Expected
  // Let's just set Other = 0
  // R * (1 - 0.0456) = Expected + fixedDeds
  // R * 0.9544 = Expected + fixedDeds
  
  let R = Math.round((expected + fixedDeds) / 0.9544);
  let Comm = Math.round(R * 0.02);
  let CommGST = Math.round(Comm * 0.18);
  let TDS = Math.round(R * 0.002);
  let TCS = Math.round(R * 0.02);
  
  let actualCalcExpected = R - Comm - CommGST - TDS - TCS - fixedDeds;
  let other = expected - actualCalcExpected; // make it exact
  
  console.log(`\n--- ${settlementId} ---`);
  console.log(`Expected: ${expected}`);
  console.log(`Fixed Deds: ${fixedDeds}`);
  console.log(`New Revenue: ${R}`);
  console.log(`Comm: ${Comm}`);
  console.log(`Comm GST: ${CommGST}`);
  console.log(`TDS: ${TDS}`);
  console.log(`TCS: ${TCS}`);
  console.log(`Other: ${other}`);
}

recalculate('BLK-SET-1024');
recalculate('BLK-SET-1026');
