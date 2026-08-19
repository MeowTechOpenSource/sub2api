<template>
  <button
    type="button"
    :disabled="disabled"
    @click="toggle"
    class="vue-switch"
    :class="{ 'vue-switch--checked': modelValue }"
    role="switch"
    :aria-checked="modelValue"
  >
    <span
      class="vue-switch__thumb"
    />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped>
.vue-switch { position:relative; width:42px; height:24px; flex:0 0 auto; padding:0; border:1px solid rgba(100,116,139,.2); border-radius:999px; background:#d7dce3; box-shadow:inset 0 1px 2px rgba(15,23,42,.08); transition:background-color .18s ease,border-color .18s ease,box-shadow .18s ease; }
.vue-switch:focus-visible { outline:0; border-color:#276b53; box-shadow:0 0 0 3px rgba(39,107,83,.16); }.vue-switch:disabled { cursor:not-allowed; opacity:.5; }
.vue-switch--checked { border-color:#276b53; background:#276b53; }
.vue-switch__thumb { position:absolute; top:2px; left:2px; width:18px; height:18px; border:1px solid rgba(15,23,42,.08); border-radius:50%; background:white; box-shadow:0 2px 5px rgba(15,23,42,.18); transition:transform .2s cubic-bezier(.22,1,.36,1); }
.vue-switch--checked .vue-switch__thumb { transform:translateX(18px); }.dark .vue-switch { background:#465164; border-color:#596579; }.dark .vue-switch--checked { background:#357f63; border-color:#5aa382; }
@media(prefers-reduced-motion:reduce){.vue-switch,.vue-switch__thumb{transition-duration:1ms}}
</style>
