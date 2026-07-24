const fs = require('fs');
const path = './src/pages/TransactionSheet.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStart = '  const orderValue = rowData.order_value;';
const targetEnd = '  // Calculate smart positioning';

const renderStart = '                    <Typography variant="caption" sx={{ color: \\'#6b7280\\' }}>\\n                      {step.date}\\n                    </Typography>\\n                  </Box>\\n                </Box>\\n              );\\n            })}\\n          </Box>\\n        </Box>';
const renderEnd = '</Box>\n        </Box>'; // This is getting tricky to replace via exact string match due to formatting

