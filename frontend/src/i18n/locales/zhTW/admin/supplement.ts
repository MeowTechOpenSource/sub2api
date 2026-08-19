// Traditional Chinese strings for newer admin features that are not yet
// colocated with their larger domain locale modules.
export default {
  accounts: {
    columns: {
      upstreamBillingRate: '上游聲明費率'
    },
    bulkActions: {
      probeUpstreamBilling: '探測上游費率'
    },
    duplicateAccount: '複製帳號',
    duplicateSuccess: '帳號已複製為「{name}」，目前已暫停調度，請確認憑證後再啟用',
    duplicateFailed: '複製帳號失敗',
    usageWindow: {
      grokFreeQuota24hHint: '根據 sub2api 最近 24 小時的本機 Token 用量估算（上限 2M）',
      grokWeeklyUsage: '每週額度已使用 {percent}%'
    },
    upstreamBilling: {
      trustWarning: '此費率由上游網站針對目前 API Key 自行聲明。Sub2API 無法驗證該值是否與實際收費一致；上游網站或中介代理可能傳回偽造、過期或遭竄改的資料。請配合帳單、餘額變化和實際用量自行核實。',
      autoProbeSettings: '自動探測上游費率',
      intervalMinutes: '探測週期（分鐘）',
      autoProbe: '自動探測',
      autoProbeHint: '啟用後會按全域探測週期查詢此帳號；全域探測關閉時不會執行。',
      manualProbe: '立即探測上游費率',
      stale: '已過期',
      unsupported: '不支援',
      failed: '失敗',
      notProbed: '尚未探測',
      groupRate: '分組預設：{value}x',
      userRate: '用戶專屬費率：{value}x',
      peakRate: '高峰：{start}-{end}，{value}x（{timezone}）',
      noPeakRate: '高峰費率：未啟用',
      effectiveRate: '目前費率：{value}x',
      updatedAt: '更新時間：{value}',
      settingsSaved: '上游費率探測設定已儲存',
      settingsFailed: '無法儲存上游費率探測設定',
      probeFailed: '探測上游費率失敗',
      noEligibleAccounts: '請選擇 OpenAI API Key 帳號',
      batchLimit: '每次最多探測 20 個帳號',
      batchCompleted: '已完成 {count} 個帳號的費率探測',
      batchPartial: '費率探測部分完成：成功 {success} 個，失敗 {failed} 個'
    },
    openai: {
      longContextBilling: 'API 長上下文收費',
      longContextBillingDesc: '預設關閉。僅當此帳號的上游會按模型門檻收取 OpenAI API 長上下文費率時啟用。',
      planType: '訂閱級別（手動覆寫）',
      planTypeDesc: '手動修正此帳號的 ChatGPT 訂閱級別（Plus / Pro / Free）。請注意：當令牌即將到期而重新整理，或遇到 429 限流時，系統會以真實級別自動覆寫此設定。',
      planTypeClear: '清除（自動識別）'
    },
    headerOverride: {
      importJson: '匯入 JSON',
      importJsonApply: '解析並填入',
      importJsonCancel: '取消',
      importJsonHint: '貼上扁平 JSON 物件（請求標頭名稱 → 值），解析後將取代目前整個清單。',
      importJsonInvalid: 'JSON 格式不正確：必須是「請求標頭名稱 → 字串值」的扁平物件',
      copyJson: '複製為 JSON'
    },
    grokCustomBaseUrl: {
      title: '自訂上游地址',
      hint: '啟用後，帳號流量（對話、媒體及探測）會傳送至指定地址；OAuth 授權與令牌重新整理不受影響，仍使用官方端點。',
      placeholder: 'https://relay.example.com/v1',
      required: '啟用自訂上游地址後必須填寫地址',
      invalid: '上游地址格式不正確（必須是以 http(s):// 開頭的完整地址）',
      presets: {
        cli: 'Grok Build CLI',
        official: '官方 API'
      }
    },
    oauth: {
      openai: {
        agentIdentityAuth: 'Agent Identity auth.json',
        agentIdentityDesc: '匯入 Codex Agent Identity auth.json，不會儲存 OAuth access token 或 refresh token。',
        agentIdentityInputLabel: 'Agent Identity auth.json',
        agentIdentityPlaceholder: '貼上一個 Agent Identity auth.json 物件',
        agentIdentityHint: '檔案必須使用 auth_mode=agentIdentity；每次上游請求都會動態簽署。',
        agentIdentityInvalid: '請選擇 auth_mode=agentIdentity 的 Codex auth.json。'
      },
      grok: {
        ssoCookieAuth: '匯入 SSO Cookie',
        ssoCookieDesc: '每行貼上一個 Grok Web SSO key，系統會自動執行 xAI Device Flow 並轉換為 Grok Build OAuth 憑證。',
        ssoCookieLabel: 'Grok Web SSO Key',
        ssoCookiePlaceholder: '每行一個 SSO key\n支援多個，每行一個',
        ssoCookieHint: '每行一個 SSO key；多個 key 會以 3 路並行匯入，每批約需 90 秒，建議使用相應地區的代理。',
        convertingSSO: '正在轉換...',
        convertSSOAndCreate: '轉換並建立帳號',
        failedToConvertSSO: 'Grok SSO 轉換失敗',
        errors: {
          GROK_OAUTH_SESSION_NOT_FOUND: 'Grok OAuth 工作階段不存在或已過期。請重新產生授權連結，並貼上最新的回呼連結。',
          GROK_OAUTH_INVALID_STATE: 'Grok OAuth state 與目前工作階段不符。請貼上同一次授權流程傳回的回呼 URL。',
          GROK_OAUTH_STATE_REQUIRED: '回呼連結缺少 OAuth state。請貼上完整 callback URL，不要只貼上 code。',
          GROK_OAUTH_CODE_REQUIRED: '缺少 Grok 授權碼。請貼上完整 callback URL、查詢字串或 code 值。',
          GROK_OAUTH_NO_REFRESH_TOKEN: 'Grok 回應未傳回 refresh token。請重新產生授權連結，並再次確認 offline access 授權。',
          GROK_OAUTH_PROXY_NOT_AVAILABLE: '無法查詢 Grok OAuth 代理設定。請檢查所選代理後再試。',
          GROK_OAUTH_PROXY_NOT_FOUND: '找不到所選代理。請選擇可用代理後再試。'
        }
      }
    }
  },
  availableChannels: {
    pricing: {
      billingModeVideo: '按影片'
    }
  },
  channelMonitor: {
    duplicate: '複製',
    duplicating: '正在複製',
    duplicateSuccess: '監控項目已複製為「{name}」，預設為停用，請確認設定後再啟用',
    duplicateFailed: '複製監控項目失敗',
    duplicateKeyUnavailable: '無法解密 API Key，請先編輯並重新填寫 Key 後再複製'
  },
  channels: {
    form: {
      imageInputPrice: '圖片輸入'
    }
  },
  dashboard: {
    newUsersToday: '今日新增用戶',
    active: '活躍',
    ok: '正常',
    err: '錯誤',
    create: '建立',
    userUsageTrend: '用戶使用趨勢（前 12 名）'
  },
  groups: {
    columns: {
      id: 'ID'
    },
    videoPricing: {
      title: '影片生成收費',
      description: '設定 Grok 影片生成的每秒價格（USD/秒）。留空則使用預設每秒價格（grok-imagine-video：480p $0.05/s、720p $0.07/s；video-1.5：480p $0.08/s、720p $0.14/s、1080p $0.25/s）。',
      independentMultiplier: '使用獨立影片倍數',
      videoMultiplier: '影片倍數',
      modeHint: '影片按秒收費：每秒價格 × 時長（1-15 秒，預設 8 秒）。預設套用目前有效的分組倍數；獨立模式則改用影片倍數。',
      finalPricePreview: '最終每秒價格預覽',
      notConfigured: '尚未設定'
    },
    webSearchPricing: {
      title: 'Codex 網頁搜尋收費',
      pricePerCall: '每次搜尋價格（USD）',
      pricePerCallHint: '留空使用預設價格 $0.01/次（官方價格為每 1,000 次 $10）；填寫 0 表示免費。最終價格會再套用分組費率倍數。',
      finalPricePreview: '套用目前倍數後的每次價格：{price}'
    },
    claudeMaxSimulation: {
      title: 'Claude Max 用量模擬',
      tooltip: '啟用後，對於沒有上游緩存寫入用量的 Claude 模型，系統會以確定性方式將 Token 映射為少量輸入加 1 小時緩存建立，同時保持 Token 總數不變。',
      enabled: '已啟用（模擬 1 小時緩存）',
      disabled: '已停用',
      hint: '只會調整用量收費日誌中的 Token 類別，不會永久儲存每次請求的映射狀態。'
    }
  },
  ops: {
    systemLogs: {
      host: '主機'
    },
    errorLog: {
      typeAccountAuth: '帳號驗證'
    },
    errorDetails: {
      phase: {
        account_auth: '帳號驗證'
      }
    }
  },
  settings: {
    features: {
      affiliate: {
        adminRechargeRebate: '管理員增值計入回贈',
        adminRechargeRebateHint: '啟用後，透過「用戶管理 > 增值」增加的餘額會產生邀請回贈；直接設定餘額及扣款不會產生回贈。'
      }
    },
    security: {
      sessionBinding: '工作階段裝置綁定',
      sessionBindingHint: '將登入工作階段綁定至瀏覽器 User-Agent；網絡或 IP 改變不會令用戶登出。',
      auditRetention: '操作日誌保留日數',
      auditRetentionHint: '超過指定日數的操作日誌會自動清除；填寫 0 表示永久保留（只可手動清除）。'
    },
    openaiFastPolicy: {
      userIds: '指定用戶',
      userIdsHint: '輸入電郵關鍵字進行模糊搜尋。留空表示套用至所有 Sub2API 用戶；所選用戶的 API Key 請求會優先匹配用戶規則。',
      userSearchPlaceholder: '輸入用戶電郵搜尋',
      userSearchEmpty: '找不到相符用戶',
      userDeleted: '（已刪除）',
      userIdFallback: '用戶 #{id}',
      removeUser: '移除用戶'
    },
    openaiExperimentalScheduler: {
      lowRatePriorityTitle: '低費率優先',
      lowRatePriorityDescription: '啟用後會優先選擇收費費率較低的帳號；費率相同時，再比較帳號優先級和目前負載等條件。啟用實驗性調度策略後，此設定不會生效。',
      oauthRateTitle: 'OAuth 調度參考費率',
      oauthRatePriorityDescription: '同一分組同時包含 API Key 和 OAuth 帳號時，OAuth 帳號會以此費率與已探測的 API Key 收費費率一併排序。',
      oauthRateWeightedDescription: '同一分組同時包含 API Key 和 OAuth 帳號時，計算「收費費率」分數會讓 OAuth 帳號以此費率參與計算。',
      upstreamCostWeight: '收費費率'
    }
  },
  usage: {
    billingModeVideo: '按次（影片）',
    tokenRanking: {
      subtitle: '按目前篩選條件與時間範圍統計每位用戶的 Token 用量',
      rowHint: '點擊查看此用戶的用量明細',
      userCount: '共 {count} 位用戶',
      columns: {
        user: '用戶',
        requests: '請求數',
        inputTokens: '輸入 Token',
        outputTokens: '輸出 Token',
        cacheTokens: '緩存 Token',
        totalTokens: 'Token 總數',
        cost: '費用'
      }
    }
  }
}
