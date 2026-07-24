const fs = require('fs');
const path = './src/pages/TransactionSheet.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace less_payment_received colors
const targetStr = `case 'less_payment_received':
                                                    displayText = 'Less Payment Received';
                                                    backgroundColor = '#fef3c7';
                                                    textColor = '#d97706';`;
const replaceStr = `case 'less_payment_received':
                                                    displayText = 'Less Payment Received';
                                                    backgroundColor = '#fee2e2';
                                                    textColor = '#dc2626';`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed less_payment_received color in TransactionSheet.tsx');
