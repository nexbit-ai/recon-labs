import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { ExtensionOutlined as ExtensionIcon } from '@mui/icons-material';
import { colors, hairline, type, space } from '../b2b/theme/b2bTokens';
import { cardSx as cardBase, SectionTitle } from '../b2b/components/primitives';

interface IntegrationItem {
  id: string;
  name: string;
  domain: string;
  status: 'connected' | 'available';
}

interface IntegrationCategory {
  title: string;
  items: IntegrationItem[];
}

const categories: IntegrationCategory[] = [
  {
    title: 'ERP',
    items: [
      { id: 'tally', name: 'Tally', domain: 'tallysolutions.com', status: 'available' },
      { id: 'zoho', name: 'Zoho', domain: 'zoho.com', status: 'available' },
      { id: 'sap', name: 'SAP', domain: 'sap.com', status: 'available' },
    ]
  },
  {
    title: 'E-commerce',
    items: [
      { id: 'unicommerce', name: 'Unicommerce', domain: 'unicommerce.com', status: 'connected' },
      { id: 'shopify', name: 'Shopify', domain: 'shopify.com', status: 'available' },
      { id: 'bigcommerce', name: 'BigCommerce', domain: 'bigcommerce.com', status: 'available' },
      { id: 'magento', name: 'Magento', domain: 'magento.com', status: 'available' },
    ]
  },
  {
    title: 'Marketplaces',
    items: [
      { id: 'amazon', name: 'Amazon', domain: 'amazon.com', status: 'connected' },
      { id: 'flipkart', name: 'Flipkart', domain: 'flipkart.com', status: 'connected' },
      { id: 'myntra', name: 'Myntra', domain: 'myntra.com', status: 'available' },
      { id: 'nykaa', name: 'Nykaa', domain: 'nykaa.com', status: 'available' },
      { id: 'supertails', name: 'Supertails', domain: 'supertails.com', status: 'available' },
      { id: '6thstreet', name: '6th Street', domain: '6thstreet.com', status: 'available' },
      { id: 'namshi', name: 'Namshi', domain: 'namshi.com', status: 'available' },
    ]
  },
  {
    title: 'Quick Commerce',
    items: [
      { id: 'blinkit', name: 'Blinkit', domain: 'blinkit.com', status: 'available' },
      { id: 'zepto', name: 'Zepto', domain: 'zeptonow.com', status: 'available' },
      { id: 'swiggy', name: 'Swiggy Instamart', domain: 'swiggy.com', status: 'available' },
    ]
  },
  {
    title: 'Logistics',
    items: [
      { id: 'delhivery', name: 'Delhivery', domain: 'delhivery.com', status: 'connected' },
      { id: 'bluedart', name: 'Bluedart', domain: 'bluedart.com', status: 'available' },
      { id: 'shiprocket', name: 'Shiprocket', domain: 'shiprocket.in', status: 'available' },
      { id: 'ekart', name: 'Ekart', domain: 'ekartlogistics.com', status: 'available' },
    ]
  },
  {
    title: 'Payments',
    items: [
      { id: 'paytm', name: 'Paytm', domain: 'paytm.com', status: 'connected' },
      { id: 'payu', name: 'PayU', domain: 'payu.in', status: 'available' },
    ]
  },
  {
    title: 'POS (Point of Sale)',
    items: [
      { id: 'pinelabs', name: 'Pine Labs', domain: 'pinelabs.com', status: 'connected' },
      { id: 'paytm_pos', name: 'Paytm POS', domain: 'paytm.com', status: 'connected' },
      { id: 'bharatpe', name: 'BharatPe', domain: 'bharatpe.com', status: 'available' },
      { id: 'mswipe', name: 'Mswipe', domain: 'mswipe.com', status: 'available' },
    ]
  },
];

const LogoImage: React.FC<{ domain: string; name: string }> = ({ domain, name }) => {
  const [error, setError] = useState(false);
  const [useGoogle, setUseGoogle] = useState(false);

  // Use clearbit as primary, google favicon as secondary, extension icon as tertiary
  const clearbitUrl = `https://logo.clearbit.com/${domain}?size=128`;
  const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  if (error) {
    return <ExtensionIcon sx={{ fontSize: 24, color: colors.grey500 }} />;
  }

  return (
    <Box
      component="img"
      src={useGoogle ? googleUrl : clearbitUrl}
      alt={name}
      onError={() => {
        if (!useGoogle) {
          setUseGoogle(true);
        } else {
          setError(true);
        }
      }}
      sx={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  );
};

// Square hairline-bordered label for status
const StatusChip: React.FC<{ status: 'connected' | 'available' }> = ({ status }) => {
  const isConnected = status === 'connected';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: hairline,
        color: isConnected ? colors.accent : colors.grey700,
        borderColor: isConnected ? colors.accent : colors.grey200,
        px: `${space.sm}px`,
        py: '2px',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {status}
    </Box>
  );
};

const Integrations: React.FC = () => {
  return (
    <Box sx={{ width: '100%' }}>
      {categories.map((category) => (
        <Box key={category.title} sx={{ mb: `${space.xxl}px` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: `${space.lg}px`, borderBottom: hairline, pb: `${space.md}px` }}>
            <SectionTitle>{category.title}</SectionTitle>
          </Box>

          <Grid container spacing={3}>
            {category.items.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Box
                  sx={{
                    ...cardBase,
                    p: `${space.xl}px`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease-out',
                    '&:hover': {
                      borderColor: colors.ink,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', mb: `${space.xl}px` }}>
                    <Box
                      sx={{ 
                        width: 48, 
                        height: 48, 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      <LogoImage domain={item.domain} name={item.name} />
                    </Box>
                    <StatusChip status={item.status} />
                  </Box>
                  
                  <Typography sx={{ fontSize: type.sectionTitle.fontSize, fontWeight: type.sectionTitle.fontWeight, color: colors.ink }}>
                    {item.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default Integrations;
