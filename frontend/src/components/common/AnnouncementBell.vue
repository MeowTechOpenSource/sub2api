<template>
  <div ref="rootRef" class="notification-root">
    <button
      type="button"
      class="notification-trigger"
      :class="{ 'notification-trigger--active': isOpen }"
      :aria-label="t('announcements.title')"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click.stop="togglePopover"
    >
      <Icon name="bell" size="md" />
      <span v-if="unreadCount > 0" class="notification-count">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <Transition name="notification-backdrop">
      <button
        v-if="isOpen"
        type="button"
        class="notification-backdrop"
        :aria-label="t('common.close')"
        @click="closePopover"
      />
    </Transition>

    <Transition name="notification-popover">
      <section
        v-if="isOpen"
        class="notification-popover"
        :aria-label="t('announcements.title')"
        @pointerdown.stop
        @click.stop
      >
        <template v-if="selectedAnnouncement">
          <header class="notification-header">
            <button
              type="button"
              class="notification-icon-button"
              :aria-label="t('common.back')"
              @click="closeDetail"
            >
              <Icon name="chevronLeft" size="sm" />
            </button>
            <div class="notification-header__copy">
              <p>{{ t('announcements.title') }}</p>
              <h2>{{ selectedAnnouncement.title }}</h2>
            </div>
            <button
              type="button"
              class="notification-icon-button"
              :aria-label="t('common.close')"
              @click="closePopover"
            >
              <Icon name="x" size="sm" />
            </button>
          </header>

          <div class="notification-detail">
            <div class="notification-detail__meta">
              <Icon name="clock" size="xs" />
              <time>{{ formatRelativeWithDateTime(selectedAnnouncement.created_at) }}</time>
            </div>
            <div
              class="notification-markdown"
              v-html="renderMarkdown(selectedAnnouncement.content)"
            />
          </div>

          <footer v-if="!selectedAnnouncement.read_at" class="notification-footer">
            <button
              type="button"
              class="btn btn-primary w-full"
              @click="markAsReadAndClose(selectedAnnouncement.id)"
            >
              <Icon name="check" size="sm" />
              {{ t('announcements.markRead') }}
            </button>
          </footer>
        </template>

        <template v-else>
          <header class="notification-header">
            <div class="notification-heading-icon">
              <Icon name="bell" size="sm" />
            </div>
            <div class="notification-header__copy">
              <h2>{{ t('announcements.title') }}</h2>
              <p v-if="unreadCount > 0">
                {{ t('announcements.newCount', { count: unreadCount }, unreadCount) }}
              </p>
              <p v-else>{{ t('announcements.emptyDescription') }}</p>
            </div>
            <button
              type="button"
              class="notification-icon-button"
              :aria-label="t('common.close')"
              @click="closePopover"
            >
              <Icon name="x" size="sm" />
            </button>
          </header>

          <div class="notification-actions">
            <button
              v-if="unreadCount > 0"
              type="button"
              class="notification-text-button"
              :disabled="loading"
              @click="markAllAsRead"
            >
              <Icon name="check" size="xs" />
              {{ t('announcements.markAllRead') }}
            </button>
          </div>

          <div class="notification-list">
            <div v-if="loading" class="notification-state">
              <span class="spinner text-primary-600" />
              <span>{{ t('common.loading') }}</span>
            </div>

            <button
              v-for="item in announcements"
              v-else
              :key="item.id"
              type="button"
              class="notification-item"
              :class="{ 'notification-item--unread': !item.read_at }"
              @click="openDetail(item)"
            >
              <span class="notification-item__status">
                <Icon :name="item.read_at ? 'check' : 'bell'" size="xs" />
              </span>
              <span class="notification-item__copy">
                <strong>{{ item.title }}</strong>
                <time>{{ formatRelativeTime(item.created_at) }}</time>
              </span>
              <Icon name="chevronRight" size="sm" class="notification-item__arrow" />
            </button>

            <div v-if="!loading && announcements.length === 0" class="notification-state notification-state--empty">
              <span class="notification-empty-icon"><Icon name="inbox" size="lg" /></span>
              <strong>{{ t('announcements.empty') }}</strong>
              <span>{{ t('announcements.emptyDescription') }}</span>
            </div>
          </div>
        </template>
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useAppStore } from '@/stores/app'
import { useAnnouncementStore } from '@/stores/announcements'
import { formatRelativeTime, formatRelativeWithDateTime } from '@/utils/format'
import type { UserAnnouncement } from '@/types'
import Icon from '@/components/icons/Icon.vue'

