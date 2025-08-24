# Stytch B2B Authentication Setup

## Overview
This project uses Stytch B2B for authentication with **password-based login only** (no email magic links).

## Dashboard Configuration

### 1. Enable Cross-Organization Passwords
- Go to: https://stytch.com/dashboard/password-strength-config
- Enable "Cross-organization passwords" for your project

### 2. Update Redirect URLs
- Go to: https://stytch.com/dashboard/sdk-configuration
- Set redirect URLs to: `http://localhost:5173/authenticate`
- Remove any email magic link redirects

### 3. Password Settings
- Ensure passwords are enabled in your project
- Configure password strength requirements as needed

### 4. Session Duration Settings
- Go to: https://stytch.com/dashboard/sdk-configuration
- Check your maximum session duration limit
- Current code uses 24 hours (1440 minutes)
- If you need longer sessions, increase the limit in your dashboard

## Code Configuration

### Products Used
- **Only**: `B2BProducts.passwords`
- **Removed**: `B2BProducts.emailMagicLinks`

### Authentication Flow
- **Login**: Uses `AuthFlowType.Discovery` - Shows organization selection for existing users
- **Registration**: Uses `AuthFlowType.Discovery` - Shows organization selection/creation
- **Password Reset**: Uses `AuthFlowType.Discovery` - Allows organization selection after reset
- Users set a password during registration
- Users login with email + password
- No email magic links sent
- Sessions last 24 hours (configurable)

**Note**: Discovery flow shows organization selection for all flows. For existing users, this allows them to select their organization. For new users, this allows them to create or join an organization.

### Files Updated
- `src/App.tsx` - Authenticate component
- `src/pages/Login.tsx` - Login page
- `src/pages/Register.tsx` - Registration page

### UI Customization
- **Text Customization**: Uses Stytch's official `strings` parameter for text customization
- **Custom Headings**: "Sign in" instead of "Sign up or log in", "Create Account" for registration
- **Form Labels**: Customized email and password field labels and placeholders
- **Button Text**: Custom button text for better user experience
- **Organization Text**: Customized discovery flow text
- **Clean Interface**: Professional appearance that matches your application design

## Testing

### Registration Flow
1. Go to `/register`
2. Enter email and set password
3. Should redirect to `/marketplace-reconciliation`

### Login Flow
1. Go to `/login`
2. Enter email and password
3. Should redirect to `/marketplace-reconciliation`

### Password Reset
- Users can reset passwords through the Stytch interface
- Reset links redirect to `/authenticate`

### Logout Flow
- Uses Stytch B2B's `session.revoke()` method
- Properly clears session data
- Redirects to login page after logout
- Handles errors gracefully with fallback navigation

### Organization ID Management
- **Dynamic Organization ID**: Extracted from Stytch B2B session after authentication
- **API Headers**: Automatically sets `X-Org-ID` header for all API requests
- **Real-time Updates**: Organization ID is updated whenever the user switches organizations
- **API Integration**: Ensures all authenticated requests include the correct organization context

## Troubleshooting

### Common Issues
1. **"Cross-organization passwords not enabled"** → Enable in dashboard
2. **Wrong redirect port** → Ensure using port 5173, not 3000
3. **Session duration errors** → Check dashboard SDK configuration

### Console Logs
Watch for these messages:
- `"Session status: { session: ..., isInitialized: ... }"`
- `"Valid session detected, redirecting to marketplace..."`
- `"Stytch onSuccess callback triggered:"`
