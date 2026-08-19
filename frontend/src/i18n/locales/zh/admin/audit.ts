export default {
  audit: {
    title: '操作日志',
    description: '记录管理员与用户的管理面操作，请求头凭证仅保留首尾、请求体已脱敏。日志无法单条删除，全量清理需二次验证。',
    clearAll: '全部清理',
    empty: '暂无操作日志',
    loadFailed: '加载操作日志失败',
    filters: {
      all: '全部',
      q: '关键字',
      qPlaceholder: '路径 / 动作 / 操作者邮箱',
      actorEmail: '操作者邮箱',
      action: '动作',
      clientIp: '客户端 IP',
      method: '请求方法',
      authMethod: '认证方式',
      result: '结果',
      resultSuccess: '成功',
      resultFailure: '失败',
      startTime: '开始时间',
      endTime: '结束时间'
    },
    columns: {
      time: '时间',
      actor: '操作者',
      action: '动作',
      method: '方法',
      result: '结果',
      clientIp: '客户端 IP',
      detail: '详情'
    },
    detail: {
      title: '操作日志详情',
      actorRole: '角色',
      methodPath: '方法 / 路径',
      latency: '耗时',
      requestId: '请求 ID',
      credential: '凭证（掩码）',
      userAgent: 'User-Agent',
      requestBody: '请求体（已脱敏）',
      extra: '附加信息'
    },
    clearConfirm: {
      title: '清理全部操作日志',
      message: '此操作将永久删除所有操作日志，且不可恢复。清理动作本身会被留痕记录。确定继续吗？',
      totpTitle: '输入二次验证码',
      totpHint: '清理操作日志需要现场验证 TOTP 验证码。',
      success: '已清理 {count} 条操作日志',
      failed: '清理操作日志失败'
    },
    values: {
      actionFormat: '{resource}：{verb}',
      unknownAction: '未知操作',
      authMethods: {
        jwt: '登录会话',
        adminApiKey: '管理员 API 密钥'
      },
      roles: {
        admin: '管理员',
        user: '用户',
        system: '系统',
        unknown: '未知角色'
      },
      verbs: {
        create: '创建', update: '更新', delete: '删除', read: '查看', import: '导入', export: '导出',
        clear: '清理', restore: '恢复', download: '下载', regenerate: '重新生成', verify: '验证',
        login: '登录', register: '注册', refresh: '刷新'
      },
      resources: {
        system: '系统', auth: '身份认证', accounts: '账号', backups: '备份', settings: '系统设置',
        users: '用户', groups: '分组', proxies: '代理', redeem_codes: '兑换码', audit_log: '操作日志',
        admin_api_key: '管理员 API 密钥', api_keys: 'API 密钥', s3_config: 'S3 配置',
        data_management: '数据管理', totp: '双重验证', session_binding: '会话绑定'
      },
      specialActions: {
        login: '登录', login2fa: '完成双重验证登录', register: '注册账号', tokenRefresh: '刷新登录会话',
        sessionBindingMismatch: '会话安全信息不匹配', stepUpVerify: '验证敏感操作', auditLogClear: '清理全部操作日志'
      }
    }
  }
}
