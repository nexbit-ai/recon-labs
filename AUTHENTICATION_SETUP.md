# Stytch Authentication Setup Guide

This guide will walk you through setting up Stytch authentication for your Recon Labs application.

## 🚀 Quick Start

### 1. Install Dependencies
The Stytch SDKs have already been installed:
```bash
npm install @stytch/react @stytch/vanilla-js
```

### 2. Create Stytch Account
1. Go to [Stytch Dashboard](https://stytch.com/dashboard)
2. Sign up for a free account
3. Create a new project
4. Note down your project credentials

### 3. Configure Environment Variables
Create a `.env` file in your project root:

```env
# Stytch Configuration
VITE_STYTCH_PROJECT_ID=project-test-12345678-1234-1234-1234-123456789012
VITE_STYTCH_SECRET=secret-test-12345678-1234-1234-1234-123456789012
VITE_STYTCH_PUBLIC_TOKEN=pk_test_12345678-1234-1234-1234-123456789012

# Existing API Configuration
VITE_API_BASE_URL=https://api.reconlabs.com
VITE_API_KEY=your_api_key_here
VITE_ORG_ID=your_org_id_here
```

### 4. Configure Stytch Dashboard
In your Stytch dashboard:

1. **Enable Email/Password Authentication**
   - Go to Authentication → Email/Password
   - Enable the feature
   - Configure password requirements

2. **Set up Redirect URLs**
   - Go to Settings → Redirect URLs
   - Add: `http://localhost:5173/reset-password`
   - Add: `https://yourdomain.com/reset-password` (for production)

3. **Configure Email Templates**
   - Go to Settings → Email Templates
   - Customize the password reset email template
   - Update the reset URL to match your domain

## 🔧 Features Implemented

### ✅ Authentication Methods
- **Email/Password Login**: Secure login with email and password
- **Email/Password Registration**: New user registration
- **Password Reset**: Email-based password reset flow
- **Session Management**: Automatic session handling
- **Token Refresh**: Seamless token renewal

### ✅ Security Features
- **Secure Token Storage**: Tokens stored in localStorage with expiration
- **Session Expiration**: Automatic logout on token expiry
- **CSRF Protection**: Built-in protection from Stytch
- **Rate Limiting**: Automatic rate limiting by Stytch
- **Password Validation**: Client-side password strength validation

### ✅ User Experience
- **Beautiful UI**: Modern, responsive design matching your app
- **Loading States**: Proper loading indicators
- **Error Handling**: Comprehensive error messages
- **Form Validation**: Real-time input validation
- **Responsive Design**: Works on all device sizes

## 📁 File Structure

```
src/
├── services/
│   └── auth/
│       ├── stytchAuthService.ts    # Core authentication service
│       └── README.md              # Detailed documentation
├── contexts/
│   └── AuthContext.tsx            # React context for auth state
├── components/
│   └── ProtectedRoute.tsx         # Route protection component
├── pages/
│   ├── Login.tsx                  # Login page
│   ├── Register.tsx               # Registration page
│   ├── ForgotPassword.tsx         # Password reset request
│   └── ResetPassword.tsx          # Password reset confirmation
└── config/
    └── environment.ts             # Environment configuration
```

## 🔄 Authentication Flow

### Login Flow
1. User enters email/password
2. Stytch validates credentials
3. Session token is stored
4. User is redirected to dashboard

### Registration Flow
1. User fills registration form
2. Stytch creates new user account
3. User is automatically logged in
4. Redirected to dashboard

### Password Reset Flow
1. User requests password reset
2. Stytch sends reset email
3. User clicks link in email
4. User sets new password
5. User is logged in automatically

## 🛡️ Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files to version control
- ✅ Use different credentials for development/production
- ✅ Rotate secrets regularly

### Token Management
- ✅ Tokens expire automatically
- ✅ Secure storage in localStorage
- ✅ Automatic refresh handling

### Input Validation
- ✅ Client-side validation
- ✅ Server-side validation (handled by Stytch)
- ✅ Password strength requirements

## 🧪 Testing

### Development Testing
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`

3. Test the authentication flow:
   - Register a new account
   - Login with credentials
   - Test password reset
   - Verify protected routes

### Production Testing
1. Deploy with proper environment variables
2. Test all authentication flows
3. Verify email delivery
4. Test on different devices/browsers

## 🚨 Troubleshooting

### Common Issues

**"Stytch client not initialized"**
- Check environment variables are set correctly
- Verify Stytch project is active
- Ensure public token is valid

**"Authentication failed"**
- Verify email/password combination
- Check Stytch dashboard for account status
- Ensure email is verified (if required)

**"Password reset not working"**
- Check redirect URL configuration
- Verify email template settings
- Test email delivery

**"Protected routes not working"**
- Check authentication context is properly wrapped
- Verify token storage
- Check browser console for errors

### Debug Mode
Enable debug logging by modifying the auth service:

```typescript
// In stytchAuthService.ts
const DEBUG = true;

if (DEBUG) {
  console.log('Auth request:', { email, method });
}
```

## 🔮 Future Enhancements

### Planned Features
- [ ] Multi-factor authentication (MFA)
- [ ] Social login (Google, GitHub, etc.)
- [ ] Magic link authentication
- [ ] Biometric authentication
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Account lockout policies

### Integration Opportunities
- [ ] Backend JWT validation
- [ ] User session synchronization
- [ ] Custom user attributes
- [ ] Organization/tenant management

## 📞 Support

### Stytch Documentation
- [Stytch Docs](https://stytch.com/docs)
- [Stytch API Reference](https://stytch.com/docs/api)
- [Stytch React SDK](https://stytch.com/docs/sdks/javascript)

### Getting Help
1. Check the troubleshooting section above
2. Review Stytch documentation
3. Check browser console for errors
4. Verify environment configuration

## 🎉 Success!

Once you've completed the setup:

1. ✅ Users can register new accounts
2. ✅ Users can login securely
3. ✅ Users can reset passwords
4. ✅ All routes are protected
5. ✅ Sessions are managed automatically
6. ✅ UI matches your existing design

Your authentication system is now ready for production use! 