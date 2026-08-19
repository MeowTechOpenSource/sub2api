<template>
  <!-- 后台内嵌形态:?embedded=1 且已登录,套完整后台布局 -->
  <AppLayout v-if="isEmbedded">
    <ModelPlazaContent :response="data" :loading="loading" :error="loadFailed" embedded @reload="loadData" />
  </AppLayout>

  <!-- 独立形态:自带导航条(logo/站名 + 登录/回后台) -->
  <div v-else class="plaza-shell min-h-screen">
    <PlazaNavBar />
    <main class="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <ModelPlazaContent :response="data" :loading="loading" :error="loadFailed" @reload="loadData" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import PlazaNavBar from '@/components/modelPlaza/PlazaNavBar.vue'
import ModelPlazaContent from '@/components/modelPlaza/ModelPlazaContent.vue'
import { getModelPlaza, type ModelPlazaResponse } from '@/api/modelPlaza'
import { userChannelsAPI, type UserAvailableGroup } from '@/api/channels'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()

// embedded=1 但未登录(如转发的链接)自动降级为独立形态。
const isEmbedded = computed(() => authStore.isAuthenticated && route.query.standalone !== '1')

const data = ref<ModelPlazaResponse | null>(null)
const loading = ref(true)
const loadFailed = ref(false)

async function loadData() {
  loading.value = true
  loadFailed.value = false
  // 独立形态导航条需要站点名/Logo;有 __APP_CONFIG__ 注入时同步命中缓存。
  void appStore.fetchPublicSettings()
  try {
    const plaza = await getModelPlaza()
    if (authStore.isAuthenticated) {
      const channels = await userChannelsAPI.getAvailable().catch(() => [])
      const access = new Map<number, UserAvailableGroup>()
      channels.forEach((channel) => channel.platforms.forEach((section) => {
        section.groups.forEach((group) => access.set(group.id, group))
      }))
      plaza.groups = plaza.groups.map((group) => {
        const detail = access.get(group.id)
        return detail ? {
          ...group,
          peak_rate_active: detail.peak_rate_active,
          happy_hour_events: detail.happy_hour_events,
          active_happy_hour: detail.active_happy_hour,
          five_hour_quota_remaining: detail.five_hour_quota_remaining,
          five_hour_quota_total: detail.five_hour_quota_total,
          seven_day_quota_remaining: detail.seven_day_quota_remaining,
          seven_day_quota_total: detail.seven_day_quota_total,
        } : group
      })
    }
    data.value = plaza
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.plaza-shell {
  background: #f8f2d8;
  color: #29271f;
}

.dark .plaza-shell {
  background: #171914;
  color: #eeeadd;
}
</style>
