import React, { useState } from 'react';
import { Box, Typography, Card, CardActionArea, Button, TextField } from '@mui/material';
import { Storefront as StorefrontIcon } from '@mui/icons-material';

const dataSources = [
  { id: 'shopify', name: 'Shopify', logo: 'https://cdn.worldvectorlogo.com/logos/shopify.svg' },
  { id: 'amazon', name: 'Amazon', logo: 'https://cdn.worldvectorlogo.com/logos/logo-amazon.svg' },
  { id: 'flipkart', name: 'Flipkart', logo: 'https://cdn.worldvectorlogo.com/logos/flipkart.svg' },
  { id: 'myntra', name: 'Myntra', logo: 'https://cdn.worldvectorlogo.com/logos/myntra-1.svg' },
  { id: 'nykaa', name: 'Nykaa', logo: 'https://cdn.worldvectorlogo.com/logos/nykaa-1.svg' },
  { id: 'offline', name: 'Offline Stores', logo: '', icon: <StorefrontIcon fontSize="large" /> },
  { id: 'tally', name: 'Tally', logo: 'https://cdn.worldvectorlogo.com/logos/tally-solutions.svg' },
  { id: 'xero', name: 'Xero', logo: 'https://cdn.worldvectorlogo.com/logos/xero-1.svg' },
  { id: 'sap', name: 'SAP', logo: 'https://cdn.worldvectorlogo.com/logos/sap-3.svg' },
  { id: 'netsuite', name: 'Netsuite', logo: 'https://cdn.worldvectorlogo.com/logos/netsuite-1.svg' },
  { id: 'oracle', name: 'Oracle', logo: 'https://cdn.worldvectorlogo.com/logos/oracle-1.svg' },
];

const ConnectDataSources: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCredChange = (id: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    console.log('Selected sources:', selected);
    console.log('Credentials:', credentials);
  };

  const isSubmitDisabled =
    selected.length === 0 || selected.some((id) => !credentials[id]);

  return (
    <Box sx={{ p: 4, minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight={700} mb={4} textAlign="center">
        Connect Your Data Sources
      </Typography>

      {/* Data Source Cards */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)',
          },
        }}
      >
        {dataSources.map((ds) => {
          const isSelected = selected.includes(ds.id);
          return (
            <Card
              key={ds.id}
              sx={{
                height: '100%',
                border: isSelected ? '2px solid #14B8A6' : '1px solid',
                borderColor: isSelected ? '#14B8A6' : 'divider',
                borderRadius: 3,
                boxShadow: 'none',
              }}
            >
              <CardActionArea
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 4,
                }}
                onClick={() => toggleSelect(ds.id)}
              >
                {ds.logo ? (
                  <img 
                    src={ds.logo} 
                    alt={ds.name} 
                    style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 16 }} 
                  />
                ) : (
                  <Box sx={{ width: 64, height: 64, mb: 2, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                    {ds.icon}
                  </Box>
                )}
                <Typography variant="subtitle1" fontWeight={600} textAlign="center">
                  {ds.name}
                </Typography>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {/* Credential Inputs */}
      {selected.length > 0 && (
        <Box mt={4}>
          <Typography variant="subtitle1" mb={2}>
            Provide Credentials
          </Typography>
          {selected.map((id) => {
            const ds = dataSources.find((d) => d.id === id)!;
            return (
              <Box key={id} mb={2}>
                <TextField
                  fullWidth
                  label={`${ds.name} Credentials`}
                  placeholder="Enter API key, token, or login details"
                  value={credentials[id] || ''}
                  onChange={(e) => handleCredChange(id, e.target.value)}
                />
              </Box>
            );
          })}

          <Box mt={4} textAlign="right">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              sx={{ px: 4, py: 1.25 }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ConnectDataSources; 