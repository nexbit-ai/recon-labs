const fs = require('fs');
const path = './src/pages/TransactionSheet.tsx';
let content = fs.readFileSync(path, 'utf8');

const modalStart = 'const BreakupsModal: React.FC<{';
const modalEnd = 'interface TransactionSheetProps {';

const startIndex = content.indexOf(modalStart);
const endIndex = content.indexOf(modalEnd);

if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find modal start or end');
    process.exit(1);
}

const beforeModal = content.substring(0, startIndex);
const afterModal = content.substring(endIndex);

const newModal = `const BreakupsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  breakups: any;
  orderId: string;
  anchorEl: HTMLElement | null;
  formatCurrency: (amount: number) => string;
}> = ({ open, onClose, breakups, orderId, anchorEl, formatCurrency }) => {
  if (!open || !breakups || !anchorEl) return null;

  const rowData = (breakups as any)?.originalData || breakups || {};
  const eventType = rowData.event_type || 'Sale';
  const invoiceDateStr = rowData.invoice_date || new Date().toISOString();
  const invoiceDate = new Date(invoiceDateStr);
  
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
  };

  const formatDateWithTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ' • ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const settlementDateStr = rowData.settlement_date;
  const settlementAmount = rowData.settlement_amount;
  const orderValue = rowData.order_value;

  const steps = [];

  // 1. Order Placed
  steps.push({
    title: 'Order Placed',
    date: formatDateWithTime(invoiceDateStr),
    amount: formatCurrency(orderValue)
  });

  if (eventType.toLowerCase() === 'sale') {
    steps.push({
      title: 'Order Delivered',
      date: formatDateWithTime(addDays(invoiceDate, 3))
    });
    if (settlementDateStr) {
      steps.push({
        title: 'Settlement Done',
        date: formatDateWithTime(settlementDateStr),
        amount: formatCurrency(settlementAmount)
      });
    }
  } else if (eventType.toLowerCase() === 'return') {
    steps.push({
      title: 'Order Delivered',
      date: formatDateWithTime(addDays(invoiceDate, 3))
    });
    steps.push({
      title: 'Return Initiated',
      date: formatDateWithTime(addDays(invoiceDate, 5))
    });
    if (settlementDateStr) {
      steps.push({
        title: 'Settlement Deducted',
        date: formatDateWithTime(settlementDateStr),
        amount: formatCurrency(settlementAmount)
      });
    }
  } else if (eventType.toLowerCase() === 'cancelled') {
    steps.push({
      title: 'Order Cancelled',
      date: formatDateWithTime(addDays(invoiceDate, 1))
    });
    if (settlementDateStr) {
      steps.push({
        title: 'Settlement Deducted',
        date: formatDateWithTime(settlementDateStr),
        amount: formatCurrency(settlementAmount)
      });
    }
  }

  // Calculate smart positioning
  const getPopupPosition = () => {
    const rect = anchorEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const popupHeight = 400; 
    const popupWidth = 400;
    const offset = 12;

    let top: number;
    let animationDirection: 'up' | 'down' = 'down';
    let maxHeight: number | undefined;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= popupHeight + offset) {
      top = rect.bottom + offset;
      animationDirection = 'down';
    } else if (spaceAbove >= popupHeight + offset) {
      top = rect.top - popupHeight - offset;
      animationDirection = 'up';
    } else {
      if (spaceBelow > spaceAbove) {
        top = Math.max(offset, viewportHeight - popupHeight - offset);
        maxHeight = popupHeight;
        animationDirection = 'down';
      } else {
        top = offset;
        maxHeight = popupHeight;
        animationDirection = 'up';
      }
    }

    if (maxHeight && maxHeight < 300) {
      maxHeight = 300;
    }

    let left: number;
    if (rect.left + popupWidth <= viewportWidth) {
      left = rect.left;
    } else {
      left = Math.max(offset, viewportWidth - popupWidth - offset);
    }

    if (top < offset) {
      top = offset;
      maxHeight = Math.min(popupHeight, viewportHeight - offset * 2);
    }
    if (top + (maxHeight || popupHeight) > viewportHeight - offset) {
      top = Math.max(offset, viewportHeight - (maxHeight || popupHeight) - offset);
    }

    if (left < offset) {
      left = offset;
    }
    if (left + popupWidth > viewportWidth - offset) {
      left = viewportWidth - popupWidth - offset;
    }

    return { top, left, animationDirection, maxHeight };
  };

  const position = getPopupPosition();

  return (
    <>
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1399,
          animation: 'fadeIn 0.2s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
        }}
      />
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          width: '400px',
          maxHeight: position.maxHeight ? \`\${position.maxHeight}px\` : 'auto',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 1400,
          animation: position.animationDirection === 'down'
            ? 'fadeInScaleDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'fadeInScaleUp 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
              Order Journey
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
              ID: {orderId}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              p: 0.5,
              '&:hover': {
                background: '#e5e7eb',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, maxHeight: position.maxHeight ? \`\${position.maxHeight - 80}px\` : '300px', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              return (
                <Box key={index} sx={{ display: 'flex', gap: 2, position: 'relative', pb: isLast ? 0 : 3 }}>
                  {!isLast && (
                    <Box sx={{ position: 'absolute', top: 24, left: 11, bottom: -4, width: '2px', background: '#e5e7eb' }} />
                  )}
                  
                  <Box sx={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    background: '#f9fafb', 
                    border: '2px solid #d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                    mt: 0.25
                  }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#9ca3af' }} />
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                        {step.title}
                      </Typography>
                      {step.amount && (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4b5563' }}>
                          {step.amount}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {step.date}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </>
  );
};

`;

fs.writeFileSync(path, beforeModal + newModal + afterModal, 'utf8');
console.log('Updated BreakupsModal to Order Journey Modal');
