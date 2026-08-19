const fs = require('fs');

let content = fs.readFileSync('/Users/shubh/Github/recon-labs/src/b2b/mock/settlements.ts', 'utf-8');

// 1. Headline expiring
content = content.replace(
  "{ key: 'expiring', label: 'Recoverable expiring within ~10 days', value: 0, display: '₹0L', unit: 'inr' },",
  "{ key: 'expiring', label: 'Recoverable expiring within ~10 days', value: 1_52_000, display: '₹1.52L', unit: 'inr' },"
);

// Helper function to replace RC line items
function replaceLineItem(content, rcId, newExp, newUnits) {
  // We match everything from expected to threeWayMatch end.
  // Let's do it using regex for the specific RC block.
  const regex = new RegExp(`id: '${rcId}',[\\s\\S]*?threeWayMatch: mkThreeWay\\([\\s\\S]*?\\),`);
  const match = content.match(regex);
  if (!match) {
    console.error(`Could not find block for ${rcId}`);
    return content;
  }
  let block = match[0];
  
  // Replace expected
  block = block.replace(/expected: \d+(_\d+)*,/, `expected: ${newExp},`);
  // Replace paid
  block = block.replace(/paid: \d+(_\d+)*,/, `paid: ${newExp},`);
  // Replace match units string in breakdown
  block = block.replace(/units accepted \(\d+ units\)/, `units accepted (${newUnits} units)`);
  // Replace PO amount
  block = block.replace(/amount: \d+(_\d+)* \},/g, `amount: ${newExp} },`);
  // Replace GRN amount and units
  block = block.replace(/amount: \d+(_\d+)*, unitsAccepted: \d+, unitsOrdered: \d+ \},/, `amount: ${newExp}, unitsAccepted: ${newUnits}, unitsOrdered: ${newUnits} },`);
  
  return content.replace(match[0], block);
}

// Blinkit
content = replaceLineItem(content, 'RC-0810', '12_00_000', '2000');
content = replaceLineItem(content, 'RC-0876', '10_00_000', '1000');
content = replaceLineItem(content, 'RC-0880', '8_34_000', '1668');

// Zepto
content = replaceLineItem(content, 'RC-0391', '10_00_000', '1000');
content = replaceLineItem(content, 'RC-0445', '8_00_000', '800');
content = replaceLineItem(content, 'RC-0320', '7_00_000', '700');
content = replaceLineItem(content, 'RC-0330', '6_20_000', '1240');

// Reliance
content = replaceLineItem(content, 'RC-0112', '6_00_000', '1000');
content = replaceLineItem(content, 'RC-0087', '5_00_000', '1000');
content = replaceLineItem(content, 'RC-0098', '5_00_000', '1000');
content = replaceLineItem(content, 'RC-0105', '3_80_000', '760');

// Cafes
content = replaceLineItem(content, 'RC-CAF-001', '5_00_000', '1000');
content = replaceLineItem(content, 'RC-CAF-002', '4_50_000', '900');
content = replaceLineItem(content, 'RC-CAF-003', '3_70_000', '740');

fs.writeFileSync('/Users/shubh/Github/recon-labs/src/b2b/mock/settlements.ts', content);
console.log('Modified settlements.ts');
