# Stytch Metadata Logging Guide

## Overview
This document describes the comprehensive metadata logging that has been implemented to capture all Stytch session information after login. The logging will appear in the browser console and provide detailed insights into the authentication session.

## 🚀 What Gets Logged

### 1. **Global Session Monitor** (`SessionMonitor.tsx`)
- **Location**: Mounted globally in `App.tsx`
- **Triggers**: Every time the session changes
- **Purpose**: Provides comprehensive session metadata logging across the entire application

### 2. **Organization Hook** (`useOrganization.ts`)
- **Location**: Used in `ProtectedRoute.tsx`
- **Triggers**: When organization ID is set/updated
- **Purpose**: Logs organization-specific metadata and API credential setup

### 3. **Component-Specific Logging**
- **Login Component**: Session metadata when user logs in
- **Register Component**: Session metadata when user registers
- **Authenticate Component**: Session metadata during authentication flows
- **Layout Component**: Session metadata during navigation

## 📊 Metadata Categories Logged

### **Session Overview**
```
📋 SESSION OVERVIEW:
- Member Session ID (member_session_id)
- Member ID (member_id)
- Organization ID (organization_id)
- Started At (started_at)
- Last Accessed (last_accessed_at)
- Expires At (expires_at)
- Organization Slug (organization_slug)
- Roles (roles)
- Custom Claims (custom_claims)
```

### **Authentication Details**
```
🔐 AUTHENTICATION METADATA:
- Authentication Factors (authentication_factors)
- Roles (roles)
- Custom Claims (custom_claims)
```

### **API Credentials**
```
🔑 API CREDENTIALS:
- API Key (set from environment)
- Organization ID (from Stytch session)
- API Headers (for requests)
```

## 🎯 When Logging Occurs

### **1. Initial Login/Registration**
- User enters credentials
- Stytch validates authentication
- Session is created
- **Logging triggers**: `onSuccess` callbacks, session monitoring

### **2. Session Establishment**
- `useStytchMemberSession` hook detects session
- `useOrganization` hook sets API credentials
- **Logging triggers**: Session change effects

### **3. Navigation**
- User navigates between pages
- Layout component detects session
- **Logging triggers**: Component mount/update effects

### **4. Logout Process**
- User clicks logout
- Session is revoked
- Local storage is cleared
- **Logging triggers**: Logout button click

## 🔍 Console Output Examples

### **Successful Login**
```
🎉 Stytch onSuccess callback triggered: [data object]
📊 Success Data Structure: { type: "object", keys: [...], fullData: {...} }
🚀 ===== LOGIN COMPONENT SESSION METADATA =====
🆔 Member Session ID: session_abc123
👤 Member ID: member_xyz789
🏢 Organization ID: org_def456
📅 Started At: 2024-01-15T10:30:00Z
🔄 Last Accessed: 2024-01-15T10:30:00Z
⏳ Expires At: 2024-01-16T10:30:00Z
🏢 Organization Slug: company-inc
🔑 Roles: ["admin", "member"]
📋 Custom Claims: { "department": "engineering" }
🚀 ===== END LOGIN SESSION METADATA =====
```

### **Organization Hook Triggered**
```
🔍 useOrganization hook triggered: { isInitialized: true, session: {...}, hasOrgId: true }
🚀 ===== STYTCH SESSION METADATA ANALYSIS =====
📋 SESSION OVERVIEW: {
  memberSessionId: "session_abc123",
  memberId: "member_xyz789",
  organizationId: "org_def456",
  startedAt: "2024-01-15T10:30:00Z",
  lastAccessedAt: "2024-01-15T10:30:00Z",
  expiresAt: "2024-01-16T10:30:00Z",
  organizationSlug: "company-inc",
  roles: ["admin", "member"],
  customClaims: { "department": "engineering" }
}
🔐 AUTHENTICATION METADATA: {
  authenticationFactors: [...],
  roles: ["admin", "member"],
  customClaims: { "department": "engineering" }
}
🔍 RAW SESSION OBJECT: {...}
📝 AVAILABLE SESSION PROPERTIES: ["member_session_id", "member_id", "organization_id", ...]
🚀 ===== END STYTCH SESSION METADATA ANALYSIS =====
✅ Setting organization ID from Stytch session: org_def456
🔑 Setting API key for the first time
✅ Organization ID set successfully for API requests. Stored: org_def456
📤 API headers that will be sent: { "X-API-Key": "...", "X-Org-ID": "org_def456" }
```

### **Global Session Monitor**
```
🚀 ===== GLOBAL SESSION MONITOR - SESSION DETECTED =====
⏰ Timestamp: 2024-01-15T10:30:00.000Z
📍 Component: SessionMonitor (Global)
📋 SESSION OVERVIEW: {...}
🔐 AUTHENTICATION METADATA: {...}
📝 AVAILABLE SESSION PROPERTIES: [...]
🚀 ===== END GLOBAL SESSION MONITOR =====
```

