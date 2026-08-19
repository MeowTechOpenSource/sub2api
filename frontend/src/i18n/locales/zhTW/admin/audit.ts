export default {
  audit: {
    title: '操作日誌',
    description: '記錄管理員與用戶的管理操作。請求標頭憑證僅保留首尾字元，請求內容亦已脫敏。日誌無法逐條刪除，全部清除需要雙重驗證。',
    clearAll: '全部清除',
    empty: '暫無操作日誌',
    loadFailed: '載入操作日誌失敗',
    filters: {
      all: '全部',
      q: '關鍵字',
      qPlaceholder: '路徑 / 操作 / 操作者電郵',
      actorEmail: '操作者電郵',
      action: '操作',
      clientIp: '用戶端 IP',
      method: '請求方法',
      authMethod: '驗證方式',
      result: '結果',
      resultSuccess: '成功',
      resultFailure: '失敗',
      startTime: '開始時間',
      endTime: '結束時間'
    },
    columns: {
      time: '時間',
      actor: '操作者',
      action: '操作',
      method: '方法',
      result: '結果',
      clientIp: '用戶端 IP',
      detail: '詳情'
    },
    detail: {
      title: '操作日誌詳情',
      actorRole: '角色',
      methodPath: '方法 / 路徑',
      latency: '耗時',
      requestId: '請求 ID',
      credential: '憑證（已遮蔽）',
      userAgent: 'User-Agent',
      requestBody: '請求內容（已脫敏）',
      extra: '附加資訊'
    },
    clearConfirm: {
      title: '清除全部操作日誌',
      message: '此操作將永久刪除所有操作日誌，且無法復原。清除操作本身會被記錄。確定繼續嗎？',
      totpTitle: '輸入雙重驗證碼',
      totpHint: '清除操作日誌需要即時驗證 TOTP 驗證碼。',
      success: '已清除 {count} 條操作日誌',
      failed: '清除操作日誌失敗'
    },
    values: {
      actionFormat: '{resource}：{verb}',
      unknownAction: '未知操作',
      authMethods: {
        jwt: '登入工作階段',
        adminApiKey: '管理員 API 金鑰'
      },
      roles: {
        admin: '管理員',
        user: '用戶',
        system: '系統',
        unknown: '未知角色'
      },
      verbs: {
        create: '建立', update: '更新', delete: '刪除', read: '查看', import: '匯入', export: '匯出',
        clear: '清除', restore: '還原', download: '下載', regenerate: '重新產生', verify: '驗證',
        login: '登入', register: '註冊', refresh: '重新整理'
      },
      resources: {
        system: '系統', auth: '身分驗證', accounts: '帳號', backups: '備份', settings: '系統設定',
        users: '用戶', groups: '群組', proxies: '代理', redeem_codes: '兌換碼', audit_log: '操作日誌',
        admin_api_key: '管理員 API 金鑰', api_keys: 'API 金鑰', s3_config: 'S3 設定',
        data_management: '資料管理', totp: '雙重驗證', session_binding: '工作階段綁定'
      },
      specialActions: {
        login: '登入', login2fa: '完成雙重驗證登入', register: '註冊帳號', tokenRefresh: '重新整理登入工作階段',
        sessionBindingMismatch: '工作階段安全資訊不符', stepUpVerify: '驗證敏感操作', auditLogClear: '清除全部操作日誌'
      }
    }
  }
}
