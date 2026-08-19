<template>
  <div class="reasoning-policy space-y-4">
    <div>
      <label :for="`${idPrefix}-max-effort`" class="input-label">
        {{ t("admin.groups.form.maxReasoningEffort") }}
      </label>
      <Select
        :id="`${idPrefix}-max-effort`"
        :model-value="maxEffort"
        :options="reasoningEffortOptions"
        :placeholder="t('admin.groups.form.maxReasoningEffortUnlimited')"
        :aria-label="t('admin.groups.form.maxReasoningEffort')"
        :searchable="false"
        clearable
        @update:model-value="updateMaxEffort"
      />
      <p class="input-hint">{{ t("admin.groups.form.maxReasoningEffortHint") }}</p>
    </div>

    <div class="reasoning-policy__mappings border-t border-gray-200 pt-4 dark:border-dark-600">
      <div class="mb-3 flex items-center justify-between gap-3">
        <label class="input-label mb-0">
          {{ t("admin.groups.form.reasoningEffortMappings") }}
        </label>
        <button
          type="button"
          class="reasoning-policy__add inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:text-primary-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
          @click="addMapping"
        >
          <Icon name="plus" size="sm" />
          {{ t("admin.groups.form.addReasoningEffortMapping") }}
        </button>
      </div>

      <div v-if="mappings.length > 0" class="space-y-2">
        <div
          v-for="row in mappings"
          :key="row.id"
          class="reasoning-policy__mapping rounded-lg border border-gray-200 bg-gray-50/40 p-3 dark:border-dark-600 dark:bg-dark-800/40"
        >
          <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] md:items-start">
            <div>
              <label :for="`${idPrefix}-${row.id}-from`" class="input-label">
                {{ t("admin.groups.form.reasoningEffortFrom") }}
              </label>
              <Select
                :id="`${idPrefix}-${row.id}-from`"
                :model-value="row.from"
                :options="reasoningEffortOptions"
                :placeholder="t('admin.groups.form.reasoningEffortFromPlaceholder')"
                :error="showValidation && !!validationErrors[row.id]?.from"
                :aria-label="t('admin.groups.form.reasoningEffortFrom')"
                :aria-describedby="showValidation && validationErrors[row.id]?.from ? `${idPrefix}-${row.id}-from-error` : undefined"
                :searchable="false"
                clearable
                @update:model-value="updateMapping(row.id, 'from', $event)"
              />
              <p
                v-if="showValidation && validationErrors[row.id]?.from"
                :id="`${idPrefix}-${row.id}-from-error`"
                class="mt-1 text-xs text-red-600 dark:text-red-400"
                role="alert"
              >
                {{ mappingErrorText(validationErrors[row.id]?.from) }}
              </p>
            </div>

            <div class="hidden pt-8 text-gray-400 md:block dark:text-dark-400">
              <Icon name="arrowRight" size="sm" />
            </div>

            <div>
              <label :for="`${idPrefix}-${row.id}-to`" class="input-label">
                {{ t("admin.groups.form.reasoningEffortTo") }}
              </label>
              <Select
                :id="`${idPrefix}-${row.id}-to`"
                :model-value="row.to"
                :options="reasoningEffortOptions"
                :placeholder="t('admin.groups.form.reasoningEffortToPlaceholder')"
                :error="showValidation && !!validationErrors[row.id]?.to"
                :aria-label="t('admin.groups.form.reasoningEffortTo')"
                :aria-describedby="showValidation && validationErrors[row.id]?.to ? `${idPrefix}-${row.id}-to-error` : undefined"
                :searchable="false"
                clearable
                @update:model-value="updateMapping(row.id, 'to', $event)"
              />
              <p
                v-if="showValidation && validationErrors[row.id]?.to"
                :id="`${idPrefix}-${row.id}-to-error`"
                class="mt-1 text-xs text-red-600 dark:text-red-400"
                role="alert"
              >
                {{ mappingErrorText(validationErrors[row.id]?.to) }}
              </p>
            </div>

            <button
              type="button"
              class="reasoning-policy__remove flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 md:mt-6 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              :title="t('admin.groups.form.removeReasoningEffortMapping')"
              :aria-label="t('admin.groups.form.removeReasoningEffortMapping')"
              @click="removeMapping(row.id)"
            >
              <Icon name="trash" size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { GroupPlatform } from "@/types";