const { t } = useI18n()
const appStore = useAppStore()
const announcementStore = useAnnouncementStore()

marked.setOptions({ breaks: true, gfm: true })

const { announcements, loading } = storeToRefs(announcementStore)
const unreadCount = computed(() => announcementStore.unreadCount)
const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const selectedAnnouncement = ref<UserAnnouncement | null>(null)

function renderMarkdown(content: string): string {
  return content ? DOMPurify.sanitize(marked.parse(content) as string) : ''
}

function togglePopover() {
  isOpen.value ? closePopover() : (isOpen.value = true)
}

function closePopover() {
  isOpen.value = false
  selectedAnnouncement.value = null
}

function openDetail(announcement: UserAnnouncement) {
  selectedAnnouncement.value = announcement
  if (!announcement.read_at) void markAsRead(announcement.id)
}

function closeDetail() {
  selectedAnnouncement.value = null
}

async function markAsRead(id: number) {
  try {
    await announcementStore.markAsRead(id)
  } catch (error: any) {
    appStore.showError(error?.message || t('common.unknownError'))
  }
}

async function markAsReadAndClose(id: number) {
  await markAsRead(id)
  appStore.showSuccess(t('announcements.markedAsRead'))
  closeDetail()
}

async function markAllAsRead() {
  try {
    await announcementStore.markAllAsRead()
    appStore.showSuccess(t('announcements.allMarkedAsRead'))
  } catch (error: any) {
    appStore.showError(error?.message || t('common.unknownError'))
  }
}

function handleDocumentClick(event: MouseEvent) {
  if (isOpen.value && !rootRef.value?.contains(event.target as Node)) closePopover()
}

function handleEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !isOpen.value) return
  selectedAnnouncement.value ? closeDetail() : closePopover()
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.notification-root { position:relative; }
.notification-trigger { position:relative; display:grid; width:36px; height:36px; place-items:center; border:1px solid transparent; border-radius:9px; background:transparent; color:#667085; transition:background-color .16s ease,border-color .16s ease,color .16s ease,transform .16s ease; }
.notification-trigger:hover,.notification-trigger--active { border-color:var(--line); background:color-mix(in srgb,var(--surface) 88%,transparent); color:#276b53; }
.notification-trigger:active { transform:scale(.96); }
.notification-count { position:absolute; top:-5px; right:-6px; min-width:18px; height:18px; padding:0 5px; display:flex; align-items:center; justify-content:center; border:2px solid var(--surface); border-radius:999px; background:#dc2626; color:white; font-size:9px; font-weight:800; line-height:1; }
.notification-backdrop { position:fixed; inset:0; z-index:118; border:0; background:rgba(15,23,42,.28); backdrop-filter:blur(3px); }
.notification-popover { position:fixed; z-index:120; inset:auto 12px 12px; max-height:min(640px,calc(100dvh - 24px)); display:flex; flex-direction:column; overflow:hidden; border:1px solid var(--line); border-radius:14px; background:color-mix(in srgb,var(--surface) 96%,transparent); box-shadow:0 24px 64px rgba(15,23,42,.22); backdrop-filter:blur(20px); }
.notification-header { min-height:66px; padding:14px 16px; display:flex; align-items:center; gap:11px; border-bottom:1px solid var(--line); }
.notification-header__copy { min-width:0; flex:1; }
.notification-header h2 { margin:0; overflow:hidden; color:var(--ink); font-size:15px; font-weight:750; line-height:1.35; text-overflow:ellipsis; white-space:nowrap; }
.notification-header p { margin:3px 0 0; overflow:hidden; color:#7d8799; font-size:10px; line-height:1.35; text-overflow:ellipsis; white-space:nowrap; }
.notification-heading-icon,.notification-item__status,.notification-empty-icon { display:grid; place-items:center; border-radius:9px; background:#f0f7f3; color:#276b53; }
.notification-heading-icon { width:36px; height:36px; flex:0 0 auto; }
.notification-icon-button { width:32px; height:32px; flex:0 0 auto; display:grid; place-items:center; border:0; border-radius:8px; background:transparent; color:#7d8799; transition:background-color .16s ease,color .16s ease; }
.notification-icon-button:hover { background:var(--surface-muted); color:var(--ink); }
.notification-actions { min-height:0; padding:8px 12px 0; display:flex; justify-content:flex-end; }
.notification-actions:empty { display:none; }
.notification-text-button { display:flex; align-items:center; gap:5px; padding:6px 8px; border:0; border-radius:7px; background:transparent; color:#276b53; font-size:10px; font-weight:700; }
.notification-text-button:hover { background:#f0f7f3; }
.notification-list { min-height:110px; max-height:430px; overflow-y:auto; padding:8px; }
.notification-item { width:100%; min-height:64px; padding:10px; display:flex; align-items:center; gap:10px; border:1px solid transparent; border-radius:10px; background:transparent; text-align:left; transition:background-color .16s ease,border-color .16s ease,transform .16s ease; }
.notification-item:hover { border-color:var(--line); background:var(--surface-muted); transform:translateX(2px); }
.notification-item--unread { background:rgba(239,246,255,.66); }
.notification-item__status { width:32px; height:32px; flex:0 0 auto; }
.notification-item:not(.notification-item--unread) .notification-item__status { background:var(--surface-muted); color:#98a2b3; }
.notification-item__copy { min-width:0; flex:1; display:flex; flex-direction:column; gap:4px; }
.notification-item__copy strong { overflow:hidden; color:var(--ink); font-size:12px; font-weight:680; text-overflow:ellipsis; white-space:nowrap; }
.notification-item__copy time { color:#8a94a6; font-size:10px; }
.notification-item__arrow { flex:0 0 auto; color:#a4acb9; }
.notification-state { min-height:150px; display:flex; align-items:center; justify-content:center; gap:9px; color:#7d8799; font-size:11px; }
.notification-state--empty { flex-direction:column; text-align:center; }
.notification-state--empty strong { margin-top:4px; color:var(--ink); font-size:12px; }
.notification-empty-icon { width:44px; height:44px; background:var(--surface-muted); color:#98a2b3; }
.notification-detail { min-height:180px; max-height:480px; overflow-y:auto; padding:18px; }
.notification-detail__meta { margin-bottom:16px; display:flex; align-items:center; gap:6px; color:#8a94a6; font-size:10px; }
.notification-footer { padding:12px; border-top:1px solid var(--line); background:var(--surface-muted); }
.notification-markdown { color:#4b5565; font-size:12px; line-height:1.7; }
.notification-markdown :deep(h1),.notification-markdown :deep(h2),.notification-markdown :deep(h3) { margin:18px 0 8px; color:var(--ink); font-weight:750; }
.notification-markdown :deep(h1) { font-size:18px; }.notification-markdown :deep(h2) { font-size:16px; }.notification-markdown :deep(h3) { font-size:14px; }
.notification-markdown :deep(p),.notification-markdown :deep(ul),.notification-markdown :deep(ol) { margin:0 0 12px; }
.notification-markdown :deep(ul),.notification-markdown :deep(ol) { padding-left:18px; }
.notification-markdown :deep(a) { color:#276b53; text-decoration:underline; text-underline-offset:2px; }
.notification-markdown :deep(code) { padding:2px 5px; border-radius:5px; background:var(--surface-muted); font-family:var(--font-mono); font-size:11px; }
.notification-markdown :deep(pre) { overflow-x:auto; padding:12px; border:1px solid var(--line); border-radius:9px; background:var(--surface-muted); }
.notification-markdown :deep(pre code) { padding:0; background:transparent; }
.notification-markdown :deep(img) { max-width:100%; height:auto; border-radius:8px; }
.notification-popover-enter-active,.notification-popover-leave-active,.notification-backdrop-enter-active,.notification-backdrop-leave-active { transition:opacity .18s ease,transform .18s cubic-bezier(.22,1,.36,1); }
.notification-popover-enter-from,.notification-popover-leave-to,.notification-backdrop-enter-from,.notification-backdrop-leave-to { opacity:0; }
.notification-popover-enter-from,.notification-popover-leave-to { transform:translateY(10px) scale(.985); }
.dark .notification-heading-icon,.dark .notification-item__status { background:rgba(39,107,83,.14); }.dark .notification-item--unread { background:rgba(39,107,83,.1); }.dark .notification-markdown { color:#cbd5e1; }
@media(min-width:640px){.notification-backdrop{display:none}.notification-popover{position:absolute; inset:calc(100% + 10px) 0 auto auto; width:380px; max-height:min(640px,calc(100vh - 90px)); border-radius:12px}.notification-popover-enter-from,.notification-popover-leave-to{transform:translateY(-6px) scale(.985)}}
@media(prefers-reduced-motion:reduce){.notification-popover-enter-active,.notification-popover-leave-active,.notification-backdrop-enter-active,.notification-backdrop-leave-active{transition-duration:1ms}}
</style>
