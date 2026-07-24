const fs = require('fs');
const path = './src/pages/mockTransactionsApi.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace label with title in MOCK_COLUMNS
content = content.replace(/label: /g, 'title: ');

// Define TransactionApiResponse inside mockTransactionsApi.ts
const typeDef = `export interface TransactionApiResponse {
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
}\n`;

content = content.replace(/import \{ TotalTransactionsResponse, SalesTransactionsResponse, TransactionApiResponse \} from '\.\.\/services\/api\/types';/, 
  "import { TotalTransactionsResponse, SalesTransactionsResponse } from '../services/api/types';\n" + typeDef);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed types in mockTransactionsApi.ts');
