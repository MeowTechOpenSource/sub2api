// Generated from upstream zh messages; hand-written zhTW messages override this tree.
export default {
  "setup": {
    "redis": {
      "username": "用戶名（可選）",
      "usernamePlaceholder": "預設用戶留空"
    }
  },
  "common": {
    "toggleMenu": "切換菜單",
    "userMenu": "用戶菜單",
    "pageNotFound": "頁面不存在"
  },
  "nav": {
    "securityAudit": "安全審計",
    "contentModeration": "內容審核",
    "promptAudit": "提示詞審計"
  },
  "batchImage": {
    "columns": {
      "taskName": "任務名稱",
      "model": "模型",
      "apiKey": "提交金鑰",
      "result": "結果",
      "cost": "費用",
      "downloadStatus": "下載狀態"
    },
    "status": {
      "queued": "排隊中",
      "running": "生成中",
      "processingResults": "整理結果",
      "settling": "結算中",
      "completed": "已完成",
      "failed": "失敗",
      "cancelled": "已取消",
      "outputDeleted": "結果已刪除",
      "partialSuccess": "部分成功",
      "allFailed": "全部失敗"
    },
    "itemStatus": {
      "pending": "排隊中",
      "succeeded": "成功",
      "failed": "失敗",
      "cancelled": "已取消",
      "recovered": "已補成功"
    },
    "filters": {
      "searchTaskName": "搜索任務名稱",
      "allApiKeys": "全部 API Key",
      "allStatuses": "全部狀態",
      "allDownloadStates": "全部下載狀態",
      "downloaded": "已下載",
      "notDownloaded": "未下載"
    },
    "actions": {
      "usageGuide": "使用說明",
      "createJob": "創建批次任務",
      "downloadSelected": "下載選中",
      "deleteRecords": "刪除記錄",
      "retryFailedItems": "重試失敗項",
      "cancelJob": "取消任務",
      "downloadZip": "下載 ZIP",
      "viewDetail": "查看詳情",
      "download": "下載",
      "moreActions": "更多操作",
      "copyInstruction": "復制說明",
      "submitJob": "提交任務"
    },
    "list": {
      "selectedJobs": "已選擇 {count} 個任務",
      "expandChildren": "展開 {n} 個子任務",
      "collapseChildren": "收起子任務",
      "childCount": "{n} 子任務",
      "childBadge": "子任務",
      "keyNotRecorded": "未記錄",
      "totalCount": "共 {n}",
      "notDownloaded": "未下載",
      "empty": "暫無批次任務",
      "emptyHint": "點擊右上角創建批次任務。"
    },
    "pagination": {
      "pageNumber": "第 {page} 頁",
      "pageItems": "本頁 {count} 條"
    },
    "promptPopover": {
      "title": "完整 Prompt",
      "copied": "Prompt 已復制"
    },
    "detail": {
      "title": "任務詳情",
      "aggregatedResult": "匯總結果",
      "result": "結果",
      "cost": "費用",
      "downloadStatus": "下載狀態",
      "items": "明細",
      "preview": "預覽",
      "previewZoom": "放大壓縮預覽 {id}",
      "previewReload": "重新加載壓縮預覽",
      "previewLoad": "加載壓縮預覽",
      "previewUnavailable": "不可預覽",
      "noImage": "無圖片",
      "loadingItems": "正在加載明細...",
      "noItems": "暫無明細",
      "noItemsHint": "排隊或生成中的任務會先顯示已提交的 prompt，結果整理完成后會更新圖片狀態。",
      "mainTask": "主任務：{name}",
      "childTask": "子任務：{name}",
      "holdCost": "凍結 {amount}"
    },
    "itemResult": {
      "recoveredByRetry": "舊失敗已由重試子任務補成功",
      "readyPreview": "圖片已生成，可點擊預覽",
      "readyDownload": "圖片已生成，可下載",
      "noUsableImage": "未生成可用圖片",
      "cancelled": "任務已取消",
      "waiting": "等待生成結果",
      "emptyImageOutput": "上游返回了結果，但這條沒有圖片內容。通常是 Gemini/Vertex 單條生成失敗或被安全策略攔截。",
      "providerItemFailed": "上游返回的這條結果沒有可用圖片。"
    },
    "imagePreview": {
      "title": "圖片預覽",
      "notice": "當前顯示的是瀏覽器本地緩存的壓縮縮略圖，清晰度會有影響；需要查看原圖請下載 ZIP。"
    },
    "create": {
      "title": "創建批次任務",
      "taskName": "任務名稱",
      "taskNamePlaceholder": "不填寫則預設使用當前時間",
      "loadingKeys": "加載 API Key 中...",
      "selectKeyPlaceholder": "請選擇 Gemini API Key",
      "noKeysHint": "當前沒有可用于批次生圖的 Gemini API Key。請先創建并綁定已開啟批次生圖的 Gemini 分組。",
      "model": "模型",
      "imageSize": "圖片尺寸",
      "imageSizeHint": "當前批次任務固定按 1K 圖片提交。",
      "outputFormat": "輸出格式",
      "estimatedOutput": "預計生成",
      "estimatedOutputValue": "{images} 張 / {prompts} 條",
      "promptAdded": "已添加 {count} 條",
      "promptPlaceholder": "粘貼 prompt，添加后進入下方列表",
      "customIdPlaceholder": "Custom ID 可選",
      "outputCountPerPrompt": "每條生成張數",
      "outputCountOption": "{n} 張",
      "referenceImage": "參考圖",
      "removeReferenceImage": "移除參考圖",
      "limitsHint": "每條最多 {maxPerItem} 張，整組最多 {maxPerJob} 張；目前模型每條最多 {refLimit} 張參考圖，參考圖按生成張數重複消耗輸入 Token。",
      "referenceCount": "{n} 參考圖",
      "noPrompts": "還沒有添加 prompt。",
      "cancelNotice": "取消任務會請求上游取消；已被系統索引為成功的圖片仍會按成功項結算扣費，其余凍結金額會釋放。",
      "submittingNotice": "正在建立上游批次任務，通常需要幾秒，請不要重複提交。",
      "modelNoReferenceImages": "當前模型不支持參考圖。",
      "refLimitReached": "當前模型每條最多 {limit} 張參考圖。",
      "refLimitExceededIgnored": "當前模型每條最多 {limit} 張參考圖，已忽略超出的文件。",
      "refFormatUnsupported": "參考圖僅支持 PNG、JPEG 或 WebP。",
      "refFileTooLarge": "{name} 超過 10MB，已忽略。"
    },
    "guide": {
      "title": "批次生圖使用說明",
      "uiTitle": "當前界面如何使用",
      "step1": "1. 選擇已開啟批次生圖的 Gemini API Key，模型列表會按該 Key 所屬分組可用模型展示。",
      "step2": "2. 任務名稱可以留空，提交時會自動使用目前時間；Prompt 需逐條加入清單，每條 Prompt 可附參考圖，也可以設定重複生成張數。",
      "step3": "3. 提交後任務會先排隊，明細會顯示已提交的 Prompt；圖片預覽預設不載入，點擊明細內的預覽按鈕才會載入單張圖片。",
      "step4": "4. 完成後可以下載 ZIP；部分失敗時，可從更多選單只重試失敗項目。目前仍按成功輸出圖片數結算，不會另外收取參考圖費用。",
      "skillTitle": "給 Codex 的 Skill 說明",
      "skillDesc": "用于告訴 Codex 如何代替用戶整理 prompt、提交任務和下載結果。"
    },
    "messages": {
      "loadKeysFailed": "加載 API Key 失敗",
      "loadModelsFailed": "加載可用模型失敗",
      "loadJobsFailed": "加載批次任務失敗",
      "selectApiKey": "請選擇可用的 Gemini API Key",
      "noModelsForKey": "當前金鑰沒有可用的批次生圖模型",
      "selectModel": "請選擇模型",
      "promptRequired": "請至少填寫一條 prompt",
      "submitted": "批次任務已提交",
      "submitFailed": "提交失敗",
      "refreshFailed": "刷新失敗",
      "cancelConfirm": "取消會請求上游取消；已被系統索引為成功的圖片仍會按成功項結算扣費，其余凍結金額會釋放。確定取消嗎？",
      "cancelled": "已請求取消任務",
      "cancelFailed": "取消失敗",
      "batchDownloadStarted": "已開始下載選中的任務",
      "downloadFailed": "下載失敗",
      "retrySubmitted": "已提交失敗項重試任務",
      "retryFailed": "重試失敗項失敗",
      "retryMissingPrompts": "這個任務沒有保存失敗項 prompt，無法自動重試。請復制原 prompt 后重新創建任務。",
      "retryTaskNameSuffix": "重試失敗項",
      "deleteConfirm": "刪除后這個任務會從你的列表隱藏，但賬務記錄仍會保留。確定刪除嗎？",
      "deleteSelectedConfirm": "刪除后選中的任務會從你的列表隱藏，但賬務記錄仍會保留。確定刪除嗎？",
      "deleted": "任務記錄已刪除",
      "deleteFailed": "刪除任務記錄失敗",
      "loadItemsFailed": "加載明細失敗",
      "loadPreviewFailed": "加載圖片預覽失敗",
      "copiedInstruction": "已復制批次生圖說明",
      "loadingModels": "加載可用模型中...",
      "noModels": "無可用模型",
      "noModelsHint": "當前金鑰所屬分組沒有配置可用于批次生圖的模型。",
      "noCompatibleAccount": "當前金鑰所屬分組沒有可用的批次生圖上游帳號。請聯系管理員檢查：該分組是否綁定了可調度的 Gemini API Key 或 Vertex 服務帳號，以及帳號是否支持所選模型。",
      "unsupportedProvider": "這個任務使用的批次生圖通道當前不可用。請聯系管理員檢查批次生圖通道配置。",
      "providerSubmitFailed": "上游批次生圖任務提交失敗。請聯系管理員檢查上游帳號狀態、模型權限或服務狀態。",
      "vertexGcsBucketMissing": "Vertex 批次生圖缺少托管 GCS 存儲桶配置。請聯系管理員配置 BATCH_IMAGE_VERTEX_MANAGED_GCS_BUCKET 后再提交。",
      "queueFailed": "任務隊列暫時不可用，批次任務沒有成功入隊。請聯系管理員檢查隊列服務。",
      "billingHoldFailed": "費用凍結失敗，批次任務沒有成功提交。請聯系管理員檢查余額凍結或計費服務。",
      "groupDisabled": "當前金鑰所屬分組沒有開啟批次生圖。你可以換一個已開啟批次生圖的金鑰，或聯系管理員開啟。",
      "pricingMissing": "所選模型還沒有配置批次生圖價格。請聯系管理員補充價格配置。",
      "insufficientBalance": "余額不足，無法凍結本次批次生圖費用。",
      "invalidModel": "請選擇一個可用于當前金鑰的批次生圖模型。",
      "invalidItems": "Prompt 列表格式不正確，請檢查是否為空、是否超過數量限制，或圖片尺寸是否仍為 1K。",
      "duplicateCustomId": "Prompt 清單內的 custom_id 不可重複。",
      "promptTooLong": "單條 prompt 過長，請縮短后重試。",
      "invalidReferenceImage": "參考圖格式不正確，請使用 10MB 以內的 PNG、JPEG 或 WebP。",
      "tooManyReferenceImages": "參考圖數量超過限制：Flash Image 每條最多 3 張，Pro Image 每條最多 14 張，整組最多 1000 張。",
      "referenceImagesTooLarge": "參考圖總量過大。inline 參考圖整組最多 128MB；大量參考圖請改用 gs:// file_uri 或拆分任務。",
      "tooManyOutputImages": "預計生成張數超過限制：每條最多 4 張，整組最多 200 張。",
      "idempotencyConflict": "這次提交和之前的請求標識沖突，請刷新頁面后重新提交。",
      "notReady": "任務還沒有完成，完成后才能下載。",
      "outputDeleted": "這個任務的結果文件已經被清理，無法下載。",
      "resultMissing": "結果文件不可用，可能是上游結果文件已清理、存儲權限異常，或管理員遷移過存儲配置。請聯系管理員檢查結果文件。",
      "itemFailed": "這條明細沒有成功圖片，無法預覽。",
      "itemImageIndexOutOfRange": "這條明細沒有可預覽的圖片。",
      "downloadLimited": "當前下載請求太多，請稍后再試。",
      "downloadTooLarge": "這個 ZIP 太大，已超過單次下載限制。請減少單次下載數量，或聯系管理員調整批次下載上限。",
      "deleteNotReady": "任務結束后才能刪除記錄。正在生成或結算中的任務請先等待完成。",
      "disabled": "批次生圖功能當前未開啟。",
      "authRequired": "當前 API Key 不可用或已失效，請重新選擇金鑰。",
      "adminReference": "請把錯誤碼和請求 ID 發給管理員排查。",
      "errorReference": "錯誤信息",
      "errorCodeRef": "錯誤碼：{code}",
      "requestIdRef": "請求 ID：{id}",
      "httpStatusRef": "HTTP 狀態：{status}"
    }
  },
  "admin": {
    "backup": {
      "imageStorage": {
        "title": "異步生圖對象存儲",
        "description": "開啟后，異步生圖接口可用，生成結果轉存到對象存儲，只把短鏈接寫入 Redis。與備份共用同一套 S3 客戶端，保存后立即生效，無需重啟。",
        "enabled": "啟用異步生圖",
        "reuseBackupS3": "復用上方備份的 S3 配置（只用不同的存儲桶/前綴）",
        "bucket": "存儲桶",
        "bucketInherited": "留空則沿用備份存儲桶",
        "prefix": "Key 前綴",
        "publicBaseUrl": "公開訪問域名",
        "publicBaseUrlPlaceholder": "留空則返回預簽名臨時鏈接",
        "presignExpiryHours": "預簽名鏈接有效期（小時）",
        "saved": "異步生圖對象存儲配置已保存"
      }
    },
    "groups": {
      "form": {
        "maxReasoningEffort": "推理強度上限",
        "maxReasoningEffortUnlimited": "不限制（跟隨請求）",
        "maxReasoningEffortHint": "僅限制客戶端主動請求的 OpenAI reasoning effort；超過上限時自動降檔，不會為缺省請求主動開啟推理。上限優先級高于推理強度映射。",
        "reasoningEffortMappings": "推理強度映射",
        "addReasoningEffortMapping": "添加映射",
        "removeReasoningEffortMapping": "刪除映射",
        "reasoningEffortFrom": "請求值",
        "reasoningEffortTo": "轉發值",
        "reasoningEffortFromPlaceholder": "請選擇 A",
        "reasoningEffortToPlaceholder": "請選擇 B",
        "fromRequired": "請選擇請求值 A",
        "toRequired": "請選擇轉發值 B",
        "unsupportedFrom": "請求值不受當前平臺支持",
        "unsupportedTo": "轉發值不受當前平臺支持",
        "duplicateFrom": "請求值 A 不可重複"
      }
    },
    "accounts": {
      "upstreamBilling": {
        "nextProbeAt": "下一次探測：{value}",
        "lastDetectedRate": "上次探測倍率：{value}x",
        "lastDetectedAt": "上次探測時間：{value}",
        "elapsedSince": "已過去：{value}",
        "justNow": "不足 1 分鐘",
        "minutesAgo": "{count} 分鐘",
        "hoursAgo": "{count} 小時",
        "daysAgo": "{count} 天",
        "accountProbeState": "當前帳號自動檢測：",
        "globalProbeState": "全局探測開關：",
        "enabled": "打開",
        "disabled": "關閉"
      },
      "grokClientToolCache": {
        "title": "客戶端工具緩存（可能改變自動工具選擇）",
        "hint": "僅對已識別為 Free 的 Grok OAuth 帳號生效，預設會為 Codex、Trae 等客戶端函數工具請求啟用上游提示緩存；如不接受自動工具選擇行為，可關閉此開關退出。"
      }
    },
    "ops": {
      "systemLogs": {
        "cleanupFilterRequired": "清理需要至少一個篩選條件（起止時間或其他字段）"
      }
    },
    "settings": {
      "security": {
        "stepUp": "敏感操作二次驗證 (step-up 2FA)",
        "stepUpHint": "開啟后，帳號/代理導出、備份創建與下載、S3 配置修改、提升管理員等敏感操作需要先完成 TOTP 二次驗證（15 分鐘內有效）。開啟前需本人已啟用 2FA；關閉該開關本身也需要二次驗證。",
        "stepUpEnableRequiresTotp": "開啟敏感操作二次驗證前，請先在個人資料中為當前帳號啟用 2FA (TOTP)。"
      },
      "apiKeyAcl": {
        "forwardedClientIpHeaders": "自定義客戶端 IP 請求頭",
        "forwardedClientIpHeadersHint": "添加 CDN 或反代請求頭名稱，解析時優先于內置請求頭。",
        "forwardedClientIpHeadersPlaceholder": "X-Client-IP",
        "forwardedClientIpHeadersRiskHint": "源站可被直接訪問時，這些原始請求頭可被偽造；請先限制源站訪問再信任它們。",
        "forwardedClientIpHeaderInvalid": "請輸入有效的 HTTP 請求頭名稱。",
        "forwardedClientIpHeadersLimit": "自定義客戶端 IP 請求頭最多允許 {max} 個。",
        "removeForwardedClientIpHeader": "移除 {header}"
      },
      "upstreamBillingProbe": {
        "title": "上游倍率自動探測",
        "description": "定期獲取 OpenAI API Key 所連接上游 Sub2API 站點聲明的計費倍率。",
        "enabled": "啟用全局自動探測",
        "enabledHint": "開啟后，僅對帳號自身已啟用自動檢測的帳號執行定時探測；關閉后停止所有定時探測，手動探測不受影響。",
        "intervalMinutes": "探測周期（分鐘）",
        "intervalHint": "范圍 5–1440 分鐘。成功探測結果的有效期為兩個探測周期。",
        "saved": "上游倍率自動探測設定已保存",
        "saveFailed": "保存上游倍率自動探測設定失敗"
      },
      "payment": {
        "customMethodDisplayNamePlaceholder": "如：信用卡"
      }
    },
    "promptAudit": {
      "title": "提示詞審計",
      "description": "通過 OpenAI 兼容 Qwen3Guard 節點異步復核或同步阻止用戶輸入；事件的完整提示詞會入庫保存，僅供管理員復核。",
      "configVersion": "配置版本 v{version}",
      "tabs": {
        "config": "配置",
        "events": "事件"
      },
      "actions": {
        "refresh": "刷新運行態",
        "retry": "重試",
        "Allow": "放行",
        "Warn": "警告",
        "Block": "阻止"
      },
      "common": {
        "actions": "操作",
        "never": "從未"
      },
      "mode": {
        "off": "已關閉",
        "async_audit": "異步只審計",
        "blocking": "同步審計并阻止"
      },
      "status": {
        "disabled": "未啟用",
        "running": "運行中",
        "degraded": "降級",
        "error": "錯誤",
        "healthy": "健康",
        "failed": "失敗",
        "stale": "心跳過期"
      },
      "decisions": {
        "pass": "通過",
        "flag": "標記",
        "critical": "嚴重"
      },
      "riskLevels": {
        "low": "低",
        "medium": "中",
        "high": "高",
        "critical": "嚴重"
      },
      "scanners": {
        "violent": "暴力",
        "non_violent_illegal_acts": "非暴力違法行為",
        "sexual_content_or_sexual_acts": "色情內容或性行為",
        "pii": "個人身份信息",
        "suicide_and_self_harm": "自殺與自殘",
        "unethical_acts": "不道德行為",
        "politically_sensitive_topics": "政治敏感話題",
        "copyright_violation": "版權侵犯",
        "jailbreak": "越獄"
      },
      "scannerDescriptions": {
        "violent": "暴力或暴力威脅",
        "non_violent_illegal_acts": "非暴力違法活動",
        "sexual_content_or_sexual_acts": "色情內容或性行為",
        "pii": "個人身份信息",
        "suicide_and_self_harm": "自殺或自殘",
        "unethical_acts": "不道德行為",
        "politically_sensitive_topics": "政治敏感話題",
        "copyright_violation": "版權侵權",
        "jailbreak": "提示注入或越獄嘗試"
      },
      "runtime": {
        "title": "運行概覽",
        "description": "顯示服務端當前生效狀態；未保存的草稿不會改變這些數值。",
        "process": "進程狀態",
        "mode": "生效模式",
        "version": "生效 / 期望版本",
        "workers": "活動 / 總 Worker",
        "queue": "活動任務 / 容量",
        "dependencies": "依賴",
        "guardMetrics": "同步 Guard 指標",
        "latest": "最近處理與錯誤",
        "queueBreakdown": "queued {queued} · processing {processing} · retry {retry} · done {done} · failed {failed}",
        "deliveryTotals": "累計入隊 {enqueued} · 丟棄 {dropped} · 處理 {processed} · 失敗 {failed}"
      },
      "metrics": {
        "total": "總計",
        "allowed": "放行",
        "flagged": "標記",
        "blocked": "阻止",
        "unavailable": "不可用",
        "timeouts": "超時",
        "failovers": "故障切換"
      },
      "pool": {
        "title": "審計池",
        "description": "按順序使用啟用的 OpenAI 兼容節點；探測由服務端真實網絡環境發起。",
        "add": "新增節點",
        "edit": "編輯節點",
        "empty": "尚未配置審計節點。",
        "node": "節點",
        "model": "模型",
        "limits": "超時 / 單片上限",
        "credential": "憑據與探測",
        "configured": "API Key 已配置",
        "missing": "未配置 API Key",
        "probe": "連接測試",
        "probing": "探測中…",
        "probeProgress": "配置校驗 ✓ · 請求已發送 · 等待服務響應…",
        "probeResult": "配置校驗 ✓ · 請求 ✓ · HTTP {http} · {status} · {latency} ms",
        "name": "節點名稱",
        "id": "穩定節點 ID",
        "baseUrl": "Base URL",
        "apiKey": "API Key",
        "keepSecret": "留空以保留已保存的 API Key",
        "secretHint": "明文只在本次編輯內存中存在；保存成功后會立即清除。",
        "clearSecret": "顯式清除已保存的 API Key",
        "timeout": "總超時（毫秒）",
        "inputLimit": "單片 Unicode 字符上限",
        "toggleNode": "切換節點 {name}",
        "deleteConfirm": "從草稿中刪除節點“{name}”？保存配置后生效。"
      },
      "policy": {
        "title": "審計策略",
        "description": "配置適用分組、九類輸入風險、Worker 與隊列邊界。",
        "scope": "適用范圍",
        "allGroups": "全部分組",
        "selectedGroups": "指定分組",
        "searchGroups": "搜索分組",
        "noGroups": "沒有匹配分組",
        "missingGroups": "配置中包含已刪除的分組 ID",
        "selectedCount": "已選擇 {count} 個分組",
        "scanners": "Qwen3Guard 輸入風險分類",
        "workerCount": "Worker 數量",
        "queueCapacity": "持久隊列容量",
        "strategy": "節點策略",
        "strategyHint": "按配置順序優先嘗試，必要時故障切換。"
      },
      "saveBar": {
        "enabled": "啟用提示詞審計",
        "blocking": "同步阻止",
        "storePass": "保存安全事件",
        "dirty": "有未保存的更改",
        "synced": "配置已同步"
      },
      "blockingConfirm": {
        "title": "開啟同步阻止？",
        "message": "適用請求會在帳號選擇、計費和訪問上游之前等待 Guard。命中 Block、Guard 不可用或響應非法時，請求都不會訪問上游。",
        "confirm": "理解風險并開啟"
      },
      "events": {
        "title": "審計事件",
        "description": "按身份、入口、風險、Hash 和時間復核事件，詳情中可查看完整提示詞。",
        "decision": "判定",
        "risk": "風險等級",
        "endpoint": "入口",
        "groupId": "分組 ID",
        "userId": "用戶 ID",
        "apiKeyId": "API Key ID",
        "keyword": "關鍵詞",
        "startAt": "開始時間",
        "endAt": "結束時間",
        "deleteSelected": "刪除選中項（{count}）",
        "deleteByFilter": "按篩選刪除",
        "filterDeleteDialogTitle": "按篩選刪除審計事件",
        "filterDeleteDialogDesc": "選擇刪除的時間范圍與風險條件后即可執行刪除；刪除不可恢復。如需提前查看匹配數量，可先獲取刪除預覽。",
        "filterTimeRange": "刪除時間范圍",
        "filterTimeRangeHint": "將刪除所選截止時間之前產生的事件；預覽后新產生的事件不受影響。",
        "timePresets": {
          "1d": "1 天前",
          "7d": "7 天前",
          "30d": "30 天前",
          "90d": "90 天前",
          "all": "全部時間",
          "custom": "自定義范圍"
        },
        "customRangeInvalid": "自定義范圍需要有效的開始與結束時間，且開始早于結束。",
        "moreConditions": "更多條件（入口 / 關鍵詞 / 分組 / 用戶）",
        "filterDeletePreviewAction": "獲取刪除預覽",
        "filterDeletePreviewing": "正在生成預覽…",
        "filterDeleteNeedPreview": "可直接確認刪除；如需提前查看匹配數量，可先獲取刪除預覽。",
        "filterDeleteConfirmInvalidRange": "請先選擇有效的刪除時間范圍（自定義范圍需開始早于結束）。",
        "filterDeleteConfirmNoMatches": "當前篩選匹配 0 條事件，沒有可刪除的內容。",
        "selectAll": "選擇當前頁全部事件",
        "selectEvent": "選擇事件 {id}",
        "time": "時間",
        "identity": "用戶 / 郵箱 / API Key",
        "user": "用戶名",
        "email": "用戶郵箱",
        "apiKey": "API Key 名稱",
        "group": "分組",
        "route": "入口 / 模型",
        "result": "判定 / 風險",
        "preview": "脫敏預覽",
        "empty": "沒有符合條件的事件。",
        "passEventsDisabled": "當前未開啟“保存安全事件”：安全請求仍會完成審計，但不會出現在事件列表中；Flag 和 Critical 風險事件仍會保存。",
        "openConfiguration": "前往配置",
        "detailTitle": "提示詞審計事件詳情",
        "tabs": {
          "summary": "審計摘要",
          "risks": "具體風險",
          "technical": "技術信息"
        },
        "promptFull": "完整提示詞（未脫敏）",
        "promptFullHint": "完整提示詞已隨事件入庫，僅供管理員復核觸發內容；請按敏感資料妥善處理，切勿外泄。",
        "guardReturn": "模型審計返回",
        "guardReturnHint": "展示 Guard 歸一化后的結構化結果（判定、分類、分數與脫敏證據），不含原始響應體。",
        "riskSummaries": "風險摘要",
        "evidence": "脫敏證據",
        "score": "分數",
        "categories": "分類",
        "model": "模型",
        "stage": "請求階段",
        "noRisks": "本事件沒有派生風險摘要。",
        "requestId": "Request ID",
        "promptHash": "Prompt SHA-256",
        "technical": {
          "scanner": "掃描器",
          "policy": "策略",
          "guardEndpoint": "Guard 節點",
          "config": "配置版本",
          "chunks": "分片數",
          "latency": "耗時",
          "protocol": "協議"
        },
        "deleteConfirmTitle": "刪除審計事件？",
        "deleteConfirmMessage": "將永久刪除 {count} 條事件及符合條件的孤立任務。",
        "filterDeleteCount": "服務端快照匹配 {count} 條事件。",
        "snapshotMax": "快照最大事件 ID",
        "expiresAt": "確認Token過期時間",
        "filterDeleteWarning": "只刪除預覽高水位內的事件；預覽后產生的新事件會保留。篩選一旦變化，必須重新預覽。",
        "confirmFilterDelete": "確認永久刪除"
      },
      "messages": {
        "saved": "提示詞審計配置已保存，明文 API Key 狀態已清除。",
        "probeSucceeded": "審計節點連接正常。",
        "deleted": "已刪除 {count} 條審計事件。"
      },
      "errors": {
        "loadConfig": "無法加載提示詞審計配置。",
        "loadRuntime": "無法加載提示詞審計運行態。",
        "loadGroups": "無法加載分組列表。",
        "loadEvents": "無法加載審計事件。",
        "loadDetail": "無法加載事件詳情。",
        "saveConfig": "配置保存失敗。",
        "probe": "節點探測失敗。",
        "delete": "事件刪除失敗。",
        "previewDelete": "無法生成刪除預覽，請檢查時間范圍。",
        "deleteConfirmation": "刪除確認無效或已過期，請重新預覽。",
        "prompt_audit_config_conflict": "配置已被其他管理員更新。請重新加載服務端配置，再決定如何合并本地草稿。",
        "prompt_guard_requires_audit_enabled": "開啟同步阻止前必須先啟用提示詞審計。",
        "prompt_audit_invalid_endpoint": "審計節點配置無效。",
        "prompt_audit_endpoint_required": "啟用審計前至少需要一個啟用節點。",
        "prompt_audit_groups_required": "指定分組模式至少需要選擇一個分組。",
        "prompt_audit_scanners_required": "至少需要啟用一個風險分類。"
      }
    }
  },
  "payment": {
    "weeks": "周",
    "admin": {
      "validity": "有效期",
      "validityRequired": "有效期必須大于 0"
    }
  }
}
