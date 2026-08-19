<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div
        v-if="displayedAnnouncement"
        class="public-notice-backdrop"
      >
        <div
          class="public-notice"
          role="dialog"
          aria-modal="true"
          :aria-label="displayedAnnouncement.title"
          @pointerdown.stop
          @click.stop
        >
          <header class="public-notice__header">
            <div class="public-notice__heading">
              <span class="public-notice__icon"><Icon name="bell" size="md" /></span>
              <div>
                <span class="public-notice__label">{{ t('announcements.unread') }}</span>
                <h2>
                  {{ displayedAnnouncement.title }}
                </h2>
              </div>
            </div>
            <div class="public-notice__time">
              <Icon name="clock" size="sm" />
              <time>{{ formatRelativeWithDateTime(displayedAnnouncement.created_at) }}</time>
            </div>
          </header>

          <div class="public-notice__body">
            <div class="markdown-body prose prose-sm max-w-none dark:prose-invert" v-html="renderedContent"></div>
          </div>

          <footer class="public-notice__footer">
            <button class="btn btn-primary public-notice__action" data-testid="announcement-popup-dismiss" @click="handleDismiss">
              <Icon :name="preview ? 'x' : 'check'" size="sm" />
              {{ preview ? t('common.close') : t('announcements.markRead') }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useAnnouncementStore } from '@/stores/announcements'
import { formatRelativeWithDateTime } from '@/utils/format'
import Icon from '@/components/icons/Icon.vue'
import type { Announcement, UserAnnouncement } from '@/types'

type PreviewAnnouncement = Pick<Announcement | UserAnnouncement, 'title' | 'content' | 'created_at'>

const props = withDefaults(defineProps<{
  announcement?: PreviewAnnouncement | null
  preview?: boolean
}>(), {
  announcement: null,
  preview: false,
})

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const announcementStore = useAnnouncementStore()
const displayedAnnouncement = computed(() => (
  props.preview ? props.announcement : announcementStore.currentPopup
))

marked.setOptions({
  breaks: true,
  gfm: true,
})

const renderedContent = computed(() => {
  const content = displayedAnnouncement.value?.content
  if (!content) return ''
  const html = marked.parse(content) as string
  return DOMPurify.sanitize(html)
})

function handleDismiss() {
  if (props.preview) {
    emit('close')
    return
  }
  announcementStore.dismissPopup()
}

let previousBodyOverflow = ''

watch(
  displayedAnnouncement,
  (popup) => {
    if (popup) {
      if (!previousBodyOverflow) previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = previousBodyOverflow
      previousBodyOverflow = ''
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
})
</script>

<style scoped>
.public-notice-backdrop { position:fixed; inset:0; z-index:140; display:grid; place-items:center; padding:20px; overflow-y:auto; background:rgba(25,29,25,.52); backdrop-filter:blur(10px); }
.public-notice { width:min(640px,100%); max-height:min(760px,calc(100dvh - 40px)); display:flex; flex-direction:column; overflow:hidden; border:1px solid rgba(57,48,28,.14); border-radius:14px; background:rgba(255,253,244,.97); box-shadow:0 28px 76px rgba(32,37,31,.22),0 1px 0 rgba(255,255,255,.9) inset; backdrop-filter:blur(22px); transition:transform .22s cubic-bezier(.22,1,.36,1),opacity .18s ease; }
.public-notice__header { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; padding:22px 24px; border-bottom:1px solid rgba(57,48,28,.1); }
.public-notice__heading { min-width:0; display:flex; align-items:flex-start; gap:13px; }
.public-notice__icon { width:42px; height:42px; flex:0 0 auto; display:grid; place-items:center; border:1px solid rgba(39,107,83,.17); border-radius:10px; background:rgba(39,107,83,.08); color:#276b53; }
.public-notice__label { display:block; margin:1px 0 4px; color:#276b53; font-size:10px; font-weight:800; text-transform:uppercase; }
.public-notice h2 { margin:0; overflow-wrap:anywhere; color:#29271f; font-size:20px; font-weight:740; line-height:1.35; }
.public-notice__time { flex:0 0 auto; display:flex; align-items:center; gap:6px; padding-top:4px; color:#8b846f; font-size:10px; }
.public-notice__body { min-height:130px; padding:24px; overflow-y:auto; color:#454238; line-height:1.7; overscroll-behavior:contain; }
.public-notice__footer { display:flex; justify-content:flex-end; padding:14px 20px; border-top:1px solid rgba(57,48,28,.1); background:rgba(247,243,226,.68); }
.public-notice__action { display:inline-flex; align-items:center; gap:8px; }
.dark .public-notice { border-color:rgba(255,255,255,.1); background:rgba(29,32,28,.97); }.dark .public-notice h2{color:#f1eddf}.dark .public-notice__header,.dark .public-notice__footer{border-color:rgba(255,255,255,.08)}.dark .public-notice__footer{background:rgba(255,255,255,.025)}.dark .public-notice__body{color:#d8d3c3}
.popup-fade-enter-active {
  transition: opacity .22s ease;
}

.popup-fade-leave-active {
  transition: opacity .16s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

.popup-fade-enter-from > div {
  transform: scale(.975) translateY(8px);
  opacity: 0;
}

.popup-fade-leave-to > div {
  transform: scale(.985) translateY(5px);
  opacity: 0;
}

/* Scrollbar Styling */
.public-notice__body::-webkit-scrollbar {
  width: 8px;
}

.public-notice__body::-webkit-scrollbar-track {
  background: transparent;
}

.public-notice__body::-webkit-scrollbar-thumb {
  background:#b7b09d;
  border-radius: 4px;
}

.dark .public-notice__body::-webkit-scrollbar-thumb {
  background:#5d625a;
}
@media(max-width:600px){.public-notice-backdrop{padding:12px}.public-notice{max-height:calc(100dvh - 24px)}.public-notice__header{padding:18px;flex-direction:column;gap:12px}.public-notice__time{padding-left:55px}.public-notice__body{padding:20px 18px}.public-notice__footer{padding:12px 16px}.public-notice__action{width:100%;justify-content:center}}
@media(prefers-reduced-motion:reduce){.popup-fade-enter-active,.popup-fade-leave-active{transition-duration:1ms}}
</style>
