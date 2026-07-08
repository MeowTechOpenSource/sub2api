export default {
  batchImageGuide: {
    title: '圖片大量生成',
    description: '一次提交多條提示詞，任務完成後可統一下載圖片結果'
  },
  // Home Page
  home: {
    viewOnGithub: '在 GitHub 上查看',
    viewDocs: '查看文件',
    docs: '文件',
    switchToLight: '切換到淺色模式',
    switchToDark: '切換到深色模式',
    dashboard: '控制台',
    login: '登入',
    getStarted: '立即開始',
    goToDashboard: '進入控制台',
    // 新增：面向用戶的價值主張
    heroSubtitle: '一個金鑰，暢用多個 AI 模型',
    heroDescription: '無需管理多個訂閱用戶，一站式接入 Claude、GPT、Gemini 等主流 AI 服務',
    tags: {
      subscriptionToApi: '訂閱轉 API',
      stickySession: '對話保持',
      realtimeBilling: '按量收費'
    },
    // 用戶痛點區塊
    painPoints: {
      title: '你是否也遇到這些問題？',
      items: {
        expensive: {
          title: '訂閱費用高',
          desc: '每個 AI 服務都要單獨訂閱，每月支出越來越多'
        },
        complex: {
          title: '多用戶難管理',
          desc: '不同平台的用戶、金鑰分散各處，管理起來很麻煩'
        },
        unstable: {
          title: '服務不穩定',
          desc: '單一用戶容易觸發限制，影響正常使用'
        },
        noControl: {
          title: '用量無法控制',
          desc: '不知道錢花在哪了，也無法限制團隊成員的使用'
        }
      }
    },
    // 解決方案區塊
    solutions: {
      title: '我們幫你解決',
      subtitle: '簡單三步，開始省心使用 AI'
    },
    features: {
      unifiedGateway: '一鍵接入',
      unifiedGatewayDesc: '獲取一個 API 金鑰，即可呼叫所有已接入的 AI 模型，無需分別申請。',
      multiAccount: '穩定可靠',
      multiAccountDesc: '智能調度多個上游用戶，自動切換和負載平衡，告別頻繁報錯。',
      balanceQuota: '用多少付多少',
      balanceQuotaDesc: '按實際使用量收費，支援設定配額上限，團隊用量一目了然。'
    },
    // 優勢對比
    comparison: {
      title: '為甚麼選擇我們？',
      headers: {
        feature: '對比項',
        official: '官方訂閱',
        us: '本平台'
      },
      items: {
        pricing: {
          feature: '付費方式',
          official: '固定月費，用不完也付',
          us: '按量付費，用多少付多少'
        },
        models: {
          feature: '模型選擇',
          official: '單一供應商',
          us: '多模型隨意切換'
        },
        management: {
          feature: '用戶管理',
          official: '每個服務單獨管理',
          us: '統一金鑰，一站管理'
        },
        stability: {
          feature: '服務穩定性',
          official: '單用戶易觸發限制',
          us: '多用戶池，自動切換'
        },
        control: {
          feature: '用量控制',
          official: '無法限制',
          us: '可設配額、查明細'
        }
      }
    },
    providers: {
      title: '已支援的 AI 模型',
      description: '一個 API，多種選擇',
      supported: '已支援',
      soon: '即將推出',
      claude: 'Claude',
      gemini: 'Gemini',
      antigravity: 'Antigravity',
      more: '更多'
    },
    // CTA 區塊
    cta: {
      title: '準備好開始了嗎？',
      description: '註冊即可獲得免費試用額度，體驗一站式 AI 服務',
      button: '免費註冊'
    },
    footer: {
      allRightsReserved: '保留所有權利。'
    }
  },

  // Key Usage Query Page
  keyUsage: {
    title: 'API Key 用量查詢',
    subtitle: '輸入您的 API Key 以查看實時消費金額與使用狀態',
    placeholder: 'sk-ant-mirror-xxxxxxxxxxxx',
    query: '查詢',
    querying: '查詢中...',
    privacyNote: '您的 Key 僅在瀏覽器本地處理，不會被儲存',
    dateRange: '統計範圍:',
    dateRangeToday: '今日',
    dateRange7d: '7 天',
    dateRange30d: '30 天',
    dateRange90d: '90 天',
    dateRangeCustom: '自訂',
    apply: '套用',
    used: '已使用',
    detailInfo: '詳細資訊',
    tokenStats: 'Token 統計',
    dailyDetail: '按日明細',
    modelStats: '模型用量統計',
    // Table headers
    date: '日期',
    model: '模型',
    requests: '請求數',
    inputTokens: '輸入 Tokens',
    outputTokens: '輸出 Tokens',
    cacheCreationTokens: '緩存建立',
    cacheReadTokens: '緩存讀取',
    cacheWriteTokens: '緩存寫入',
    totalTokens: '總 Tokens',
    cost: '費用',
    // Status
    quotaMode: 'Key 限額模式',
    walletBalance: '錢包餘額',
    // Ring card titles
    totalQuota: '總額度',
    limit5h: '5 小時限額',
    limitDaily: '日限額',
    limit7d: '7 天限額',
    limitWeekly: '週限額',
    limitMonthly: '月限額',
    // Detail rows
    remainingQuota: '剩餘額度',
    expiresAt: '過期時間',
    todayExpires: '(今日到期)',
    daysLeft: '({days} 天)',
    usedQuota: '已用額度',
    resetNow: '即將重設',
    subscriptionType: '訂閱類型',
    subscriptionExpires: '訂閱到期',
    // Usage stat cells
    todayRequests: '今日請求',
    todayInputTokens: '今日輸入',
    todayOutputTokens: '今日輸出',
    todayTokens: '今日 Tokens',
    todayCacheCreation: '今日緩存建立',
    todayCacheRead: '今日緩存讀取',
    todayCost: '今日費用',
    rpmTpm: 'RPM / TPM',
    totalRequests: '累計請求',
    totalInputTokens: '累計輸入',
    totalOutputTokens: '累計輸出',
    totalTokensLabel: '累計 Tokens',
    totalCacheCreation: '累計緩存建立',
    totalCacheRead: '累計緩存讀取',
    totalCost: '累計費用',
    avgDuration: '平均耗時',
    // Messages
    enterApiKey: '請輸入 API Key',
    querySuccess: '查詢成功',
    queryFailed: '查詢失敗',
    queryFailedRetry: '查詢失敗，請稍後重試',
    noDailyUsage: '暫無按日用量數據',
  },

  // Setup Wizard
  setup: {
    title: 'Sub2API 安裝精靈',
    description: '設定您的 Sub2API 實例',
    database: {
      title: '資料庫設定',
      description: '連接到您的 PostgreSQL 資料庫',
      host: '主機',
      port: '連接埠',
      username: '用戶名',
      password: '密碼',
      databaseName: '資料庫名稱',
      sslMode: 'SSL 模式',
      passwordPlaceholder: '密碼',
      ssl: {
        disable: '停用',
        require: '要求',
        verifyCa: '驗證 CA',
        verifyFull: '完全驗證'
      }
    },
    redis: {
      title: 'Redis 設定',
      description: '連接到您的 Redis 伺服器',
      host: '主機',
      port: '連接埠',
      password: '密碼（可選）',
      database: '資料庫',
      passwordPlaceholder: '密碼',
      enableTls: '啟用 TLS',
      enableTlsHint: '連接 Redis 時使用 TLS（公共 CA 證書）'
    },
    admin: {
      title: '管理員用戶',
      description: '建立您的管理員用戶',
      email: '電郵',
      password: '密碼',
      confirmPassword: '確認密碼',
      passwordPlaceholder: '至少 8 個字元',
      confirmPasswordPlaceholder: '確認密碼',
      passwordMismatch: '密碼不匹配'
    },
    ready: {
      title: '準備安裝',
      description: '檢查您的設定並完成安裝',
      database: '資料庫',
      redis: 'Redis',
      adminEmail: '管理員電郵'
    },
    status: {
      testing: '測試中...',
      success: '連接成功',
      testConnection: '測試連接',
      installing: '安裝中...',
      completeInstallation: '完成安裝',
      completed: '安裝完成！',
      redirecting: '正在跳轉到登入頁面...',
      restarting: '服務正在重啟，請稍候...',
      timeout: '服務重啟時間超出預期，請手動重新整理頁面。'
    }
  },

  // Common
}