### **Layout Component**
```
🏠 ===== LAYOUT COMPONENT SESSION METADATA =====
⏰ Timestamp: 2024-01-15T10:30:00.000Z
📍 Component: Layout (Navigation)
🆔 Member Session ID: session_abc123
👤 Member ID: member_xyz789
🏢 Organization ID: org_def456
🏢 Organization Slug: company-inc
🔑 Roles: ["admin", "member"]
📋 Custom Claims: { "department": "engineering" }
🏠 ===== END LAYOUT SESSION METADATA =====
```

### **Logout Process**
```
🚪 ===== LOGOUT PROCESS INITIATED =====
⏰ Timestamp: 2024-01-15T10:30:00.000Z
👤 Current User: {
  memberId: "member_xyz789",
  organizationId: "org_def456",
  organizationSlug: "company-inc",
  roles: ["admin", "member"]
}
✅ Successfully logged out from Stytch B2B
🧹 Local storage and session storage cleared
🚪 ===== LOGOUT PROCESS COMPLETED =====
```

## 🛡️ Security Considerations

### **Sensitive Data Protection**
- **Session Tokens**: Not exposed in logs (Stytch B2B doesn't provide session tokens in client-side session)
- **API Keys**: Only logged when setting credentials
- **Passwords**: Never logged
- **Personal Data**: Limited to what's necessary for debugging

### **Production vs Development**
- **Development**: Full metadata logging for debugging
- **Production**: Consider reducing logging verbosity
- **Environment Variables**: Control logging levels

## 🔧 Customization Options

### **Enable/Disable Logging**
```typescript
// In production, you can conditionally disable logging
const shouldLog = process.env.NODE_ENV === 'development';

if (shouldLog) {
  console.log('Session metadata:', sessionData);
}
```

### **Logging Levels**
```typescript
// Different levels of detail
const LOG_LEVEL = 'detailed'; // 'minimal' | 'standard' | 'detailed'

switch (LOG_LEVEL) {
  case 'minimal':
    console.log('Session:', { id: session.member_session_id, org: session.organization_id });
    break;
  case 'detailed':
    // Full metadata logging
    break;
}
```

### **Custom Logging Destinations**
```typescript
// Send logs to external service
const logToService = (metadata: any) => {
  // Send to logging service, analytics, etc.
  analytics.track('session_metadata', metadata);
};
```

## 📱 Browser Console Tips

### **Filtering Logs**
- Use console filters to focus on specific log types
- Filter by emoji prefixes (🔍, 🚀, 👤, 🏢, etc.)
- Use console grouping for better organization

### **Log Persistence**
- Enable "Preserve log" in console settings
- Use console export for debugging sessions
- Consider logging to external service for production

### **Performance Monitoring**
- Monitor console performance impact
- Use conditional logging for production
- Consider async logging for heavy operations

## 🎯 Use Cases

### **1. Debugging Authentication Issues**
- Session creation problems
- Organization ID mismatches
- API credential setup issues

### **2. User Experience Monitoring**
- Login flow completion rates
- Session duration patterns
- Organization selection behavior

### **3. Security Auditing**
- Session validation
- User permission verification
- Organization access patterns

### **4. Development Support**
- Stytch integration verification
- API request debugging
- Session state monitoring

## 🚀 Next Steps

### **Immediate Benefits**
- ✅ Comprehensive session visibility
- ✅ Debugging authentication flows
- ✅ Monitoring organization setup
- ✅ Tracking API credential management

### **Future Enhancements**
- 🔄 Log aggregation and analysis
- 🔄 Performance metrics
- 🔄 User behavior analytics
- 🔄 Security event monitoring

## 📝 Important Notes

### **Stytch B2B Session Structure**
The Stytch B2B `MemberSession` interface provides the following key properties:
- `member_session_id`: Unique session identifier
- `member_id`: Unique member identifier
- `organization_id`: Organization identifier
- `started_at`: Session creation timestamp
- `last_accessed_at`: Last access timestamp
- `expires_at`: Session expiration timestamp
- `organization_slug`: Human-readable organization identifier
- `roles`: Array of user roles
- `authentication_factors`: Authentication method details
- `custom_claims`: Custom session data

### **What's NOT Available in Client-Side Session**
- Session tokens (only available server-side)
- Member email addresses (privacy protection)
- Detailed member profile information
- Organization metadata beyond basic identifiers

---

**Note**: This logging system provides comprehensive visibility into Stytch B2B authentication sessions. Use it for development, debugging, and monitoring purposes. Consider reducing verbosity in production environments based on your needs.
