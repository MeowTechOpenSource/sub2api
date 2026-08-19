export default {
  audit: {
    title: 'Audit Logs',
    description: 'Records management-plane operations by admins and users. Header credentials keep only their first/last characters and request bodies are redacted. Entries cannot be deleted individually; clearing all requires two-factor verification.',
    clearAll: 'Clear All',
    empty: 'No audit logs yet',
    loadFailed: 'Failed to load audit logs',
    filters: {
      all: 'All',
      q: 'Keyword',
      qPlaceholder: 'Path / action / actor email',
      actorEmail: 'Actor Email',
      action: 'Action',
      clientIp: 'Client IP',
      method: 'Method',
      authMethod: 'Auth Method',
      result: 'Result',
      resultSuccess: 'Success',
      resultFailure: 'Failure',
      startTime: 'Start Time',
      endTime: 'End Time'
    },
    columns: {
      time: 'Time',
      actor: 'Actor',
      action: 'Action',
      method: 'Method',
      result: 'Result',
      clientIp: 'Client IP',
      detail: 'Detail'
    },
    detail: {
      title: 'Audit Log Detail',
      actorRole: 'Role',
      methodPath: 'Method / Path',
      latency: 'Latency',
      requestId: 'Request ID',
      credential: 'Credential (masked)',
      userAgent: 'User-Agent',
      requestBody: 'Request Body (redacted)',
      extra: 'Extra'
    },
    clearConfirm: {
      title: 'Clear All Audit Logs',
      message: 'This permanently deletes all audit logs and cannot be undone. The clear action itself is recorded. Continue?',
      totpTitle: 'Enter Two-Factor Code',
      totpHint: 'Clearing audit logs requires a fresh TOTP verification.',
      success: 'Cleared {count} audit log(s)',
      failed: 'Failed to clear audit logs'
    },
    values: {
      actionFormat: '{verb} {resource}',
      unknownAction: 'Unknown action',
      authMethods: {
        jwt: 'Signed-in session',
        adminApiKey: 'Admin API key'
      },
      roles: {
        admin: 'Administrator',
        user: 'User',
        system: 'System',
        unknown: 'Unknown role'
      },
      verbs: {
        create: 'Create', update: 'Update', delete: 'Delete', read: 'View', import: 'Import', export: 'Export',
        clear: 'Clear', restore: 'Restore', download: 'Download', regenerate: 'Regenerate', verify: 'Verify',
        login: 'Sign in', register: 'Register', refresh: 'Refresh'
      },
      resources: {
        system: 'system', auth: 'authentication', accounts: 'accounts', backups: 'backups', settings: 'settings',
        users: 'users', groups: 'groups', proxies: 'proxies', redeem_codes: 'redeem codes', audit_log: 'audit logs',
        admin_api_key: 'admin API key', api_keys: 'API keys', s3_config: 'S3 configuration',
        data_management: 'data management', totp: 'two-factor authentication', session_binding: 'session binding'
      },
      specialActions: {
        login: 'Sign in', login2fa: 'Complete two-factor sign-in', register: 'Register account',
        tokenRefresh: 'Refresh signed-in session', sessionBindingMismatch: 'Session security mismatch',
        stepUpVerify: 'Verify sensitive operation', auditLogClear: 'Clear all audit logs'
      }
    }
  }
}
