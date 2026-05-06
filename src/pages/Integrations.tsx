import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Breadcrumbs, 
  Link, 
  Chip,
  Avatar
} from '@mui/material';
import { 
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  ExtensionOutlined as ExtensionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
      { id: 'zepto', name: 'Zepto', domain: 'zeptonow.com', status: 'available' },
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
  }
];

const LogoImage: React.FC<{ domain: string; name: string }> = ({ domain, name }) => {
  const [error, setError] = useState(false);
  const [useGoogle, setUseGoogle] = useState(false);

  // Use clearbit as primary, google favicon as secondary, extension icon as tertiary
  const clearbitUrl = `https://logo.clearbit.com/${domain}?size=128`;
  const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  if (error) {
    return <ExtensionIcon sx={{ fontSize: 20, color: '#64748b' }} />;
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
        padding: '4px'
      }}
    />
  );
};

const Integrations: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          color="inherit"
          href="#"
          onClick={(e) => { e.preventDefault(); navigate('/marketplace-reconciliation'); }}
          sx={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: '16px' }} />
          Home
        </Link>
        <Typography color="text.primary" sx={{ fontSize: '12px', fontWeight: 500 }}>
          Integrations
        </Typography>
      </Breadcrumbs>

      <Typography variant="h2" sx={{ mb: 4, fontWeight: 800 }}>
        Integrations
      </Typography>

      {categories.map((category) => (
        <Box key={category.title} sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
            {category.title}
          </Typography>

          <Grid container spacing={3}>
            {category.items.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease-in-out',
                    border: '1.5px solid #e5e7eb',
                    '&:hover': {
                      borderColor: '#111',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
                    <Box
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '10px', 
                        backgroundColor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      <LogoImage domain={item.domain} name={item.name} />
                    </Box>
                    <Chip 
                      label={item.status} 
                      size="small"
                      sx={{ 
                        fontSize: '10px', 
                        height: 20,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: item.status === 'connected' ? '#f0fdf4' : '#eff6ff',
                        color: item.status === 'connected' ? '#16a34a' : '#2563eb',
                        border: 'none'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {item.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default Integrations;