import Icon from "@/components/icons/Icon.vue";
import Select from "@/components/common/Select.vue";
import {
  createReasoningEffortMappingRow,
  reasoningEffortOptionsForPlatform,
  validateReasoningEffortMappings,
  type ReasoningEffortMappingErrorCode,
  type ReasoningEffortMappingRow,
} from "@/views/admin/groupsReasoningEffort";

const props = defineProps<{
  idPrefix: string;
  platform: GroupPlatform;
  maxEffort: string;
  mappings: ReasoningEffortMappingRow[];
}>();

const emit = defineEmits<{
  (event: "update:maxEffort", value: string): void;
  (event: "update:mappings", value: ReasoningEffortMappingRow[]): void;
}>();

const { t } = useI18n();
const showValidation = ref(false);
const reasoningEffortOptions = computed(() =>
  reasoningEffortOptionsForPlatform(props.platform),
);
const validationErrors = computed(() =>
  validateReasoningEffortMappings(props.mappings, props.platform),
);

const asString = (value: string | number | boolean | null): string =>
  value == null ? "" : String(value);

const updateMaxEffort = (value: string | number | boolean | null) => {
  emit("update:maxEffort", asString(value));
};

const updateMapping = (
  id: string,
  field: "from" | "to",
  value: string | number | boolean | null,
) => {
  emit(
    "update:mappings",
    props.mappings.map((row) =>
      row.id === id ? { ...row, [field]: asString(value) } : row,
    ),
  );
};

const addMapping = () => {
  emit("update:mappings", [
    ...props.mappings,
    createReasoningEffortMappingRow(),
  ]);
};

const removeMapping = (id: string) => {
  emit(
    "update:mappings",
    props.mappings.filter((row) => row.id !== id),
  );
};

const mappingErrorText = (
  code: ReasoningEffortMappingErrorCode | undefined,
): string => (code ? t(`admin.groups.form.${code}`) : "");

const validate = (): boolean => {
  showValidation.value = true;
  return Object.keys(validationErrors.value).length === 0;
};

const resetValidation = () => {
  showValidation.value = false;
};

defineExpose({ validate, resetValidation });
</script>

<style scoped>
.reasoning-policy { padding:16px; border:1px solid color-mix(in srgb,var(--line) 86%,transparent); border-radius:14px; background:color-mix(in srgb,var(--surface) 82%,#f8f2d8 18%); box-shadow:0 1px 0 rgba(255,255,255,.72) inset,0 10px 28px rgba(52,61,49,.055); }
.reasoning-policy__mappings { border-color:color-mix(in srgb,var(--line) 78%,transparent); }
.reasoning-policy__add { border:1px solid rgba(39,107,83,.16); background:rgba(255,255,255,.58); box-shadow:0 4px 12px rgba(39,107,83,.06); }
.reasoning-policy__add:hover { transform:translateY(-1px); box-shadow:0 7px 18px rgba(39,107,83,.1); }
.reasoning-policy__mapping { border-color:color-mix(in srgb,var(--line) 86%,transparent); border-radius:12px; background:color-mix(in srgb,var(--surface) 92%,#eef5ef 8%); box-shadow:0 1px 0 rgba(255,255,255,.72) inset; animation:reasoning-mapping-enter .22s cubic-bezier(.22,1,.36,1) both; }
.reasoning-policy__remove { border:1px solid transparent; }
.reasoning-policy__remove:hover { transform:translateY(-1px); }
.dark .reasoning-policy { background:rgba(24,34,29,.72); box-shadow:0 1px 0 rgba(255,255,255,.04) inset; }
.dark .reasoning-policy__add { background:rgba(255,255,255,.035); }
.dark .reasoning-policy__mapping { background:rgba(255,255,255,.025); box-shadow:0 1px 0 rgba(255,255,255,.035) inset; }
@keyframes reasoning-mapping-enter { from { opacity:0; transform:translateY(5px) scale(.992); } to { opacity:1; transform:none; } }
@media(max-width:640px){.reasoning-policy{padding:13px}.reasoning-policy__add{min-height:38px;font-size:12px}}
@media(prefers-reduced-motion:reduce){.reasoning-policy__mapping{animation:none}.reasoning-policy__add,.reasoning-policy__remove{transition:none}}
</style>
