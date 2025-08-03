// @ts-nocheck
import React from 'react';
import { Box, Typography, Paper, Grid, Button, Chip, Container, Card, CardContent, Stack, Divider } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ScaleIcon from '@mui/icons-material/Timeline';

const Pricing: React.FC = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      py: { xs: 4, md: 8 }
    }}>
      <Container maxWidth="xl">
        {/* Page Header */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Box sx={{ 
            display: 'inline-flex', 
            p: 2, 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            mb: 3
          }}>
            <AttachMoneyIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 900, 
              color: 'text.primary', 
              mb: 3,
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Pricing Plans
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.secondary', 
              fontWeight: 400, 
              maxWidth: 800, 
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}
          >
            Accelerate your month-end close, enhance accuracy, and scale with confidence. Choose the plan that fits your business needs.
          </Typography>
        </Box>

        {/* Pricing Cards Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {[
            {
              name: 'Growth',
              description: 'Perfect for growing businesses',
              price: '₹60k',
              period: '/month',
              transactions: 'Up to 10,000 transactions/month',
              entities: 'Up to 5 connected entities',
              popular: false,
              features: [
                'Automated reconciliation for core accounts',
                'Collaborative close checklist',
                'Realtime reporting dashboards',
                'Standard integrations (Tally, Vyapar, bank statements)'
              ],
              buttonText: 'Get Started',
              buttonVariant: 'outlined' as const,
              borderColor: '#e2e8f0',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            },
            {
              name: 'Scale',
              description: 'For scaling businesses with advanced needs',
              price: '₹150k',
              period: '/month',
              transactions: 'Up to 50,000 transactions/month',
              entities: 'Up to 10 connected entities',
              popular: true,
              features: [
                'Everything in Growth, plus:',
                'Automated intracompany reconciliation',
                'Advanced AI-powered anomaly detection',
                'Customizable reporting and analytics',
                'Advanced ERP & HR tool integrations',
                'Dedicated Customer Success Manager',
                'Role Based Access Control'
              ],
              buttonText: 'Start Free Trial',
              buttonVariant: 'contained' as const,
              borderColor: '#2563eb',
              background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)'
            },
            {
              name: 'Enterprise',
              description: 'For large organizations with complex requirements',
              price: 'Custom',
              period: '',
              transactions: 'Unlimited transactions',
              entities: 'Unlimited entities',
              popular: false,
              features: [
                'Everything in Scale, plus:',
                'Advanced AI for complex accruals & journal entries',
                'Record-to-report automation',
                'Custom AI model training',
                'Dedicated tech support',
                'API Access and custom integrations'
              ],
              buttonText: 'Contact Sales',
              buttonVariant: 'outlined' as const,
              borderColor: '#e2e8f0',
              background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'
            }
          ].map((plan, index) => (
            <Grid item xs={12} lg={4} key={index}>
              <Box sx={{ position: 'relative', height: '100%' }}>
                {/* Most Popular Badge - Fixed positioning */}
                {plan.popular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: 'white',
                      px: 3,
                      py: 1,
                      borderRadius: 20,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                      zIndex: 10,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Most Popular
                  </Box>
                )}
                
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    minHeight: 650,
                    border: plan.popular ? `3px solid ${plan.borderColor}` : `1px solid ${plan.borderColor}`,
                    borderRadius: 4,
                    background: plan.background,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    mt: plan.popular ? 3 : 0, // Add top margin for popular card to accommodate badge
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
                      borderColor: '#2563eb'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 3, mt: plan.popular ? 1 : 0 }}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 800, 
                          color: 'text.primary', 
                          mb: 2,
                          fontSize: { xs: '1.5rem', md: '2rem' }
                        }}
                      >
                        {plan.name}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ mb: 3, lineHeight: 1.6, px: 1 }}
                      >
                        {plan.description}
                      </Typography>
                      
                      {/* Pricing */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 2 }}>
                          <Typography 
                            variant="h2" 
                            sx={{ 
                              fontWeight: 900, 
                              color: 'primary.main',
                              fontSize: { xs: '2.5rem', md: '3rem' }
                            }}
                          >
                            {plan.price}
                          </Typography>
                          {plan.period && (
                            <Typography 
                              variant="h6" 
                              color="text.secondary" 
                              sx={{ ml: 1, fontWeight: 500 }}
                            >
                              {plan.period}
                            </Typography>
                          )}
                        </Box>
                        
                        {/* Limits */}
                        <Stack spacing={0.5} sx={{ px: 2 }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                          >
                            {plan.transactions}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                          >
                            {plan.entities}
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />
                    
                    {/* Features */}
                    <Box sx={{ flex: 1, mb: 3 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 2,
                          color: 'text.primary',
                          fontSize: '1.1rem'
                        }}
                      >
                        Features included:
                      </Typography>
                      <Stack spacing={1.5}>
                        {plan.features.map((feature, featureIndex) => (
                          <Box 
                            key={featureIndex} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'flex-start',
                              px: 1
                            }}
                          >
                            <CheckCircleIcon 
                              sx={{ 
                                color: 'success.main', 
                                fontSize: 18, 
                                mr: 1.5,
                                mt: 0.1,
                                flexShrink: 0
                              }} 
                            />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                lineHeight: 1.5,
                                color: feature.includes('Everything in') ? 'text.primary' : 'text.secondary',
                                fontWeight: feature.includes('Everything in') ? 600 : 400,
                                fontSize: '0.875rem',
                                wordBreak: 'break-word'
                              }}
                            >
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                    
                    {/* CTA Button */}
                    <Box sx={{ px: 1 }}>
                      <Button 
                        variant={plan.buttonVariant}
                        size="large"
                        fullWidth 
                        sx={{ 
                          py: 1.5,
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          borderRadius: 2,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          ...(plan.buttonVariant === 'contained' && {
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                              boxShadow: '0 12px 35px rgba(37, 99, 235, 0.4)'
                            }
                          }),
                          ...(plan.buttonVariant === 'outlined' && {
                            borderWidth: 2,
                            '&:hover': {
                              borderWidth: 2,
                              background: 'primary.main',
                              color: 'white'
                            }
                          })
                        }}
                      >
                        {plan.buttonText}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Value Proposition Section */}
        <Box sx={{ mb: 10 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              color: 'primary.main', 
              mb: 6, 
              textAlign: 'center',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Transform Your Office of CFO
          </Typography>
          
          {/* First row - 3 cards */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {[
              {
                icon: SpeedIcon,
                title: 'Accelerated Close',
                description: 'Reduce month-end close cycle from weeks to days',
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              },
              {
                icon: SecurityIcon,
                title: 'Enhanced Accuracy',
                description: 'Ensure audit-readiness with AI-powered validation and audit trail',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              },
              {
                icon: VisibilityIcon,
                title: 'Full Control & Visibility',
                description: 'Real-time, consolidated view of the entire close process',
                gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Grid item xs={12} sm={6} lg={4} key={index}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      border: '1px solid #e2e8f0',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                      <Box 
                        sx={{ 
                          width: 64, 
                          height: 64, 
                          borderRadius: 2, 
                          background: item.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3
                        }}
                      >
                        <Icon sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {item.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Second row - Centered "Scale with Confidence" */}
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={8} md={6} lg={4}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  border: '1px solid #e2e8f0',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                  <Box 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: 2, 
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    <ScaleIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                    Scale with Confidence
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Handle increased complexity without increase in headcount
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 8,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              pointerEvents: 'none'
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Need help choosing the right plan?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                maxWidth: 700, 
                mx: 'auto',
                opacity: 0.9,
                lineHeight: 1.6,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Our team is here to help you find the perfect solution for your business needs. 
              Contact us for a personalized demo or consultation.
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center"
              alignItems="center"
            >
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  px: 6,
                  py: 2,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                  color: 'primary.main',
                  boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                Schedule a Demo
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                sx={{ 
                  px: 6,
                  py: 2,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Talk to Sales
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Pricing; 