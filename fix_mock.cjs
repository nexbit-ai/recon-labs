const fs = require('fs');
const path = './src/pages/mockTransactionsApi.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace TotalTransactionsResponse return object structure
content = content.replace(/meta: {[\s\S]*?}/, ''); // Remove meta object completely

// Re-write the getTotalTransactions return structure
content = content.replace(/return {\n\s*success: true,\n\s*data: {[\s\S]*?}\n\s*};/m, `return {
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
    };`);

// Re-write the getSalesTransactions return structure
content = content.replace(/return {\n\s*success: true,\n\s*data: {\n\s*data: paginatedData,[\s\S]*?}\n\s*};\n\s*}/m, `return {
      success: true,
      data: {
        platform: params.platform || 'Amazon',
        count: totalCount,
        transactions: paginatedData,
        columns: MOCK_COLUMNS.map(c => ({ key: c.key, title: c.label, type: c.type })),
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
  }`);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed mockTransactionsApi.ts return structures');
