<template>
  <section class="plaza-filters">
    <div class="plaza-filters__top">
      <label class="plaza-search">
        <Icon name="search" size="sm" />
        <input
          :value="search"
          type="search"
          :placeholder="t('modelPlaza.filters.searchPlaceholder')"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        />
        <button v-if="search" type="button" :aria-label="t('common.close')" @click="$emit('update:search', '')">
          <Icon name="x" size="xs" />
        </button>
      </label>

      <div class="plaza-rate" role="group" :aria-label="t('modelPlaza.filters.rateLabel')">
        <button :class="{ active: rate === 'all' }" type="button" @click="$emit('update:rate', 'all')">
          {{ t('modelPlaza.filters.allRates') }}
        </button>
        <button
          v-for="item in rates"
          :key="item"
          type="button"
          :disabled="!rateEnabled(item)"
          :class="{ active: rate === item }"
          @click="$emit('update:rate', item)"
        >{{ item }}x</button>
      </div>
    </div>

    <div class="filter-row">
      <span>{{ t('modelPlaza.filters.platformLabel') }}</span>
      <div class="filter-scroll" role="group">
        <button type="button" :class="{ active: platform === 'all' }" @click="$emit('update:platform', 'all')">
          {{ t('modelPlaza.filters.all') }}
        </button>
        <button
          v-for="item in platforms"
          :key="item"
          type="button"
          :disabled="!platformEnabled(item)"
          :class="{ active: platform === item }"
          @click="$emit('update:platform', item)"
        >
          <PlatformIcon :platform="item as GroupPlatform" size="xs" />
          {{ item }}
        </button>
      </div>
    </div>

    <div class="filter-row filter-row--groups">
      <span>{{ t('modelPlaza.filters.accessLabel') }}</span>
      <div class="filter-scroll" role="group">
        <button type="button" :class="{ active: groupId === 'all' }" @click="$emit('update:groupId', 'all')">
          {{ t('modelPlaza.filters.allGroups') }}
          <small>{{ groups.length }}</small>
        </button>
        <button
          v-for="group in groups"
          :key="group.id"
          type="button"
          :disabled="!groupEnabled(group)"
          :class="{ active: groupId === group.id }"
          @click="$emit('update:groupId', group.id)"
        >
          {{ group.name }}
          <small>{{ group.modelCount }}</small>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import PlatformIcon from '@/components/common/PlatformIcon.vue'
import type { GroupPlatform } from '@/types'

const props = defineProps<{
  platforms: string[]
  groups: Array<{ id: number; name: string; platform: string; rate: number; modelCount: number }>
  rates: number[]
  platform: string
  groupId: number | 'all'
  rate: number | 'all'
  search: string
}>()

defineEmits<{
  'update:platform': [value: string]
  'update:groupId': [value: number | 'all']
  'update:rate': [value: number | 'all']
  'update:search': [value: string]
}>()

const { t } = useI18n()

function platformEnabled(platform: string): boolean {
  return props.groups.some((group) => group.platform === platform &&
    (props.groupId === 'all' || group.id === props.groupId) &&
    (props.rate === 'all' || group.rate === props.rate))
}
function groupEnabled(group: { platform: string; rate: number }): boolean {
  return (props.platform === 'all' || group.platform === props.platform) &&
    (props.rate === 'all' || group.rate === props.rate)
}
function rateEnabled(rate: number): boolean {
  return props.groups.some((group) => group.rate === rate &&
    (props.platform === 'all' || group.platform === props.platform) &&
    (props.groupId === 'all' || group.id === props.groupId))
}
</script>

<style scoped>
.plaza-filters { position: relative; z-index: 20; display: grid; gap: 14px; padding: 17px 18px; border: 1px solid rgba(57,48,28,.11); border-radius: 12px; background: rgba(255,253,244,.74); box-shadow: 0 16px 40px rgba(67,55,26,.07); backdrop-filter: blur(20px); }
.plaza-filters__top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.plaza-search { display: flex; width: min(440px,100%); min-height: 44px; align-items: center; gap: 10px; padding: 0 13px; border: 1px solid rgba(57,48,28,.13); border-radius: 10px; background: rgba(255,255,255,.72); color: #88806c; transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
.plaza-search:focus-within { border-color: rgba(39,107,83,.42); box-shadow: 0 0 0 3px rgba(39,107,83,.09); transform: translateY(-1px); }
.plaza-search input { width: 100%; border: 0; outline: 0; background: transparent; color: #302e26; font-size: 14px; }
.plaza-search input::-webkit-search-cancel-button { display: none; }.plaza-search button { display: grid; padding: 3px; border: 0; background: transparent; color: inherit; }
.plaza-rate { display: flex; gap: 3px; padding: 3px; border-radius: 9px; background: rgba(86,76,52,.07); overflow-x: auto; }
.plaza-rate button,.filter-scroll button { min-height: 34px; border: 0; border-radius: 7px; background: transparent; color: #746d5d; font-size: 12px; font-weight: 700; white-space: nowrap; transition: background .16s ease, color .16s ease, box-shadow .16s ease, transform .16s ease; }
.plaza-rate button { padding: 0 10px; }.plaza-rate button.active,.filter-scroll button.active { background: rgba(255,255,255,.92); color: #205b45; box-shadow: 0 3px 10px rgba(44,78,63,.1); }
.plaza-rate button:hover:not(:disabled),.filter-scroll button:hover:not(:disabled) { color: #205b45; transform: translateY(-1px); }
.plaza-rate button:disabled,.filter-scroll button:disabled { cursor: not-allowed; opacity: .36; }
.filter-row { display: grid; grid-template-columns: 86px minmax(0,1fr); align-items: center; gap: 10px; }
.filter-row>span { color: #8a826d; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.filter-scroll { display: flex; min-width: 0; gap: 5px; overflow-x: auto; scrollbar-width: thin; padding: 2px 2px 5px; }
.filter-scroll button { display: inline-flex; align-items: center; gap: 7px; padding: 0 10px; }
.filter-scroll small { min-width: 20px; padding: 2px 5px; border-radius: 5px; background: rgba(86,76,52,.08); color: #8b836f; font-size: 9px; font-weight: 800; }
.filter-scroll button.active small { background: rgba(39,107,83,.1); color: #205b45; }
.filter-row--groups { padding-top: 11px; border-top: 1px solid rgba(57,48,28,.08); }
.dark .plaza-filters { border-color: rgba(255,255,255,.09); background: rgba(31,33,28,.76); }.dark .plaza-search { border-color: rgba(255,255,255,.09); background: rgba(255,255,255,.05); }.dark .plaza-search input { color: #f1ede2; }.dark .plaza-rate button.active,.dark .filter-scroll button.active { background: rgba(255,255,255,.08); color: #91cbb0; }
@media (max-width: 720px) { .plaza-filters { padding: 14px; }.plaza-filters__top { align-items: stretch; flex-direction: column; }.plaza-search { width: 100%; }.plaza-rate { width: 100%; }.filter-row { grid-template-columns: 1fr; gap: 5px; }.filter-row>span { padding-left: 2px; } }
</style>
