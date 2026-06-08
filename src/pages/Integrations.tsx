import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  useTheme,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Fade,
  Tooltip,
} from '@mui/material';
import {
  Sync as SyncIcon,
  AutoAwesome as AutoAwesomeIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  ShoppingBag as ShoppingBagIcon,
  CheckCircle as CheckCircleIcon,
  Science as ScienceIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { api } from '../services/api';
import shiprocketLogo from '../assets/providers/shiprocket.png';
import unicommerceLogo from '../assets/providers/unicommerce.png';

const Integrations: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [shopifyDialogOpen, setShopifyDialogOpen] = useState(false);
  const [configType, setConfigType] = useState<'amazon' | 'shopify' | 'razorpay' | 'clickpost' | 'payu' | 'paytm' | 'shiprocket' | 'unicommerce' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoContent, setInfoContent] = useState({ title: '', steps: [] as string[] });

  // Shopify State
  const [shopifyDomain, setShopifyDomain] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [shopifyConnected, setShopifyConnected] = useState(false);
  const [connectedStores, setConnectedStores] = useState<any[]>([]);

  // Razorpay State
  const [razorpayConnected, setRazorpayConnected] = useState(false);
  const [razorpayConfig, setRazorpayConfig] = useState({
    key_id: '',
    key_secret: '',
  });

  // Clickpost State
  const [clickpostConnected, setClickpostConnected] = useState(false);
  const [clickpostConfig, setClickpostConfig] = useState({
    password: '',
    username: '',
  });

  // PayU State
  const [payuConnected, setPayuConnected] = useState(false);
  const [payuConfig, setPayuConfig] = useState({
    merchant_key: '',
    merchant_salt: '',
    client_id: '',
    client_secret: '',
  });

  // Paytm State
  const [paytmConnected, setPaytmConnected] = useState(false);
  const [paytmConfig, setPaytmConfig] = useState({
    client_id: '',
    client_secret: '',
    merchant_id: '',
  });

  const [shiprocketConnected, setShiprocketConnected] = useState(false);
  const [shiprocketConfig, setShiprocketConfig] = useState({
    email: '',
    password: '',
  });

  const [unicommerceConnected, setUnicommerceConnected] = useState(false);
  const [unicommerceConfig, setUnicommerceConfig] = useState({
    tenant: '',
    username: '',
    password: '',
    client_id: 'my-trusted-client',
  });

  useEffect(() => {
    const fetchStatuses = async () => {
      // Fetch Shopify status
      try {
        const shopifyResp = await api.shopifyAuth.getStatus();
        if (shopifyResp.statusCode === 200 && shopifyResp.data?.stores?.length > 0) {
          setShopifyConnected(true);
          setConnectedStores(shopifyResp.data.stores);
        }
      } catch (e) { console.error('Shopify status fetch failed', e); }

      // Fetch Razorpay status
      try {
        const razorpayResp = await api.razorpayAuth.getStatus();
        if (razorpayResp.statusCode === 200 && razorpayResp.data?.connected) {
          setRazorpayConnected(true);
          setRazorpayConfig(prev => ({ ...prev, key_id: razorpayResp.data?.key_id || '' }));
        }
      } catch (e) { console.error('Razorpay status fetch failed', e); }

      // Fetch Clickpost status
      try {
        const clickpostResp = await api.clickpostAuth.getStatus();
        if (clickpostResp.statusCode === 200 && clickpostResp.data?.connected) {
          setClickpostConnected(true);
          setClickpostConfig(prev => ({ ...prev, username: clickpostResp.data?.username || '' }));
        }
      } catch (e) { console.error('Clickpost status fetch failed', e); }

      // Fetch PayU status
      try {
        const payuResp = await api.payuAuth.getStatus();
        if (payuResp.statusCode === 200 && payuResp.data?.connected) {
          setPayuConnected(true);
          setPayuConfig(prev => ({ ...prev, merchant_key: payuResp.data?.merchant_key || '' }));
        }
      } catch (e) { console.error('PayU status fetch failed', e); }

      // Fetch Paytm status
      try {
        const paytmResp = await api.paytmAuth.getStatus();
        if (paytmResp.statusCode === 200 && paytmResp.data?.connected) {
          setPaytmConnected(true);
          setPaytmConfig(prev => ({ ...prev, merchant_id: paytmResp.data?.merchant_id || '' }));
        }
      } catch (e) { console.error('Paytm status fetch failed', e); }

      // Fetch Shiprocket status
      try {
        const shiprocketResp = await api.shiprocketAuth.getStatus();
        if (shiprocketResp.statusCode === 200 && shiprocketResp.data?.connected) {
          setShiprocketConnected(true);
          setShiprocketConfig(prev => ({ ...prev, email: shiprocketResp.data?.email || '' }));
        }
      } catch (e) { console.error('Shiprocket status fetch failed', e); }

      // Fetch Unicommerce status
      try {
        const unicommerceResp = await api.unicommerceAuth.getStatus();
        if (unicommerceResp.statusCode === 200 && unicommerceResp.data?.connected) {
          setUnicommerceConnected(true);
          setUnicommerceConfig(prev => ({ 
            ...prev, 
            tenant: unicommerceResp.data?.tenant || '',
            username: unicommerceResp.data?.username || ''
          }));
        }
      } catch (e) { console.error('Unicommerce status fetch failed', e); }
    };

    fetchStatuses();
  }, []);

  // Amazon Config State
  const [amazonConfig, setAmazonConfig] = useState({
    client_id: '',
    client_secret: '',
    redirect_uri: window.location.origin + '/integrations/callback',
    seller_central_domain: 'sellercentral.amazon.in',
    region_base_url: 'https://sellingpartnerapi-fe.amazon.com',
  });

  const handleAmazonAuth = async () => {
    setLoading('amazon');
    setError(null);
    try {
      const state = Math.random().toString(36).substring(7);
      const response = await api.amazonAuth.start(state);
      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        setError('No authorization URL received. Please check your configuration.');
      }
    } catch (err: any) {
      console.error('Failed to initiate Amazon Auth:', err);
      setError(err?.response?.data?.error || 'Failed to initiate sync. Make sure you have saved the configuration.');
    } finally {
      setLoading(null);
    }
  };

  const handleShopifyAuth = async () => {
    if (!shopifyDomain) {
      setError('Please enter your Shopify store domain');
      return;
    }
    
    // Normalize domain
    let domain = shopifyDomain.trim();
    if (domain.includes('://')) domain = domain.split('://')[1];
    if (domain.includes('/')) domain = domain.split('/')[0];
    if (!domain.includes('.')) domain = `${domain}.myshopify.com`;

    setLoading('shopify');
    setError(null);
    try {
      const response = await api.shopifyAuth.start(domain);
      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        setError('No authorization URL received.');
      }
    } catch (err: any) {
      console.error('Failed to initiate Shopify Auth:', err);
      setError(err?.response?.data?.error || 'Failed to initiate Shopify connection.');
    } finally {
      setLoading(null);
    }
  };

  const handleShopifyTestFetch = async (domain: string) => {
    setLoading('test-fetch');
    setError(null);
    setTestResult(null);
    try {
      const response = await api.shopifyAuth.testFetch(domain);
      setTestResult(response.data);
      setSuccess('Successfully fetched sample orders from Shopify!');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to fetch test data.');
    } finally {
      setLoading(null);
    }
  };

  const handleSaveConfig = async () => {
    if (!configType) return;
    setLoading('save');
    setError(null);
    try {
      if (configType === 'amazon') {
        await api.amazonAuth.saveConfig(amazonConfig);
        setSuccess('Amazon configuration saved successfully');
      } else if (configType === 'razorpay') {
        if (!razorpayConfig.key_id || !razorpayConfig.key_secret) {
          setError('Please enter both Key ID and Key Secret');
          return;
        }
        await api.razorpayAuth.saveConfig(razorpayConfig.key_id, razorpayConfig.key_secret);
        setSuccess('Razorpay credentials saved successfully');
        setRazorpayConnected(true);
      } else if (configType === 'clickpost') {
        if (!clickpostConfig.password || !clickpostConfig.username) {
          setError('Please enter both Username and Password');
          return;
        }
        await api.clickpostAuth.saveConfig(clickpostConfig.password, clickpostConfig.username);
        setSuccess('Clickpost credentials saved successfully');
        setClickpostConnected(true);
      } else if (configType === 'payu') {
        if (!payuConfig.merchant_key || !payuConfig.merchant_salt || !payuConfig.client_id || !payuConfig.client_secret) {
          setError('Please fill in all PayU configuration fields');
          return;
        }
        await api.payuAuth.saveConfig(
          payuConfig.merchant_key, 
          payuConfig.merchant_salt, 
          payuConfig.client_id, 
          payuConfig.client_secret
        );
        setSuccess('PayU credentials saved successfully');
        setPayuConnected(true);
      } else if (configType === 'paytm') {
        if (!paytmConfig.client_id || !paytmConfig.client_secret || !paytmConfig.merchant_id) {
          setError('Please fill in all Paytm configuration fields');
          return;
        }
        await api.paytmAuth.saveConfig(
          paytmConfig.client_id,
          paytmConfig.client_secret,
          paytmConfig.merchant_id
        );
        setSuccess('Paytm credentials saved successfully');
        setPaytmConnected(true);
      } else if (configType === 'shiprocket') {
        if (!shiprocketConfig.email || !shiprocketConfig.password) {
          setError('Please enter both Email and Password');
          return;
        }
        await api.shiprocketAuth.saveConfig(shiprocketConfig.email, shiprocketConfig.password);
        setSuccess('Shiprocket credentials saved successfully');
        setShiprocketConnected(true);
      } else if (configType === 'unicommerce') {
        if (!unicommerceConfig.tenant || !unicommerceConfig.username || !unicommerceConfig.password) {
          setError('Please enter Tenant, Username and Password');
          return;
        }
        await api.unicommerceAuth.saveConfig(unicommerceConfig);
        setSuccess('Unicommerce credentials saved successfully');
        setUnicommerceConnected(true);
      }
      setConfigOpen(false);
    } catch (err: any) {
      console.error(`Failed to save ${configType} config:`, err);
      setError(err?.response?.data?.error || 'Failed to save configuration');
    } finally {
      setLoading(null);
    }
  };

  const handleRazorpayTestFetch = async () => {
    setLoading('razorpay-test');
    setError(null);
    try {
      // For testing, use the dates from the curl example
      const response = await api.razorpayAuth.testFetch('2022', '06', '11');
      if (response.statusCode === 200) {
        setTestResult(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch Razorpay data:', err);
      setError(err?.response?.data?.error || 'Failed to fetch test data');
    } finally {
      setLoading(null);
    }
  };

  const handleClickpostTestFetch = async () => {
    setLoading('clickpost-test');
    setError(null);
    try {
      const response = await api.clickpostAuth.testFetch();
      if (response.statusCode === 200) {
        setTestResult(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch Clickpost data:', err);
      setError(err?.response?.data?.error || 'Failed to fetch test data');
    } finally {
      setLoading(null);
    }
  };

  const handlePayUTestFetch = async () => {
    setLoading('payu-test');
    setError(null);
    try {
      const response = await api.payuAuth.testFetch();
      if (response.statusCode === 200) {
        setTestResult(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch PayU data:', err);
      setError(err?.response?.data?.error || 'Failed to fetch test data');
    } finally {
      setLoading(null);
    }
  };

  const handlePaytmTestFetch = async () => {
    setLoading('paytm-test');
    setError(null);
    try {
      const response = await api.paytmAuth.testFetch();
      if (response.statusCode === 200) {
        setTestResult(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch Paytm data:', err);
      setError(err?.response?.data?.error || 'Failed to fetch test data');
    } finally {
      setLoading(null);
    }
  };

  const handleShiprocketTestFetch = async () => {
    setLoading('shiprocket-test');
    setError(null);
    try {
      const response = await api.shiprocketAuth.testFetch();
      if (response.statusCode === 200) {
        setTestResult(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch Shiprocket data:', err);
      setError(err?.response?.data?.error || 'Failed to fetch test data');
    } finally {
      setLoading(null);
    }
  };

  const handleUnicommerceTestFetch = async () => {
    setLoading('unicommerce-test');
    setError(null);
    try {
      const response = await api.unicommerceAuth.testFetch();
      if (response.statusCode === 200) {
        setTestResult(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch Unicommerce data:', err);
      setError(err?.response?.data?.error || 'Failed to fetch test data');
    } finally {
      setLoading(null);
    }
  };

  const integrations = [
    {
      id: 'amazon',
      name: 'Amazon SP-API',
      category: 'Marketplaces',
      description: 'Automate your Amazon sales and settlement data sync directly from the Selling Partner API.',
      logo: 'https://cdn.worldvectorlogo.com/logos/amazon-icon.svg',
      status: 'Available',
      onConnect: handleAmazonAuth,
      onConfig: () => {
        setConfigType('amazon');
        setConfigOpen(true);
      },
    },
    {
      id: 'shopify',
      name: 'Shopify Store',
      category: 'OMS',
      description: 'Seamless OAuth integration to pull orders, customers, and financial data automatically via GraphQL.',
      logo: 'https://cdn.worldvectorlogo.com/logos/shopify.svg',
      status: shopifyConnected ? 'Connected' : 'Available',
      onConnect: () => setShopifyDialogOpen(true),
      onConfig: () => {
        // Shopify doesn't need manual config if using public app OAuth
        // But we could show connected stores here
      },
    },
    {
      id: 'unicommerce',
      name: 'Unicommerce OMS',
      category: 'OMS',
      description: 'Centralized inventory and order management integration to automate multi-channel reconciliation.',
      logo: unicommerceLogo,
      status: unicommerceConnected ? 'Connected' : 'Available',
      onConnect: () => {
        setConfigType('unicommerce');
        setConfigOpen(true);
      },
      onConfig: () => {
        setConfigType('unicommerce');
        setConfigOpen(true);
      },
      onInfo: () => {
        setInfoContent({
          title: 'How to Authenticate Unicommerce',
          steps: [
            'Log in to your Unicommerce account.',
            'Note your tenant name (the subdomain in your URL).',
            'Go to Settings → API → Add New API Client (if required).',
            'Enter your Tenant, Username, and Password in the config dialog.',
            'The default Client ID is "my-trusted-client".'
          ]
        });
        setInfoDialogOpen(true);
      }
    },
    {
      id: 'razorpay',
      name: 'Razorpay PG',
      category: 'Payment Providers',
      description: 'Sync your payment settlements, refunds, and adjustments for automated bookkeeping and reconciliation.',
      logo: 'https://cdn.worldvectorlogo.com/logos/razorpay.svg',
      status: razorpayConnected ? 'Connected' : 'Available',
      onConnect: () => {
        setConfigType('razorpay');
        setConfigOpen(true);
      },
      onConfig: () => {
        setConfigType('razorpay');
        setConfigOpen(true);
      },
    },
    {
      id: 'clickpost',
      name: 'Clickpost',
      category: 'Logistic Providers',
      description: 'Logistics and NDR tracking integration to reconcile shipping costs and performance data.',
      logo: 'https://www.clickpost.ai/hs-fs/hubfs/ClickPost%20Logo/ClickPost-logo-blue.png?width=200&name=ClickPost-logo-blue.png',
      status: clickpostConnected ? 'Connected' : 'Available',
      onConnect: () => {
        setConfigType('clickpost');
        setConfigOpen(true);
      },
      onConfig: () => {
        setConfigType('clickpost');
        setConfigOpen(true);
      },
      onInfo: () => {
        setInfoContent({
          title: 'How to Authenticate Clickpost',
          steps: [
            'Get in touch with your onboarding manager or ClickPost support team to get the username and password.',
            'Copy the credentials provided by the support team.',
            'Paste them in the configuration dialog here.'
          ]
        });
        setInfoDialogOpen(true);
      }
    },
    {
      id: 'shiprocket',
      name: 'Shiprocket',
      category: 'Logistic Providers',
      description: 'Integrated logistics solution to manage shipments, NDR, and reconcile shipping expenses.',
      logo: shiprocketLogo,
      status: shiprocketConnected ? 'Connected' : 'Available',
      onConnect: () => {
        setConfigType('shiprocket');
        setConfigOpen(true);
      },
      onConfig: () => {
        setConfigType('shiprocket');
        setConfigOpen(true);
      },
      onInfo: () => {
        setInfoContent({
          title: 'How to Authenticate Shiprocket',
          steps: [
            'Log in to your Shiprocket account.',
            'Go to Settings → API → Add New API User.',
            'Create a unique API user (use a different email from your main login).',
            'Get the password from your registered email.',
            'Enter the API User Email and Password in the configuration dialog here.'
          ]
        });
        setInfoDialogOpen(true);
      }
    },
    {
      id: 'payu',
      name: 'PayU',
      category: 'Payment Providers',
      description: 'Payment gateway integration to reconcile transaction-level settlements and fees.',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUDi7IAZuQylvhyCSyv1fbS0t60h069WbhwQ&s',
      status: payuConnected ? 'Connected' : 'Available',
      onConnect: () => {
        setConfigType('payu');
        setConfigOpen(true);
      },
      onConfig: () => {
        setConfigType('payu');
        setConfigOpen(true);
      },
      onInfo: () => {
        setInfoContent({
          title: 'How to Authenticate PayU',
          steps: [
            'Log in to your PayU Dashboard.',
            'Navigate to Settings → API Keys to find your Merchant Key and Salt.',
            'Go to Developer Console to create an OAuth app for Client ID and Secret.',
            'Paste all four credentials in the configuration dialog here.',
            'Note: The system automatically connects to Staging or Production based on your account setup.'
          ]
        });
        setInfoDialogOpen(true);
      }
    },
    {
      id: 'paytm',
      name: 'Paytm',
      category: 'Payment Providers',
      description: 'Payment gateway integration to reconcile transaction-level settlements and fees.',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Paytm_Logo.png',
      status: paytmConnected ? 'Connected' : 'Available',
      onConnect: () => {
        setConfigType('paytm');
        setConfigOpen(true);
      },
      onConfig: () => {
        setConfigType('paytm');
        setConfigOpen(true);
      },
      onInfo: () => {
        setInfoContent({
          title: 'How to Authenticate Paytm',
          steps: [
            'Log in to your Paytm Dashboard.',
            'Merchant unique client id and client secret is provided to the merchants by Paytm during onboarding.',
            'Copy your Client ID, Client Secret and Merchant ID.',
            'Paste them in the configuration dialog here.'
          ]
        });
        setInfoDialogOpen(true);
      }
    },
    {
      id: 'flipkart',
      name: 'Flipkart Seller API',
      category: 'Marketplaces',
      description: 'Direct integration with Flipkart Seller Hub for automated data fetching.',
      logo: 'https://cdn.worldvectorlogo.com/logos/flipkart.svg',
      status: 'Coming Soon',
      onConnect: () => {},
      onConfig: () => {},
    },
  ];

  const categories = ['Marketplaces', 'OMS', 'Logistic Providers', 'Payment Providers'];

  return (
    <Box sx={{ p: 4, width: '100%', minHeight: '100vh' }}>
      <Fade in={true} timeout={400}>
        <Box sx={{ mb: 4, ml: 1 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#1a202c',
              mb: 0
            }}
          >
            Integrations
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 1.5, borderLeft: '4px solid #ef4444' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 3, borderRadius: 1.5, borderLeft: '4px solid #22c55e' }}>
              {success}
            </Alert>
          )}
        </Box>
      </Fade>

      {categories.map((category) => {
        const filteredIntegrations = integrations.filter(i => i.category === category);
        if (filteredIntegrations.length === 0) return null;

        return (
          <Box key={category} sx={{ mb: 6 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 700, 
                color: '#4a5568', 
                mb: 3, 
                ml: 1, 
                display: 'flex', 
                alignItems: 'center',
                '&::after': {
                  content: '""',
                  flex: 1,
                  height: '1px',
                  bgcolor: '#e2e8f0',
                  ml: 2,
                  opacity: 0.6
                }
              }}
            >
              {category}
            </Typography>
            <Grid container spacing={2}>
              {filteredIntegrations.map((integration, index) => (
          <Grid item xs={12} sm={6} md={3} lg={2.4} key={integration.id}>
            <Fade in={true} timeout={300 + index * 50}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(0,0,0,0.04)',
                    borderColor: theme.palette.primary.main,
                  },
                  borderRadius: 1.5,
                  border: '1px solid #edf2f7',
                  background: '#fff',
                }}
              >
                {integration.onInfo && (
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      integration.onInfo?.();
                    }}
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      color: '#cbd5e1',
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    <InfoIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <img
                      src={integration.logo}
                      alt={integration.name}
                      style={{ width: 36, height: 36, objectFit: 'contain' }}
                    />
                  </Box>

                  <Typography variant="subtitle1" sx={{ mb: 0.8, fontWeight: 700, color: '#1a202c', fontSize: '0.9rem' }}>
                    {integration.name}
                  </Typography>
                  

                  <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Button
                      variant="outlined"
                      disabled={integration.status !== 'Available' && integration.status !== 'Connected' || loading === integration.id}
                      onClick={integration.onConnect}
                      size="small"
                      sx={{
                        py: 0.6,
                        px: 2,
                        borderRadius: 1,
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        borderWidth: 1.5,
                        '&:hover': {
                          borderWidth: 1.5,
                        },
                        borderColor: integration.status === 'Connected' ? '#15803d' : theme.palette.primary.main,
                        color: integration.status === 'Connected' ? '#15803d' : theme.palette.primary.main,
                        backgroundColor: integration.status === 'Connected' ? 'rgba(21, 128, 61, 0.04)' : 'transparent',
                      }}
                    >
                      {loading === integration.id ? (
                        <CircularProgress size={16} sx={{ color: theme.palette.primary.main }} />
                      ) : integration.status === 'Available' ? (
                        `Connect`
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {integration.status === 'Connected' && <CheckCircleIcon sx={{ fontSize: 14 }} />}
                          {integration.status}
                        </Box>
                      )}
                    </Button>
                    
                    {integration.status === 'Available' && integration.id === 'amazon' && (
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<SettingsIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={integration.onConfig}
                        sx={{ color: '#718096', fontWeight: 600, textTransform: 'none', fontSize: '0.7rem', minWidth: 'auto', p: 0.5 }}
                      >
                        Config
                      </Button>
                    )}

                     {integration.id === 'shopify' && (
                        <Button
                         variant="text"
                         size="small"
                         startIcon={<ScienceIcon sx={{ fontSize: '14px !important' }} />}
                         onClick={() => handleShopifyTestFetch('nexbit-staging.myshopify.com')}
                         disabled={loading === 'test-fetch'}
                         sx={{ color: '#718096', fontWeight: 600, textTransform: 'none', fontSize: '0.7rem', minWidth: 'auto', p: 0.5 }}
                       >
                         Test Connection
                       </Button>
                     )}

                     {integration.id === 'razorpay' && (
                        <Button
                         variant="text"
                         size="small"
                         startIcon={<ScienceIcon sx={{ fontSize: '14px !important' }} />}
                         onClick={handleRazorpayTestFetch}
                         disabled={loading === 'razorpay-test'}
                         sx={{ color: '#718096', fontWeight: 600, textTransform: 'none', fontSize: '0.7rem', minWidth: 'auto', p: 0.5 }}
                       >
                         Test Connection
                       </Button>
                     )}

                     {integration.id === 'clickpost' && (
                        <Button
                         variant="text"
                         size="small"
                         startIcon={<ScienceIcon sx={{ fontSize: '14px !important' }} />}
                         onClick={handleClickpostTestFetch}
                         disabled={loading === 'clickpost-test'}
                         sx={{ color: '#718096', fontWeight: 600, textTransform: 'none', fontSize: '0.7rem', minWidth: 'auto', p: 0.5 }}
                       >
                         Test Connection
                       </Button>
                     )}

                     {integration.id === 'shiprocket' && (
                        <Button
                         variant="text"
                         size="small"
                         startIcon={<ScienceIcon sx={{ fontSize: '14px !important' }} />}
                         onClick={handleShiprocketTestFetch}
                         disabled={loading === 'shiprocket-test'}
                         sx={{ color: '#718096', fontWeight: 600, textTransform: 'none', fontSize: '0.7rem', minWidth: 'auto', p: 0.5 }}
                       >
                         Test Connection
                       </Button>
                     )}

                     {integration.id === 'unicommerce' && (
                        <Button
                         variant="text"
                         size="small"
                         startIcon={<ScienceIcon sx={{ fontSize: '14px !important' }} />}
                         onClick={handleUnicommerceTestFetch}
                         disabled={loading === 'unicommerce-test'}
                         sx={{ color: '#718096', fontWeight: 600, textTransform: 'none', fontSize: '0.7rem', minWidth: 'auto', p: 0.5 }}
                       >
                         Test Connection
                       </Button>
                     )}

                     {integration.id === 'payu' && (
                        <Button
                         variant="text"
                         size="small"
                         startIcon={<ScienceIcon sx={{ fontSize: '14px !important' }} />}
                         onClick={handlePayUTestFetch}
                         disabled={loading === 'payu-test'}
                         sx={{ color: '#718096', fontWeight: 600, textTransform: 'none', fontSize: '0.7rem', minWidth: 'auto', p: 0.5 }}
                       >
                         Test Connection
                       </Button>
                     )}

                     {integration.id === 'paytm' && (
                        <Button
                         variant="text"
                         size="small"
                         startIcon={<ScienceIcon sx={{ fontSize: '14px !important' }} />}
                         onClick={handlePaytmTestFetch}
                         disabled={loading === 'paytm-test'}
                         sx={{ color: '#718096', fontWeight: 600, textTransform: 'none', fontSize: '0.7rem', minWidth: 'auto', p: 0.5 }}
                       >
                         Test Connection
                       </Button>
                     )}
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}

      {/* Shopify Domain Dialog */}
      <Dialog
        open={shopifyDialogOpen}
        onClose={() => setShopifyDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, p: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1a202c' }}>
          Connect Shopify Store
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: '#4a5568' }}>
            Enter your Shopify store URL (e.g., your-store.myshopify.com) to start the secure OAuth connection.
          </Typography>
          <TextField
            autoFocus
            label="Shopify Domain"
            fullWidth
            variant="outlined"
            size="small"
            placeholder="my-shop.myshopify.com"
            value={shopifyDomain}
            onChange={(e) => setShopifyDomain(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                backgroundColor: '#f8fafc'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={() => setShopifyDialogOpen(false)} 
            sx={{ fontWeight: 600, color: '#718096', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleShopifyAuth}
            disabled={loading === 'shopify'}
            sx={{ 
              borderRadius: 1.5, 
              px: 3, 
              fontWeight: 700,
              textTransform: 'none',
              borderWidth: 1.5,
              '&:hover': { borderWidth: 1.5 }
            }}
          >
            {loading === 'shopify' ? <CircularProgress size={18} /> : 'Authorize'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Configuration Dialog (Amazon / Razorpay) */}
      <Dialog 
        open={configOpen} 
        onClose={() => setConfigOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, color: '#1a202c' }}>
          Configure {configType === 'amazon' ? 'Amazon SP-API' : configType === 'razorpay' ? 'Razorpay PG' : configType === 'clickpost' ? 'Clickpost' : configType === 'payu' ? 'PayU' : configType === 'paytm' ? 'Paytm' : ''}
          <IconButton onClick={() => setConfigOpen(false)} size="small">
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
          {configType === 'paytm' && (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Enter your Paytm credentials. You can find these in your Paytm Business Dashboard.
              </Typography>
              <TextField
                label="Merchant ID"
                fullWidth
                value={paytmConfig.merchant_id}
                onChange={(e) => setPaytmConfig({ ...paytmConfig, merchant_id: e.target.value })}
                placeholder="merchant_id"
              />
              <TextField
                label="Client ID"
                fullWidth
                value={paytmConfig.client_id}
                onChange={(e) => setPaytmConfig({ ...paytmConfig, client_id: e.target.value })}
                placeholder="client_id"
              />
              <TextField
                label="Client Secret"
                type="password"
                fullWidth
                value={paytmConfig.client_secret}
                onChange={(e) => setPaytmConfig({ ...paytmConfig, client_secret: e.target.value })}
                placeholder="••••••••"
              />
            </Box>
          )}

          {configType === 'shiprocket' && (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Enter your Shiprocket API User credentials. You can create these in Settings → API → Add New API User.
              </Typography>
              <TextField
                label="API User Email"
                fullWidth
                value={shiprocketConfig.email}
                onChange={(e) => setShiprocketConfig({ ...shiprocketConfig, email: e.target.value })}
                placeholder="api-user@example.com"
              />
              <TextField
                label="API User Password"
                type="password"
                fullWidth
                value={shiprocketConfig.password}
                onChange={(e) => setShiprocketConfig({ ...shiprocketConfig, password: e.target.value })}
                placeholder="••••••••"
              />
            </Box>
          )}

          {configType === 'unicommerce' && (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Enter your Unicommerce credentials. You can find these in your Unicommerce dashboard.
              </Typography>
              <TextField
                label="Tenant Name"
                fullWidth
                value={unicommerceConfig.tenant}
                onChange={(e) => setUnicommerceConfig({ ...unicommerceConfig, tenant: e.target.value })}
                placeholder="e.g. nexbit"
                helperText="Subdomain from your Unicommerce URL"
              />
              <TextField
                label="Username"
                fullWidth
                value={unicommerceConfig.username}
                onChange={(e) => setUnicommerceConfig({ ...unicommerceConfig, username: e.target.value })}
                placeholder="abc@xyz.com"
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={unicommerceConfig.password}
                onChange={(e) => setUnicommerceConfig({ ...unicommerceConfig, password: e.target.value })}
                placeholder="••••••••"
              />
              <TextField
                label="Client ID"
                fullWidth
                value={unicommerceConfig.client_id}
                onChange={(e) => setUnicommerceConfig({ ...unicommerceConfig, client_id: e.target.value })}
                placeholder="my-trusted-client"
              />
            </Box>
          )}

          {configType === 'payu' && (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Enter your PayU credentials. You can find these in your PayU Dashboard under Settings and Developer Console.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Merchant Key"
                    fullWidth
                    value={payuConfig.merchant_key}
                    onChange={(e) => setPayuConfig({ ...payuConfig, merchant_key: e.target.value })}
                    placeholder="merchant_key"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Merchant Salt"
                    type="password"
                    fullWidth
                    value={payuConfig.merchant_salt}
                    onChange={(e) => setPayuConfig({ ...payuConfig, merchant_salt: e.target.value })}
                    placeholder="••••••••"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Client ID"
                    fullWidth
                    value={payuConfig.client_id}
                    onChange={(e) => setPayuConfig({ ...payuConfig, client_id: e.target.value })}
                    placeholder="client_id"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Client Secret"
                    type="password"
                    fullWidth
                    value={payuConfig.client_secret}
                    onChange={(e) => setPayuConfig({ ...payuConfig, client_secret: e.target.value })}
                    placeholder="••••••••"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {configType === 'clickpost' && (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Enter your Clickpost Username and Password. 
                <Box component="span" sx={{ display: 'block', mt: 1, fontWeight: 600, color: 'primary.main' }}>
                  Please get in touch with your onboarding manager or ClickPost support team to get the username and password.
                </Box>
              </Typography>
              <TextField
                label="Username"
                fullWidth
                value={clickpostConfig.username}
                onChange={(e) => setClickpostConfig({ ...clickpostConfig, username: e.target.value })}
                placeholder="your_username"
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={clickpostConfig.password}
                onChange={(e) => setClickpostConfig({ ...clickpostConfig, password: e.target.value })}
                placeholder="••••••••"
              />
            </Box>
          )}

          {configType === 'razorpay' && (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Enter your Razorpay Key ID and Secret from the Razorpay Dashboard (Settings &rarr; API Keys).
              </Typography>
              <TextField
                label="Key ID"
                fullWidth
                value={razorpayConfig.key_id}
                onChange={(e) => setRazorpayConfig({ ...razorpayConfig, key_id: e.target.value })}
                placeholder="rzp_test_..."
              />
              <TextField
                label="Key Secret"
                type="password"
                fullWidth
                value={razorpayConfig.key_secret}
                onChange={(e) => setRazorpayConfig({ ...razorpayConfig, key_secret: e.target.value })}
                placeholder="xWNcv..."
              />
            </Box>
          )}

          {configType === 'amazon' && (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Client ID"
                fullWidth
                value={amazonConfig.client_id}
                onChange={(e) => setAmazonConfig({ ...amazonConfig, client_id: e.target.value })}
                placeholder="amzn1.application-oa2-client.xxx"
              />
              <TextField
                label="Client Secret"
                type="password"
                fullWidth
                value={amazonConfig.client_secret}
                onChange={(e) => setAmazonConfig({ ...amazonConfig, client_secret: e.target.value })}
              />
              <TextField
                label="Redirect URI (Optional)"
                fullWidth
                value={amazonConfig.redirect_uri}
                onChange={(e) => setAmazonConfig({ ...amazonConfig, redirect_uri: e.target.value })}
                helperText="Only change this if you are using a custom Amazon Developer App."
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Marketplace Region"
                    fullWidth
                    value={amazonConfig.region_base_url}
                    onChange={(e) => {
                      const val = e.target.value;
                      let domain = 'sellercentral.amazon.in';
                      if (val.includes('-na')) domain = 'sellercentral.amazon.com';
                      if (val.includes('-eu')) domain = 'sellercentral.amazon.co.uk';
                      setAmazonConfig({ ...amazonConfig, region_base_url: val, seller_central_domain: domain });
                    }}
                  >
                    <MenuItem value="https://sellingpartnerapi-fe.amazon.com">Far East (India/Japan/Australia)</MenuItem>
                    <MenuItem value="https://sellingpartnerapi-na.amazon.com">North America (US/Canada/Mexico/Brazil)</MenuItem>
                    <MenuItem value="https://sellingpartnerapi-eu.amazon.com">Europe (UK/Germany/France/Italy/Spain)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Seller Central Domain"
                    fullWidth
                    value={amazonConfig.seller_central_domain}
                    onChange={(e) => setAmazonConfig({ ...amazonConfig, seller_central_domain: e.target.value })}
                    placeholder="sellercentral.amazon.in"
                  />
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 1, borderRadius: 2 }}>
                Ensure this Redirect URI is whitelisted in your Amazon Developer Console application settings.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setConfigOpen(false)} 
            sx={{ fontWeight: 600, color: '#718096', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleSaveConfig}
            disabled={loading === 'save'}
            sx={{ 
              borderRadius: 1.5, 
              px: 4, 
              fontWeight: 700, 
              textTransform: 'none',
              borderWidth: 1.5,
              '&:hover': { borderWidth: 1.5 }
            }}
          >
            {loading === 'save' ? <CircularProgress size={18} /> : 'Save Configuration'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Animation Dialog */}
      <Dialog 
        open={!!testResult} 
        onClose={() => setTestResult(null)}
        PaperProps={{ sx: { borderRadius: 5, p: 3, textAlign: 'center', maxWidth: 400 } }}
      >
        <Fade in={true}>
          <Box sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <CheckCircleIcon color="success" />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Connection Active
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
              Successfully connected to {testResult?.platform}.
            </Typography>
            <Alert severity="success" sx={{ borderRadius: 2, textAlign: 'left' }}>
              We have successfully fetched {testResult?.count || 0} settlement records for verification.
            </Alert>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => setTestResult(null)}
              sx={{ mt: 4, borderRadius: 3, py: 1.5, fontWeight: 800 }}
            >
              Great!
            </Button>
          </Box>
        </Fade>
      </Dialog>

      {/* Info / Guide Dialog */}
      <Dialog 
        open={infoDialogOpen} 
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2, color: '#1a202c' }}>
          {infoContent.title}
          <IconButton onClick={() => setInfoDialogOpen(false)} size="small">
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            {infoContent.steps.map((step, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box 
                  sx={{ 
                    width: 22, 
                    height: 22, 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(37, 99, 235, 0.08)', 
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    mt: 0.3,
                    border: `1px solid ${theme.palette.primary.main}20`
                  }}
                >
                  {idx + 1}
                </Box>
                <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 1.6, fontSize: '0.85rem' }}>
                  {step}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={() => setInfoDialogOpen(false)}
            sx={{ 
              borderRadius: 1.5, 
              fontWeight: 700, 
              textTransform: 'none',
              py: 1,
              borderWidth: 1.5,
              '&:hover': { borderWidth: 1.5 }
            }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Integrations;
