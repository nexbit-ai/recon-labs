# Stytch Authentication Integration

This directory contains the authentication service layer that integrates Stytch authentication with your existing application.

## Setup Instructions

### 1. Create Stytch Account
1. Go to [Stytch Dashboard](https://stytch.com/dashboard)
2. Create a new project
3. Get your project credentials

### 2. Environment Variables
Create a `.env` file in your project root with the following variables:

```env
# Stytch Configuration
VITE_STYTCH_PROJECT_ID=your_stytch_project_id
VITE_STYTCH_SECRET=your_stytch_secret
VITE_STYTCH_PUBLIC_TOKEN=your_stytch_public_token

# API Configuration (existing)
VITE_API_BASE_URL=your_api_base_url
VITE_API_KEY=your_api_key
VITE_ORG_ID=your_org_id
```

### 3. Stytch Project Configuration
In your Stytch dashboard:
1. Enable Email/Password authentication
2. Configure your redirect URLs
3. Set up email templates for password reset

## Features

### Authentication Methods
- ✅ Email/Password login
- ✅ Email/Password registration
- ✅ Password reset via email
- ✅ Session management
- ✅ Automatic token refresh

### Security Features
- ✅ Secure token storage
- ✅ Session expiration handling
- ✅ CSRF protection
- ✅ Rate limiting (handled by Stytch)

### User Management
- ✅ User profile management
- ✅ Email verification
- ✅ Password strength validation

## Architecture

### Components
- `stytchAuthService.ts` - Core authentication service
- `AuthContext.tsx` - React context for auth state
- `ProtectedRoute.tsx` - Route protection component
- `Login.tsx` - Login page
- `Register.tsx` - Registration page
- `ForgotPassword.tsx` - Password reset page

### Integration Points
- Integrates with existing `tokenManager` for token storage
- Uses existing `apiService` for API calls
- Follows existing UI design patterns
- Maintains existing routing structure

## Usage

### Basic Authentication Flow
```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Login
  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      // Redirect to dashboard
    }
  };
  
  // Logout
  const handleLogout = async () => {
    await logout();
    // Redirect to login
  };
};
```

### Protected Routes
```typescript
import ProtectedRoute from '../components/ProtectedRoute';

<ProtectedRoute>
  <MyProtectedComponent />
</ProtectedRoute>
```

## Error Handling

The authentication service includes comprehensive error handling:
- Network errors
- Invalid credentials
- Token expiration
- User not found
- Email already exists

## Security Best Practices

1. **Environment Variables**: Never commit sensitive credentials to version control
2. **Token Storage**: Tokens are stored securely in localStorage with expiration
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: All inputs are validated on both client and server
5. **Rate Limiting**: Stytch handles rate limiting automatically

## Troubleshooting

### Common Issues

1. **"Stytch client not initialized"**
   - Check that environment variables are set correctly
   - Ensure Stytch project is properly configured

2. **"Authentication failed"**
   - Verify email/password combination
   - Check Stytch dashboard for any account restrictions

3. **"Token refresh failed"**
   - Clear localStorage and re-authenticate
   - Check network connectivity

### Debug Mode
Enable debug logging by setting:
```typescript
const DEBUG_CONFIG = {
  LOG_REQUESTS: true,
  LOG_RESPONSES: true,
  LOG_TOKEN_REFRESH: true,
  LOG_ERRORS: true,
};
```

## Next Steps

### Potential Enhancements
- [ ] Multi-factor authentication (MFA)
- [ ] Social login (Google, GitHub, etc.)
- [ ] Magic link authentication
- [ ] Biometric authentication
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Account lockout policies

### Integration with Backend
- [ ] JWT token validation on backend
- [ ] User session synchronization
- [ ] Custom user attributes
- [ ] Organization/tenant management 