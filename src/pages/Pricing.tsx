import React from 'react';
import { Box, Typography, Card, CardContent, Button, List, ListItem, ListItemText, Grid, Container } from '@mui/material';

const Pricing = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Box textAlign="center" mb={10}>
        <Typography variant="h1" gutterBottom sx={{ color: '#111', fontWeight: 800, letterSpacing: '-0.02em', fontSize: '3rem' }}>
          Pricing Plans
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', fontSize: '1.125rem' }}>
          Choose the right plan for your business. Upgrade anytime as your reconciliation needs grow.
        </Typography>
      </Box>

      <Grid container spacing={6} justifyContent="center" alignItems="stretch">
        {/* Lower Tier */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative',
              borderRadius: 4,
              border: '1px solid #E5E7EB',
              boxShadow: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#111',
                boxShadow: '0 24px 48px -12px rgba(0,0,0,0.05)',
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: 6, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" component="h2" gutterBottom fontWeight="700" sx={{ color: '#111' }}>
                Standard
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2, mt: 4 }}>
                <Typography variant="h2" component="span" fontWeight="800" sx={{ fontSize: '3rem', letterSpacing: '-0.02em' }}>
                  ₹1.3 Lakh
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
                  / month
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" mb={6}>
                Perfect for growing businesses with moderate transaction volumes.
              </Typography>
              
              <Box sx={{ mt: 'auto' }}>
                <List sx={{ p: 0 }}>
                  {[
                    "Up to 80,000 transactions",
                    "Transaction categorization",
                    "Automated reconciliation",
                    "Customizable dashboards"
                  ].map((text, idx) => (
                    <ListItem key={idx} disablePadding sx={{ py: 2 }}>
                      <ListItemText 
                        primary={text} 
                        primaryTypographyProps={{ 
                          fontWeight: 500,
                          sx: { 
                            color: '#111',
                            fontSize: '1.1rem'
                          }
                        }} 
                      />
                    </ListItem>
                  ))}
                  {[
                    "Priority SLA support",
                    "Bookkeeping",
                    "AI support",
                    "AI-powered matching of selling prices, rate cards and commission"
                  ].map((text, idx) => (
                    <ListItem key={idx} disablePadding sx={{ py: 2, opacity: 0.4 }}>
                      <ListItemText 
                        primary={text} 
                        primaryTypographyProps={{ 
                          fontWeight: 500,
                          sx: { textDecoration: 'line-through', fontSize: '1.1rem' }
                        }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <Box sx={{ mt: 6 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  size="large"
                  sx={{ 
                    py: 2,
                    borderRadius: 2,
                    borderWidth: '1px',
                    borderColor: '#111',
                    color: '#111',
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': { borderWidth: '1px', borderColor: '#111', backgroundColor: '#fafafa' }
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Higher Tier */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative',
              borderRadius: 4,
              border: '2px solid #111',
              boxShadow: '0 24px 48px -12px rgba(17,17,17,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 32px 64px -12px rgba(17,17,17,0.15)',
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 32, 
                backgroundColor: '#111', 
                color: 'white', 
                px: 2, 
                py: 1, 
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.05em'
              }}
            >
              RECOMMENDED
            </Box>
            <CardContent sx={{ flexGrow: 1, p: 6, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" component="h2" gutterBottom fontWeight="700" sx={{ color: '#111' }}>
                Premium
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2, mt: 4 }}>
                <Typography variant="h2" component="span" fontWeight="800" sx={{ fontSize: '3rem', letterSpacing: '-0.02em' }}>
                  ₹2 Lakh
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
                  / month
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" mb={6}>
                For large enterprises needing unlimited processing and deeper insights.
              </Typography>
              
              <Box sx={{ mt: 'auto' }}>
                <List sx={{ p: 0 }}>
                  {[
                    "Unlimited transactions",
                    "Transaction categorization",
                    "Automated reconciliation",
                    "Customizable dashboards",
                    "Priority SLA support",
                    "Bookkeeping",
                    "AI Nex support",
                    "AI-powered matching of selling prices, rate cards and commission"
                  ].map((text, idx) => (
                    <ListItem key={idx} disablePadding sx={{ py: 2 }}>
                      <ListItemText 
                        primary={text} 
                        primaryTypographyProps={{ 
                          fontWeight: 600,
                          sx: { 
                            color: '#111',
                            fontSize: '1.1rem'
                          }
                        }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <Box sx={{ mt: 6 }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  sx={{ 
                    py: 2,
                    borderRadius: 2,
                    backgroundColor: '#111',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#000',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  Upgrade to Premium
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Pricing;
