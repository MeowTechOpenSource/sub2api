export default {

  // Subscription Progress (Header component)
  subscriptionProgress: {
    title: '我的訂閱',
    viewDetails: '查看訂閱詳情',
    activeCount: '{count} 個有效訂閱',
    daily: '每日',
    weekly: '每週',
    monthly: '每月',
    daysRemaining: '剩餘 {days} 天',
    expired: '已過期',
    expiresToday: '今天到期',
    expiresTomorrow: '明天到期',
    viewAll: '查看全部訂閱',
    noSubscriptions: '暫無有效訂閱',
    unlimited: '無限制'
  },

  // Version Badge
  version: {
    currentVersion: '目前版本',
    latestVersion: '最新版本',
    upToDate: '已是最新版本',
    updateAvailable: '有新版本可用！',
    releaseNotes: '更新日誌',
    noReleaseNotes: '暫無更新日誌',
    viewUpdate: '查看更新',
    viewRelease: '查看發佈',
    viewChangelog: '查看更新日誌',
    refresh: '重新整理',
    sourceMode: '源碼構建',
    sourceModeHint: '源碼構建請使用 git pull 更新',
    updateNow: '立即更新',
    updating: '正在更新...',
    updateComplete: '更新完成',
    updateFailed: '更新失敗',
    restartRequired: '請重啟服務以套用更新',
    restartNow: '立即重啟',
    restarting: '正在重啟...',
    retry: '重試'
  },

  // Recharge / Subscription Page
  purchase: {
    title: '充值/訂閱',
    description: '透過內嵌頁面完成充值/訂閱',
    openInNewTab: '新視窗打開',
    notEnabledTitle: '該功能未開啟',
    notEnabledDesc: '管理員暫未開啟充值/訂閱入口，請聯絡管理員。',
    notConfiguredTitle: '充值/訂閱連結未設定',
    notConfiguredDesc: '管理員已開啟入口，但尚未設定充值/訂閱連結，請聯絡管理員。'
  },

  // Custom Page (iframe embed)
  customPage: {
    title: '自訂頁面',
    openInNewTab: '新視窗打開',
    notFoundTitle: '頁面不存在',
    notFoundDesc: '該自訂頁面不存在或已被刪除。',
    notConfiguredTitle: '頁面連結未設定',
    notConfiguredDesc: '該自訂頁面的 URL 未正確設定。',
    tableOfContents: '目錄',
    copyCode: '複製',
    copiedCode: '已複製',
    copyCodeFailed: '失敗'
  },

  // Announcements Page
  announcements: {
    title: '公告',
    description: '查看系統公告',
    unreadOnly: '僅顯示未讀',
    markRead: '標記已讀',
    markAllRead: '全部已讀',
    viewAll: '查看全部公告',
    markedAsRead: '已標記為已讀',
    allMarkedAsRead: '所有公告已標記為已讀',
    newCount: '有 {count} 條新公告',
    readAt: '已讀時間',
    read: '已讀',
    unread: '未讀',
    startsAt: '開始時間',
    endsAt: '結束時間',
    empty: '暫無公告',
    emptyUnread: '暫無未讀公告',
    total: '條公告',
    emptyDescription: '暫時沒有任何系統公告',
    readStatus: '您已閱讀此公告',
    markReadHint: '點擊「已讀」標記此公告'
  },

  // User Subscriptions Page
  userSubscriptions: {
    title: '我的訂閱',
    description: '查看您的訂閱計劃和用量',
    noActiveSubscriptions: '暫無有效訂閱',
    noActiveSubscriptionsDesc: '您沒有任何有效訂閱。請聯絡管理員獲取訂閱。',
    failedToLoad: '載入訂閱失敗',
    status: {
      active: '有效',
      expired: '已過期',
      revoked: '已撤銷'
    },
    usage: '用量',
    expires: '到期時間',
    noExpiration: '無到期時間',
    unlimited: '無限制',
    unlimitedDesc: '該訂閱無用量限制',
    daily: '每日',
    weekly: '每週',
    monthly: '每月',
    daysRemaining: '剩餘 {days} 天',
    expiresOn: '{date} 到期',
    resetIn: '{time} 後重設',
    quotaEndsIn: '額度將在 {time} 後結束',
    windowNotActive: '等待首次使用',
    usageOf: '已用 {used} / {limit}'
  },

  // Onboarding Tour
  onboarding: {
    restartTour: '重新查看新手引導',
    dontShowAgain: '不再提示',
    dontShowAgainTitle: '永久關閉新手引導',
    confirmDontShow: '確定不再顯示新手引導嗎？\n\n您可以隨時在右上角頭像選單中重新開啟。',
    confirmExit: '確定要退出新手引導嗎？您可以隨時在右上角選單重新開始。',
    interactiveHint: '按 Enter 或點擊繼續',
    navigation: {
      flipPage: '翻頁',
      exit: '退出'
    },
    // Admin tour steps
    admin: {
      welcome: {
        title: '👋 歡迎使用 Sub2API',
        description:
          '<div style="line-height: 1.8;"><p style="margin-bottom: 16px;">Sub2API 是一個強大的 AI 服務中轉平台，讓您輕鬆管理和分發 AI 服務。</p><p style="margin-bottom: 12px;"><b>🎯 核心功能：</b></p><ul style="margin-left: 20px; margin-bottom: 16px;"><li>📦 <b>分組管理</b> - 建立不同的服務套餐（VIP、免費試用等）</li><li>🔗 <b>用戶池</b> - 連接多個上游 AI 服務商用戶</li><li>🔑 <b>金鑰分發</b> - 為用戶生成獨立的 API Key</li><li>💰 <b>收費管理</b> - 靈活的費率和配額控制</li></ul><p style="color: #10b981; font-weight: 600;">接下來，我們將用 3 分鐘帶您完成首次設定 →</p></div>',
        nextBtn: '開始設定 🚀',
        prevBtn: '跳過'
      },
      groupManage: {
        title: '📦 第一步：分組管理',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;"><b>什麼是分組？</b></p><p style="margin-bottom: 12px;">分組是 Sub2API 的核心概念，它就像一個「服務套餐」：</p><ul style="margin-left: 20px; margin-bottom: 12px; font-size: 13px;"><li>🎯 每個分組可以包含多個上游用戶</li><li>💰 每個分組有獨立的收費倍數</li><li>👥 可以設定為公開或專屬分組</li></ul><p style="margin-top: 12px; padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>💡 示例：</b>您可以建立「VIP專線」（高倍數）和「免費試用」（低倍數）兩個分組</p><p style="margin-top: 16px; color: #10b981; font-weight: 600;">👉 點擊左側的「分組管理」開始</p></div>'
      },
      createGroup: {
        title: '➕ 建立新分組',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">現在讓我們建立第一個分組。</p><p style="padding: 8px 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>📝 提示：</b>建議先建立一個測試分組，熟悉流程後再建立正式分組</p><p style="color: #10b981; font-weight: 600;">👉 點擊「建立分組」按鈕</p></div>'
      },
      groupName: {
        title: '✏️ 1. 分組名稱',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">為您的分組起一個易於識別的名稱。</p><div style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>💡 命名建議：</b><ul style="margin: 8px 0 0 16px;"><li>「測試分組」- 用於測試</li><li>「VIP專線」- 高質素服務</li><li>「免費試用」- 體驗版</li></ul></div><p style="font-size: 13px; color: #6b7280;">填寫完成後點擊「下一步」繼續</p></div>',
        nextBtn: '下一步'
      },
      groupPlatform: {
        title: '🤖 2. 選擇平台',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">選擇該分組支援的 AI 平台。</p><div style="padding: 8px 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>📌 平台說明：</b><ul style="margin: 8px 0 0 16px;"><li><b>Anthropic</b> - Claude 系列模型</li><li><b>OpenAI</b> - GPT 系列模型</li><li><b>Google</b> - Gemini 系列模型</li></ul></div><p style="font-size: 13px; color: #6b7280;">一個分組只能選擇一個平台</p></div>',
        nextBtn: '下一步'
      },
      groupMultiplier: {
        title: '💰 3. 費率倍數',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">設定該分組的收費倍數，控制用戶的實際扣費。</p><div style="padding: 8px 12px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>⚙️ 收費規則：</b><ul style="margin: 8px 0 0 16px;"><li><b>1.0</b> - 原價收費（成本價）</li><li><b>1.5</b> - 用戶消耗 $1，扣除 $1.5</li><li><b>2.0</b> - 用戶消耗 $1，扣除 $2</li><li><b>0.8</b> - 補貼模式（虧本營運）</li></ul></div><p style="font-size: 13px; color: #6b7280;">建議測試分組設定為 1.0</p></div>',
        nextBtn: '下一步'
      },
      groupExclusive: {
        title: '🔒 4. 專屬分組（可選）',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">控制分組的可見性和存取權限。</p><div style="padding: 8px 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>🔐 權限說明：</b><ul style="margin: 8px 0 0 16px;"><li><b>關閉</b> - 公開分組，所有用戶可見</li><li><b>開啟</b> - 專屬分組，僅指定用戶可見</li></ul></div><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>💡 使用場景：</b>VIP 用戶專屬、內部測試、特殊客戶等</p></div>',
        nextBtn: '下一步'
      },
      groupSubmit: {
        title: '✅ 儲存分組',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">確認資訊無誤後，點擊建立按鈕儲存分組。</p><p style="padding: 8px 12px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>⚠️ 注意：</b>分組建立後，平台類型不可修改，其他資訊可以隨時編輯</p><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>📌 下一步：</b>建立成功後，我們將新增上游用戶到這個分組</p><p style="margin-top: 12px; color: #10b981; font-weight: 600;">👉 點擊「建立」按鈕</p></div>'
      },
      accountManage: {
        title: '🔗 第二步：新增用戶',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;"><b>太棒了！分組已建立成功 🎉</b></p><p style="margin-bottom: 12px;">現在需要新增上游 AI 服務商的用戶，讓分組能夠實際提供服務。</p><div style="padding: 8px 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>🔑 用戶的作用：</b><ul style="margin: 8px 0 0 16px;"><li>連接到上游 AI 服務（Claude、GPT 等）</li><li>一個分組可以包含多個用戶（負載平衡）</li><li>支援 OAuth 和 Session Key 兩種方式</li></ul></div><p style="margin-top: 16px; color: #10b981; font-weight: 600;">👉 點擊左側的「用戶管理」</p></div>'
      },
      createAccount: {
        title: '➕ 新增用戶',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">點擊按鈕開始新增您的第一個上游用戶。</p><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>💡 提示：</b>建議使用 OAuth 方式，更安全且無需手動提取金鑰</p><p style="margin-top: 12px; color: #10b981; font-weight: 600;">👉 點擊「新增用戶」按鈕</p></div>'
      },
      accountName: {
        title: '✏️ 1. 用戶名稱',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">為用戶設定一個便於識別的名稱。</p><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>💡 命名建議：</b>「Claude主用戶」、「GPT備用1」、「測試用戶」等</p></div>',
        nextBtn: '下一步'
      },
      accountPlatform: {
        title: '🤖 2. 選擇平台',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">選擇該用戶對應的服務商平台。</p><p style="padding: 8px 12px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px; font-size: 13px;"><b>⚠️ 重要：</b>平台必須與剛才建立的分組平台一致</p></div>',
        nextBtn: '下一步'
      },
      accountType: {
        title: '🔐 3. 授權方式',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">選擇用戶的授權方式。</p><div style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>✅ 推薦：OAuth 方式</b><ul style="margin: 8px 0 0 16px;"><li>無需手動提取金鑰</li><li>更安全，支援自動重新整理</li><li>適用於 Claude Code、ChatGPT OAuth</li></ul></div><div style="padding: 8px 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 13px;"><b>📌 Session Key 方式</b><ul style="margin: 8px 0 0 16px;"><li>需要手動從瀏覽器提取</li><li>可能需要定期更新</li><li>適用於不支援 OAuth 的平台</li></ul></div></div>',
        nextBtn: '下一步'
      },
      accountPriority: {
        title: '⚖️ 4. 優先級（可選）',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">設定用戶的呼叫優先級。</p><div style="padding: 8px 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>📊 優先級規則：</b><ul style="margin: 8px 0 0 16px;"><li>數字越小，優先級越高</li><li>系統優先使用低數值用戶</li><li>相同優先級則隨機選擇</li></ul></div><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>💡 使用場景：</b>主用戶設定低數值，備用用戶設定高數值</p></div>',
        nextBtn: '下一步'
      },
      accountGroups: {
        title: '🎯 5. 分配分組',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;"><b>關鍵步驟！</b>將用戶分配到剛才建立的分組。</p><div style="padding: 8px 12px; background: #fee2e2; border-left: 3px solid #ef4444; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>⚠️ 重要提醒：</b><ul style="margin: 8px 0 0 16px;"><li>必須勾選至少一個分組</li><li>未分配分組的用戶無法使用</li><li>一個用戶可以分配給多個分組</li></ul></div><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>💡 提示：</b>請勾選剛才建立的測試分組</p></div>',
        nextBtn: '下一步'
      },
      accountSubmit: {
        title: '✅ 儲存用戶',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">確認資訊無誤後，點擊儲存按鈕。</p><div style="padding: 8px 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>📌 OAuth 授權流程：</b><ul style="margin: 8px 0 0 16px;"><li>點擊儲存後會跳轉到服務商頁面</li><li>在服務商頁面完成登入授權</li><li>授權成功後自動返回</li></ul></div><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>📌 下一步：</b>用戶新增成功後，我們將建立 API 金鑰</p><p style="margin-top: 12px; color: #10b981; font-weight: 600;">👉 點擊「儲存」按鈕</p></div>'
      },
      keyManage: {
        title: '🔑 第三步：生成金鑰',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;"><b>恭喜！用戶設定完成 🎉</b></p><p style="margin-bottom: 12px;">最後一步，生成 API Key 來測試服務是否正常運作。</p><div style="padding: 8px 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>🔑 API Key 的作用：</b><ul style="margin: 8px 0 0 16px;"><li>用於呼叫 AI 服務的憑證</li><li>每個 Key 綁定一個分組</li><li>可以設定配額和有效期</li><li>支援獨立的使用統計</li></ul></div><p style="margin-top: 16px; color: #10b981; font-weight: 600;">👉 點擊左側的「API 金鑰」</p></div>'
      },
      createKey: {
        title: '➕ 建立金鑰',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">點擊按鈕建立您的第一個 API Key。</p><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>💡 提示：</b>建立後請立即複製儲存，金鑰只顯示一次</p><p style="margin-top: 12px; color: #10b981; font-weight: 600;">👉 點擊「建立金鑰」按鈕</p></div>'
      },
      keyName: {
        title: '✏️ 1. 金鑰名稱',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">為金鑰設定一個便於管理的名稱。</p><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>💡 命名建議：</b>「測試金鑰」、「生產環境」、「流動端」等</p></div>',
        nextBtn: '下一步'
      },
      keyGroup: {
        title: '🎯 2. 選擇分組',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">選擇剛才設定好的分組。</p><div style="padding: 8px 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>📌 分組決定：</b><ul style="margin: 8px 0 0 16px;"><li>該金鑰可以使用哪些用戶</li><li>收費倍數是多少</li><li>是否為專屬金鑰</li></ul></div><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>💡 提示：</b>選擇剛才建立的測試分組</p></div>',
        nextBtn: '下一步'
      },
      keySubmit: {
        title: '🎉 生成並複製',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">點擊建立後，系統會生成完整的 API Key。</p><div style="padding: 8px 12px; background: #fee2e2; border-left: 3px solid #ef4444; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>⚠️ 重要提醒：</b><ul style="margin: 8px 0 0 16px;"><li>金鑰只顯示一次，請立即複製</li><li>遺失後需要重新生成</li><li>妥善保管，不要洩露給他人</li></ul></div><div style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>🚀 下一步：</b><ul style="margin: 8px 0 0 16px;"><li>複製生成的 sk-xxx 金鑰</li><li>在支援 OpenAI 介面的用戶端中使用</li><li>開始體驗 AI 服務！</li></ul></div><p style="margin-top: 12px; color: #10b981; font-weight: 600;">👉 點擊「建立」按鈕</p></div>'
      }
    },
    // User tour steps
    user: {
      welcome: {
        title: '👋 歡迎使用 Sub2API',
        description:
          '<div style="line-height: 1.8;"><p style="margin-bottom: 16px;">您好！歡迎來到 Sub2API AI 服務平台。</p><p style="margin-bottom: 12px;"><b>🎯 快速開始：</b></p><ul style="margin-left: 20px; margin-bottom: 16px;"><li>🔑 建立 API 金鑰</li><li>📋 複製金鑰到您的套用</li><li>🚀 開始使用 AI 服務</li></ul><p style="color: #10b981; font-weight: 600;">只需 1 分鐘，讓我們開始吧 →</p></div>',
        nextBtn: '開始 🚀',
        prevBtn: '跳過'
      },
      keyManage: {
        title: '🔑 API 金鑰管理',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">在這裏管理您的所有 API 存取金鑰。</p><p style="padding: 8px 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 13px;"><b>📌 什麼是 API 金鑰？</b><br/>API 金鑰是您存取 AI 服務的憑證，就像一把鑰匙，讓您的套用能夠呼叫 AI 能力。</p><p style="margin-top: 12px; color: #10b981; font-weight: 600;">👉 點擊進入金鑰頁面</p></div>'
      },
      createKey: {
        title: '➕ 建立新金鑰',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">點擊按鈕建立您的第一個 API 金鑰。</p><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>💡 提示：</b>建立後金鑰只顯示一次，請務必複製儲存</p><p style="margin-top: 12px; color: #10b981; font-weight: 600;">👉 點擊「建立金鑰」</p></div>'
      },
      keyName: {
        title: '✏️ 金鑰名稱',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">為金鑰起一個便於識別的名稱。</p><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>💡 示例：</b>「我的第一個金鑰」、「測試用」等</p></div>',
        nextBtn: '下一步'
      },
      keyGroup: {
        title: '🎯 選擇分組',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">選擇管理員為您分配的服務分組。</p><p style="padding: 8px 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 13px;"><b>📌 分組說明：</b><br/>不同分組可能有不同的服務質量和收費標準，請根據需要選擇。</p></div>',
        nextBtn: '下一步'
      },
      keySubmit: {
        title: '🎉 完成建立',
        description:
          '<div style="line-height: 1.7;"><p style="margin-bottom: 12px;">點擊確認建立您的 API 金鑰。</p><div style="padding: 8px 12px; background: #fee2e2; border-left: 3px solid #ef4444; border-radius: 4px; font-size: 13px; margin-bottom: 12px;"><b>⚠️ 重要：</b><ul style="margin: 8px 0 0 16px;"><li>建立後請立即複製金鑰（sk-xxx）</li><li>金鑰只顯示一次，遺失需重新生成</li></ul></div><p style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px; font-size: 13px;"><b>🚀 如何使用：</b><br/>將金鑰設定到支援 OpenAI 介面的任何用戶端（如 ChatBox、OpenCat 等），即可開始使用！</p><p style="margin-top: 12px; color: #10b981; font-weight: 600;">👉 點擊「建立」按鈕</p></div>'
      }
    }
  },

  // Payment System
  payment: {
    title: '充值/訂閱',
    amountLabel: '充值金額',
    paymentAmount: '支付金額',
    creditedBalance: '到賬餘額',
    quickAmounts: '快捷金額',
    customAmount: '自訂金額',
    enterAmount: '輸入金額',
    paymentMethod: '支付方式',
    fee: '手續費',
    actualPay: '實付金額',
    createOrder: '確認支付',
    methods: {
      easypay: '易支付',
      alipay: '支付寶',
      wxpay: '微信支付',
      stripe: 'Stripe',
      airwallex: 'Airwallex',
      card: '銀行卡',
      link: 'Link',
      alipay_direct: '支付寶（直連）',
      wxpay_direct: '微信支付（直連）',
    },
    status: {
      pending: '待支付',
      paid: '已支付',
      recharging: '充值中',
      completed: '已完成',
      expired: '已過期',
      cancelled: '已取消',
      failed: '失敗',
      refund_requested: '退款申請中',
      refunding: '退款中',
      refund_pending: '退款處理中',
      refunded: '已退款',
      partially_refunded: '部份退款',
      refund_failed: '退款失敗',
    },
    qr: {
      scanToPay: '請掃碼支付',
      scanAlipay: '支付寶掃碼支付',
      scanWxpay: '微信掃碼支付',
      scanAlipayHint: '請使用手機打開支付寶，掃描二維碼完成支付',
      scanWxpayHint: '請使用手機打開微信，掃描二維碼完成支付',
      payInNewWindow: '請在新視窗中完成支付',
      payInNewWindowHint: '支付頁面已在新視窗打開，請在新視窗中完成支付後返回此頁面',
      openPayWindow: '重新打開支付頁面',
      expiresIn: '剩餘支付時間',
      expired: '訂單已過期',
      expiredDesc: '訂單已超時，請重新建立訂單',
      cancelled: '訂單已取消',
      cancelledDesc: '您已取消本次支付',
      waitingPayment: '等待支付...',
      cancelOrder: '取消訂單',
    },
    orders: {
      title: '我的訂單',
      empty: '暫無訂單',
      orderId: '訂單 ID',
      orderNo: '訂單編號',
      amount: '金額',
      payAmount: '實付',
      creditedAmount: '到賬金額',
      fee: '手續費',
      baseAmount: '充值金額',
      includedInPayAmount: '已含在實付金額中',
      status: '狀態',
      paymentMethod: '支付方式',
      createdAt: '建立時間',
      cancel: '取消訂單',
      userId: '用戶 ID',
      orderType: '訂單類型',
      actions: '操作',
      requestRefund: '申請退款',
    },
    result: {
      success: '支付成功',
      subscriptionSuccess: '訂閱成功',
      processing: '支付處理中',
      processingHint: '支付結果仍在確認中，頁面會自動重新整理。',
      failed: '支付失敗',
      backToRecharge: '返回充值',
      viewOrders: '查看訂單',
    },
    currentBalance: '目前餘額',
    groupFallback: '分組 #{id}',
    rechargeAccount: '充值用戶',
    activeSubscription: '目前訂閱',
    noActiveSubscription: '暫無有效訂閱',
    tabTopUp: '充值',
    tabSubscribe: '訂閱',
    noPlans: '暫無可用訂閱套餐',
    notAvailable: '充值功能暫未開放',
    confirmSubscription: '確認訂閱',
    confirmCancel: '確定要取消此訂單嗎？',
    amountTooLow: '最低金額為 {min}',
    amountTooHigh: '最高金額為 {max}',
    amountNoMethod: '該金額沒有可用的支付方式',
    rechargeRatePreview: '目前倍數：1 CNY = {usd} USD',
    refundReason: '退款原因',
    refundReasonPlaceholder: '請描述您的退款原因',
    stripeLoadFailed: '支付元件載入失敗，請重新整理頁面重試',
    stripeMissingParams: '缺少訂單ID或支付金鑰',
    stripeNotConfigured: 'Stripe 未設定',
    airwallexLoadFailed: 'Airwallex 支付元件載入失敗，請重新整理頁面重試',
    airwallexMissingParams: '缺少 Airwallex 支付參數',
    errors: {
      tooManyPending: '待支付訂單過多（最多 {max} 個），請先完成或取消現有訂單',
      cancelRateLimited: '取消訂單過於頻繁，請稍後再試',
      wechatH5NotAuthorized: '目前商戶未開通微信 H5 支付，請在微信中打開目前頁面繼續支付。',
      wechatPaymentMpNotConfigured: '目前站點未完成公眾號/JSAPI 支付設定，暫時無法在微信內直接拉起支付。',
      wechatJsapiUnavailable: '目前環境未能拉起微信支付，請確認正在微信內打開本頁後重試。',
      wechatJsapiFailed: '微信支付未完成，請重新拉起支付或改用掃碼支付。',
      wechatUnavailable: '目前微信支付暫不可用，請稍後重試。',
      wechatOpenInWeChatHint: '請複製目前頁面連結到微信內打開，或直接改用電腦端微信掃碼支付。',
      wechatScanOnDesktopHint: '電腦端請直接使用微信掃一掃完成支付；流動端請在微信內打開目前頁面。',
      wechatSwitchBrowserHint: '請改用電腦端微信掃碼，或在外部瀏覽器重新打開本頁後再試。',
      mobilePaymentFallbackToQr: '目前商戶未開通流動支付，已自動切換為掃碼支付。',
      alipayDesktopUnavailable: '目前支付寶桌面支付未成功生成二維碼。',
      alipayDesktopQrHint: '電腦端支付寶應展示掃碼單，請重新整理後重試，或確認瀏覽器未攔截目前支付頁。',
      alipayMobileUnavailable: '目前頁面未成功跳轉到支付寶。',
      alipayMobileOpenHint: '請允許目前頁面打開支付寶 App，或改用系統瀏覽器重新發起支付。',
      // Structured error codes (reason strings from backend ApplicationError)
      PAYMENT_DISABLED: '支付系統已關閉',
      USER_INACTIVE: '用戶已被停用',
      BALANCE_PAYMENT_DISABLED: '餘額充值功能已關閉',
      INVALID_AMOUNT: '金額無效',
      INVALID_INPUT: '參數有誤',
      PLAN_NOT_AVAILABLE: '套餐不存在或已下架',
      GROUP_NOT_FOUND: '訂閱分組不可用',
      GROUP_TYPE_MISMATCH: '分組類型不是訂閱類型',
      TOO_MANY_PENDING: '待支付訂單過多（最多 {max} 個），請先完成或取消現有訂單',
      DAILY_LIMIT_EXCEEDED: '今日充值已達上限，剩餘額度 {remaining}',
      PAYMENT_GATEWAY_ERROR: '支付方式不可用',
      NO_AVAILABLE_INSTANCE: '暫無可用的支付通道',
      PAYMENT_PROVIDER_MISCONFIGURED: '支付通道設定錯誤，請聯絡管理員',
      WXPAY_CONFIG_MISSING_KEY: '微信支付設定缺少必填項：{key}',
      WXPAY_CONFIG_INVALID_KEY_LENGTH: '微信支付 {key} 長度錯誤，應為 {expected} 字節（實際 {actual}）',
      WXPAY_CONFIG_INVALID_KEY: '微信支付 {key} 格式錯誤，請確認複製了完整的 PEM 內容',
      PENDING_ORDERS: '該服務商有未完成的訂單，請等待訂單完成後再操作',
      PAYMENT_PROVIDER_CONFLICT: '該支付方式已有其他啟用中的服務商實例，請先停用後再繼續。',
      CANCEL_RATE_LIMITED: '取消訂單過於頻繁，請稍後再試',
      NOT_FOUND: '訂單不存在',
      FORBIDDEN: '無權限操作此訂單',
      CONFLICT: '訂單狀態已變更，請重新整理',
      INVALID_ORDER_TYPE: '僅餘額訂單可申請退款',
      INVALID_STATUS: '目前訂單狀態不允許此操作',
      BALANCE_NOT_ENOUGH: '退款金額超過餘額',
      REFUND_AMOUNT_EXCEEDED: '退款金額超過充值金額',
      REFUND_FAILED: '退款失敗',
    },
    airwallexPay: 'Airwallex 支付',
    stripePay: '立即支付',
    stripeSuccessProcessing: '支付成功，正在處理訂單...',
    stripePopup: {
      redirecting: '正在跳轉到支付頁面...',
      loadingQr: '正在獲取微信支付二維碼...',
      timeout: '等待支付憑證超時，請重試',
      qrFailed: '未能獲取微信支付二維碼',
    },
    subscribeNow: '立即開通',
    renewNow: '續費',
    selectPlan: '選擇套餐',
    planFeatures: '功能特性',
    planCard: {
      rate: '倍數',
      peakRate: '高峰倍數',
      dailyLimit: '日限額',
      weeklyLimit: '週限額',
      monthlyLimit: '月限額',
      quota: '配額',
      unlimited: '無限制',
      models: '模型',
    },
    days: '天',
    months: '個月',
    years: '年',
    oneMonth: '1 個月',
    oneYear: '1 年',
    perMonth: '月',
    perYear: '年',
    admin: {
      tabs: {
        overview: '概覽',
        orders: '訂單管理',
        channels: '支付渠道',
        plans: '訂閱套餐',
      },
      todayRevenue: '今日收入',
      totalRevenue: '總收入',
      todayOrders: '今日訂單',
      orderCount: '訂單數',
      avgAmount: '平均金額',
      revenue: '收入',
      dailyRevenue: '每日收入',
      paymentDistribution: '支付方式分佈',
      colUser: '用戶',
      topUsers: '消費排行',
      noData: '暫無數據',
      days: '天',
      weeks: '週',
      months: '月',
      searchOrders: '搜尋訂單...',
      allStatuses: '全部狀態',
      allPaymentTypes: '全部支付方式',
      allOrderTypes: '全部訂單類型',
      orderDetail: '訂單詳情',
      orderType: '訂單類型',
      orders: '訂單',
      balanceOrder: '餘額充值',
      subscriptionOrder: '訂閱',
      paidAt: '支付時間',
      completedAt: '完成時間',
      expiresAt: '過期時間',
      feeRate: '手續費率',
      refund: '退款',
      refundOrder: '退款訂單',
      refundAmount: '退款金額',
      maxRefundable: '最大可退金額',
      refundReason: '退款原因',
      refundReasonPlaceholder: '請輸入退款原因',
      confirmRefund: '確認退款',
      refundSuccess: '退款成功',
      refundPending: '退款處理中，待閘道確認',
      queryRefundStatus: '查詢退款狀態',
      refundInfo: '退款資訊',
      refundEnabled: '允許退款',
      alreadyRefunded: '已退款',
      deductBalance: '扣除餘額',
      deductBalanceHint: '從用戶餘額中扣回充值金額',
      userBalance: '用戶餘額',
      orderAmount: '訂單金額',
      insufficientBalance: '餘額不足，將扣至 $0',
      noDeduction: '將不扣除用戶餘額',
      forceRefund: '強制退款（忽略餘額檢查）',
      orderCancelled: '訂單已取消',
      retry: '重試',
      retrySuccess: '重試成功',
      approveRefund: '批准退款',
      retryRefund: '重試退款',
      refundRequestInfo: '退款申請資訊',
      refundRequestedAt: '申請時間',
      refundRequestedBy: '申請人',
      refundRequestReason: '申請原因',
      auditLogs: '操作日誌',
      operator: '操作人',
      channelName: '渠道名稱',
      channelDescription: '渠道描述',
      createChannel: '建立渠道',
      editChannel: '編輯渠道',
      deleteChannel: '刪除渠道',
      deleteChannelConfirm: '確定要刪除此渠道嗎？',
      planName: '套餐名稱',
      planDescription: '套餐描述',
      createPlan: '建立套餐',
      editPlan: '編輯套餐',
      deletePlan: '刪除套餐',
      deletePlanConfirm: '確定要刪除此套餐嗎？',
      originalPrice: '原價',
      price: '價格',
      subscriptionCnyPayPreview: 'CNY 通道實扣預覽：{amount}',
      subscriptionCnyPayPreviewWithFee: '（含 {feeRate}% 手續費：{total}）',
      validityDays: '有效期（天）',
      validityUnit: '有效期單位',
      sortOrder: '排序',
      forSale: '上架狀態',
      onSale: '上架',
      offSale: '下架',
      group: '分組',
      groupId: '分組 ID',
      features: '功能特性',
      featuresHint: '每行一個特性',
      featuresPlaceholder: '輸入套餐特性...',
      providerManagement: '服務商管理',
      providerManagementDesc: '管理支付服務商實例',
      createProvider: '建立服務商',
      editProvider: '編輯服務商',
      deleteProvider: '刪除服務商',
      deleteProviderConfirm: '確定要刪除此服務商嗎？',
      providerName: '服務商名稱',
      providerKey: '服務商標識',
      selectProviderKey: '選擇服務商標識',
      providerConfig: '服務商設定',
      noProviders: '暫無服務商',
      noProvidersHint: '建立一個服務商實例以開始接受支付',
      supportedTypes: '支援的支付方式',
      supportedTypesHint: '選擇此服務商支援的支付方式',
      rateMultiplier: '費率倍數',
      dashboardTitle: '支付概覽',
      dashboardDesc: '充值訂單統計與分析',
      daySuffix: '天',
      paymentConfigTitle: '支付設定',
      paymentConfigDesc: '管理支付服務商與相關設定',
      plansPageTitle: '訂閱套餐管理',
      plansPageDesc: '管理訂閱套餐設定',
      tabPlanConfig: '套餐設定',
      tabUserSubs: '用戶訂閱',
      selectGroup: '請選擇分組',
      groupRequired: '請選擇訂閱分組',
      priceRequired: '價格必須大於 0',
      validityDaysRequired: '有效期天數必須大於 0',
      groupMissing: '缺失',
      groupInfo: '分組資訊',
      platform: '平台',
      rateMultiplierLabel: '倍數',
      dailyLimit: '日限額',
      weeklyLimit: '週限額',
      monthlyLimit: '月限額',
      unlimited: '無限制',
      searchUserSubs: '搜尋用戶訂閱...',
      daily: '日',
      weekly: '週',
      monthly: '月',
      subsStatus: {
        active: '生效中',
        expired: '已過期',
        revoked: '已作廢',
      },
    },
  },

}
