<template>
  <AppLayout hide-nav>
    <div class="chat-workspace" @dragover.prevent @drop.prevent="handleDrop">
      <aside class="chat-history" :class="{ 'chat-history--open': historyOpen }">
        <div class="chat-history__header">
          <button class="chat-new" type="button" @click="createConversation">
            <Icon name="edit" size="sm" />
            <span>{{ t('chat.newChat') }}</span>
          </button>
          <button class="chat-history__close" type="button" :aria-label="t('common.close')" @click="historyOpen = false">
            <Icon name="x" size="sm" />
          </button>
        </div>
        <label class="chat-history-search">
          <Icon name="search" size="sm" />
          <input v-model="historyQuery" :placeholder="t('chat.searchHistory')" />
        </label>
        <div class="chat-context-shortcuts">
          <button type="button" @click="contextPanel = 'knowledge'"><Icon name="book" size="sm" /><span>{{ t('chat.knowledgeBase') }}</span><small>{{ enabledKnowledgeCount }}</small></button>
          <button type="button" :class="{ active: memoryEnabled && memory.trim() }" @click="contextPanel = 'memory'"><Icon name="lightbulb" size="sm" /><span>{{ t('chat.memory') }}</span><small><Icon v-if="memoryEnabled && memory.trim()" name="check" size="xs" /></small></button>
        </div>
        <div class="chat-history__section-label">{{ t('chat.history') }}</div>
        <div class="chat-history__list">
          <div
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            class="chat-history-row"
            :class="{ 'chat-history-row--active': conversation.id === activeConversationId }"
          >
            <button type="button" class="chat-history-item" @click="openConversation(conversation.id)">
              <span class="chat-history-item__icon"><Icon name="chat" size="xs" /></span>
              <span class="chat-history-item__copy">
                <strong>{{ conversation.title }}</strong>
                <small>{{ formatConversationDate(conversation.updatedAt) }}</small>
              </span>
            </button>
            <button type="button" class="chat-history-item__delete" :title="t('common.delete')" @click="requestDelete(conversation.id)">
              <Icon name="trash" size="xs" />
            </button>
          </div>
          <div v-if="!filteredConversations.length" class="chat-history__empty">
            <Icon name="inbox" size="md" />
            <span>{{ t('chat.noHistory') }}</span>
          </div>
        </div>
        <button class="chat-history__account" type="button" :title="t('nav.dashboard')" @click="goToDashboard">
          <span class="chat-history__account-avatar">{{ accountInitials }}</span>
          <span class="chat-history__account-copy">
            <strong>{{ accountName }}</strong>
            <small>{{ authStore.user?.email }}</small>
          </span>
          <Icon name="arrowRight" size="xs" />
        </button>
      </aside>

      <button v-if="historyOpen" class="chat-history-backdrop" type="button" :aria-label="t('common.close')" @click="historyOpen = false" />

      <section ref="chatMainEl" class="chat-main" :class="{ 'chat-main--empty': !activeConversation?.messages.length }">
        <header class="chat-topbar">
          <div class="chat-topbar__title">
            <button class="chat-icon-button chat-menu-button" type="button" :title="t('chat.history')" @click="historyOpen = true">
              <Icon name="menu" size="sm" />
            </button>
            <div>
              <strong>{{ selectedModel || t('chat.title') }}</strong>
              <span>{{ activeConversation?.title || t('chat.newChat') }}</span>
            </div>
          </div>
          <div class="chat-config">
            <button class="chat-group-trigger" type="button" :title="t('chat.changeGroup')" @click="openGroupPicker">
              <Icon name="cube" size="sm" />
              <span>{{ selectedGroup?.name || t('chat.selectGroup') }}</span>
            </button>
            <div ref="modelPickerEl" class="chat-model-picker">
              <span class="chat-model-picker__label">{{ t('chat.model') }}</span>
              <button
                class="chat-model-trigger"
                type="button"
                :disabled="loadingModels || !selectedKey"
                @click.stop="modelPickerOpen = !modelPickerOpen"
              >
                <ModelIcon v-if="selectedModel" :model="selectedModel" size="20px" />
                <Icon v-else name="cube" size="sm" />
                <span class="chat-model-trigger__copy">
                  <strong>{{ loadingModels ? t('common.loading') : selectedModel || t('chat.selectModel') }}</strong>
                  <small v-if="selectedModel">{{ formatModelPrice(selectedModelMeta?.pricing || null) }}</small>
                </span>
                <Icon name="chevronDown" size="xs" />
              </button>
              <div v-if="modelPickerOpen" class="chat-model-menu" @click.stop>
                <label class="chat-model-search">
                  <Icon name="search" size="sm" />
                  <input ref="modelSearchInput" v-model="modelSearch" :placeholder="t('chat.searchModels')" @keydown.esc="modelPickerOpen = false" />
                </label>
                <div class="chat-model-options">
                  <button
                    v-for="option in filteredModelOptions"
                    :key="option.name"
                    type="button"
                    class="chat-model-option"
                    :class="{ 'chat-model-option--active': option.name === selectedModel }"
                    @click="chooseModel(option.name)"
                  >
                    <span class="chat-model-option__icon"><ModelIcon :model="option.name" size="21px" /></span>
                    <span class="chat-model-option__copy">
                      <strong>{{ option.name }}</strong>
                      <small>{{ option.platform || t('chat.model') }}</small>
                    </span>
                    <span class="chat-model-option__price">{{ formatModelPrice(option.pricing) }}</span>
                    <Icon v-if="option.name === selectedModel" name="check" size="xs" />
                  </button>
                  <div v-if="!filteredModelOptions.length" class="chat-model-options__empty">{{ t('chat.noModels') }}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div ref="messagesEl" class="chat-messages">
          <div v-if="!activeConversation?.messages.length" class="chat-welcome">
            <span class="chat-welcome__mark"><Icon name="sparkles" size="lg" /></span>
            <h1>{{ t('chat.welcomeTitle') }}</h1>
            <p>{{ t('chat.welcomeDescription') }}</p>
            <div class="chat-prompts">
              <button v-for="prompt in starterPrompts" :key="prompt" type="button" @click="draft = prompt">
                {{ prompt }}
              </button>
            </div>
          </div>

          <article v-for="message in activeConversation?.messages || []" :key="message.id" class="chat-message" :data-message-id="message.id" :class="[`chat-message--${message.role}`, { 'chat-message--pending': message.pending }]">
            <div class="chat-message__avatar">
              <ModelIcon v-if="message.role === 'assistant'" :model="message.model || activeConversation?.model || selectedModel" size="19px" />
              <Icon v-else name="user" size="sm" />
            </div>
            <div class="chat-message__content">
              <details
                v-if="(message.reasoningEnabled && message.pending) || message.reasoning"
                class="chat-reasoning-panel"
                :open="expandedReasoningIds.has(message.id)"
                @toggle="syncReasoningOpen(message.id, $event)"
              >
                <summary>
                  <span class="chat-reasoning-panel__mark"><Icon name="sparkles" size="xs" /></span>
                  <span class="chat-reasoning-title" :class="{ 'chat-reasoning-title--active': message.pending && !message.content }">{{ reasoningTitle(message) }}</span>
                  <span v-if="message.pending && !message.content" class="chat-reasoning-status"><i /><i /><i /></span>
                  <Icon name="chevronDown" size="xs" />
                </summary>
                <div class="chat-reasoning-body">
                  <div v-if="message.reasoning" class="chat-reasoning-markdown" :class="{ 'chat-reasoning-markdown--streaming': message.pending && !message.content }" v-html="renderMarkdown(message.reasoning)" />
                  <div v-else class="chat-reasoning-live">{{ t('chat.preparingThoughts') }}</div>
                </div>
              </details>
              <div v-if="message.references?.length" class="chat-response-references">
                <template v-for="reference in message.references" :key="`${reference.type}:${reference.title}:${reference.url || ''}`">
                  <a v-if="reference.url" :href="reference.url" target="_blank" rel="noopener noreferrer">
                    <Icon name="globe" size="xs" /><span>{{ referenceLabel(reference) }}</span><Icon name="externalLink" size="xs" />
                  </a>
                  <span v-else><Icon :name="reference.type === 'document' ? 'document' : 'search'" size="xs" /><span>{{ referenceLabel(reference) }}</span><small v-if="reference.type === 'web_search' && message.webSearchUnitCost != null">{{ formatUsd(message.webSearchUnitCost) }}</small></span>
                </template>
              </div>
              <div v-if="message.role === 'assistant'" class="chat-answer-stream">
                <div class="chat-markdown" :class="{ 'chat-markdown--streaming': message.pending && Boolean(message.content) }" @click="handleMarkdownClick" v-html="message.renderedContent || renderMarkdown(message.content)" />
                <span v-if="message.pending && message.content" class="chat-output-loading" role="status" :aria-label="t('chat.responding')"><i /><i /><i /></span>
              </div>
              <p v-else>{{ message.content }}</p>
              <div v-if="message.attachments?.length" class="chat-message__files">
                <span v-for="file in message.attachments" :key="file.id">
                  <Icon :name="file.type.startsWith('image/') ? 'image' : 'document'" size="xs" />{{ file.name }}
                </span>
              </div>
              <div v-if="message.images?.length" class="chat-message__images">
                <div v-for="(image, index) in message.images" :key="index" class="chat-generated-image">
                  <a :href="image" target="_blank" rel="noopener noreferrer"><img :src="image" :alt="t('chat.generatedImage')" /></a>
                  <a class="chat-image-download" :href="image" :download="`chat-image-${message.id}-${index + 1}.png`" :title="t('chat.downloadImage')" :aria-label="t('chat.downloadImage')"><Icon name="download" size="sm" /></a>
                </div>
              </div>
              <span v-if="message.pending && !message.content && !message.reasoningEnabled" class="chat-thinking"><i /><i /><i /></span>
              <div v-if="message.role === 'assistant' && !message.pending && (message.content || message.images?.length)" class="chat-message-actions">
                <button v-if="message.content" type="button" :title="t('common.copy')" @click="copyReply(message)"><Icon :name="copiedMessageId === message.id ? 'check' : 'copy'" size="xs" />{{ copiedMessageId === message.id ? t('common.copied') : t('common.copy') }}</button>
                <button v-if="canRegenerateReply(message)" type="button" :title="t('chat.regenerateResponse')" @click="regenerateReply(message)"><Icon name="refresh" size="xs" />{{ t('chat.regenerateResponse') }}</button>
                <span v-if="message.usage" class="chat-token-usage"><b>{{ message.usage.inputTokens.toLocaleString() }}</b> {{ t('chat.inputTokensShort') }}<i /> <b>{{ message.usage.outputTokens.toLocaleString() }}</b> {{ t('chat.outputTokensShort') }}<i /> {{ message.usage.totalTokens.toLocaleString() }} {{ t('chat.tokensShort') }}</span>
                <span v-if="message.standardCost != null"><Icon name="chart" size="xs" />{{ t('chat.standardCost') }} {{ formatUsd(message.standardCost) }}</span>
                <span v-if="message.estimatedCost != null" class="chat-user-cost"><Icon name="dollar" size="xs" />{{ t('chat.userCost') }} {{ formatUsd(message.estimatedCost) }}</span>
                <span v-if="message.happyHourMultiplier != null && message.happyHourMultiplier !== 1" class="chat-happy-hour-cost"><Icon name="clock" size="xs" />{{ message.happyHourName || t('chat.happyHour') }} · {{ message.happyHourMultiplier === 0 ? t('chat.happyHourFree') : `${message.happyHourMultiplier}x` }}</span>
                <span v-if="message.webSearchCost != null"><Icon name="globe" size="xs" />{{ t('chat.webSearchCost') }} {{ formatUsd(message.webSearchCost) }}</span>
              </div>
            </div>
          </article>
        </div>

        <div ref="composerWrapEl" class="chat-composer-wrap">
          <div v-if="attachments.length" class="chat-attachments">
            <div v-for="file in attachments" :key="file.id" class="chat-attachment">
              <span><Icon :name="file.type.startsWith('image/') ? 'image' : 'document'" size="sm" /></span>
              <div><strong>{{ file.name }}</strong><small>{{ formatFileSize(file.size) }}</small></div>
              <button type="button" :aria-label="t('common.delete')" @click="removeAttachment(file.id)"><Icon name="x" size="xs" /></button>
            </div>
          </div>
          <form class="chat-composer" @submit.prevent="sendMessage">
            <div class="chat-composer-modes">
              <button type="button" class="active"><Icon name="chat" size="xs" />{{ t('chat.chatMode') }}</button>
              <button type="button" @click="openImageStudio"><Icon name="image" size="xs" />{{ t('chat.imageStudio') }}</button>
            </div>
            <textarea
              ref="composerEl"
              v-model="draft"
              rows="1"
              :placeholder="t('chat.messagePlaceholder')"
              :disabled="sending"
              @keydown="handleComposerKeydown"
              @input="resizeComposer"
            />
            <div class="chat-composer__tools">
              <div class="chat-composer__left">
                <div ref="toolMenuEl" class="chat-tool-menu-wrap">
                  <button type="button" class="chat-tool chat-tool--add" :title="t('chat.tools')" @click.stop="toolMenuOpen = !toolMenuOpen">
                    <Icon name="plus" size="sm" />
                  </button>
                  <div v-if="toolMenuOpen" class="chat-tool-menu" @click.stop>
                    <button type="button" @click="openAttachmentPicker('photo')"><Icon name="image" size="sm" /><span><strong>{{ t('chat.photos') }}</strong><small>{{ t('chat.photosHint') }}</small></span></button>
                    <button type="button" @click="openAttachmentPicker('document')"><Icon name="document" size="sm" /><span><strong>{{ t('chat.documents') }}</strong><small>{{ t('chat.documentsHint') }}</small></span></button>
                    <button type="button" @click="openAttachmentPicker('data')"><Icon name="database" size="sm" /><span><strong>{{ t('chat.dataFiles') }}</strong><small>{{ t('chat.dataFilesHint') }}</small></span></button>
                    <button type="button" :class="{ active: webSearch }" @click="webSearch = !webSearch"><Icon name="globe" size="sm" /><span><strong>{{ t('chat.webSearch') }}</strong><small>{{ t('chat.webSearchHint') }}</small></span><Icon v-if="webSearch" name="check" size="xs" /></button>
                    <button type="button" :class="{ active: imageGeneration }" @click="imageGeneration = !imageGeneration"><Icon name="image" size="sm" /><span><strong>{{ t('chat.imageGeneration') }}</strong><small>{{ t('chat.imageGenerationHint') }}</small></span><Icon v-if="imageGeneration" name="check" size="xs" /></button>
                    <button type="button" :class="{ active: workspaceMode }" @click="workspaceMode = !workspaceMode"><Icon name="terminal" size="sm" /><span><strong>{{ t('chat.workspaceMode') }}</strong><small>{{ t('chat.workspaceModeHint') }}</small></span><Icon v-if="workspaceMode" name="check" size="xs" /></button>
                  </div>
                </div>
                <button type="button" class="chat-tool" :class="{ active: webSearch }" :title="t('chat.webSearch')" @click="webSearch = !webSearch">
                  <Icon name="globe" size="sm" /><span>{{ t('chat.search') }}</span>
                </button>
                <button type="button" class="chat-tool" :class="{ active: imageGeneration }" :title="t('chat.imageGeneration')" @click="imageGeneration = !imageGeneration">
                  <Icon name="image" size="sm" /><span>{{ t('chat.imageGeneration') }}</span>
                </button>
                <span v-if="workspaceMode" class="chat-workspace-chip"><Icon name="terminal" size="xs" />{{ t('chat.workspaceMode') }}</span>
              </div>
              <div class="chat-composer__right">
                <label v-if="reasoningOptions.length" class="chat-reasoning-level" :title="t('chat.reasoningLevel')">
                  <Icon name="sparkles" size="xs" />
                  <select v-model="reasoningEffort">
                    <option v-for="effort in reasoningOptions" :key="effort" :value="effort">{{ reasoningLabel(effort) }}</option>
                  </select>
                </label>
                <button v-if="sending" type="button" class="chat-send chat-send--stop" :title="t('chat.stop')" @click="stopGeneration">
                  <Icon name="x" size="sm" />
                </button>
                <button v-else type="submit" class="chat-send" :disabled="!canSend" :title="t('chat.send')">
                  <Icon name="arrowUp" size="sm" />
                </button>
              </div>
            </div>
          </form>
          <input ref="fileInput" class="sr-only" type="file" multiple accept="image/*,.pdf,.txt,.md,.csv,.json,.doc,.docx,.ppt,.pptx" @change="handleFileInput" />
          <input ref="photoInput" class="sr-only" type="file" multiple accept="image/*" @change="handleFileInput" />
          <input ref="documentInput" class="sr-only" type="file" multiple accept=".pdf,.txt,.md,.doc,.docx,.ppt,.pptx" @change="handleFileInput" />
          <input ref="dataInput" class="sr-only" type="file" multiple accept=".csv,.json,.xlsx,.xls,.xml,.yaml,.yml,.sql" @change="handleFileInput" />
          <p class="chat-composer-note">{{ t('chat.usageNotice') }}</p>
          <div class="chat-usage-strip">
            <span><Icon name="chart" size="xs" />{{ t('chat.contextUsed') }} {{ contextUsage.percent }}%</span>
            <i><b :style="{ width: `${contextUsage.percent}%` }" /></i>
            <span>{{ contextUsage.tokens.toLocaleString() }} / {{ compactTokens(contextUsage.limit) }}</span>
            <span><Icon name="chart" size="xs" />{{ t('chat.sessionStandardCost') }} {{ formattedSessionStandardCost }}</span>
            <span><Icon name="dollar" size="xs" />{{ t('chat.sessionCost') }} {{ formattedSessionCost }}</span>
          </div>
        </div>
      </section>

      <aside v-if="contextPanel" class="chat-context-panel">
        <header>
          <div><Icon :name="contextPanel === 'knowledge' ? 'book' : 'lightbulb'" size="sm" /><strong>{{ contextPanel === 'knowledge' ? t('chat.knowledgeBase') : t('chat.memory') }}</strong></div>
          <button type="button" :aria-label="t('common.close')" @click="contextPanel = ''"><Icon name="x" size="sm" /></button>
        </header>

        <template v-if="contextPanel === 'knowledge'">
          <p class="chat-context-panel__intro">{{ t('chat.knowledgeDescription') }}</p>
          <label class="chat-knowledge-upload">
            <Icon name="upload" size="sm" />
            <span><strong>{{ t('chat.addKnowledgeFiles') }}</strong><small>{{ t('chat.knowledgeFileHint') }}</small></span>
            <input type="file" multiple accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,.ppt,.pptx,.xlsx,.xls,.xml,.yaml,.yml,.sql" @change="handleKnowledgeFiles" />
          </label>
          <div class="chat-knowledge-note">
            <input v-model="knowledgeNoteTitle" :placeholder="t('chat.knowledgeNoteTitle')" />
            <textarea v-model="knowledgeNoteContent" rows="4" :placeholder="t('chat.knowledgeNotePlaceholder')" />
            <button type="button" :disabled="!knowledgeNoteContent.trim()" @click="addKnowledgeNote"><Icon name="plus" size="xs" />{{ t('chat.addNote') }}</button>
          </div>
          <div class="chat-knowledge-list">
            <div v-for="item in knowledgeItems" :key="item.id" class="chat-knowledge-item">
              <button type="button" class="chat-knowledge-toggle" :class="{ active: item.enabled }" :title="item.enabled ? t('chat.disableKnowledge') : t('chat.enableKnowledge')" @click="toggleKnowledge(item)"><Icon :name="item.enabled ? 'check' : 'plus'" size="xs" /></button>
              <span class="chat-knowledge-item__icon"><Icon :name="item.type.startsWith('image/') ? 'image' : item.kind === 'note' ? 'edit' : 'document'" size="sm" /></span>
              <span class="chat-knowledge-item__copy"><strong>{{ item.name }}</strong><small>{{ formatFileSize(item.size) }} · {{ formatConversationDate(item.createdAt) }}</small></span>
              <button type="button" class="chat-knowledge-delete" :title="t('common.delete')" @click="removeKnowledge(item.id)"><Icon name="trash" size="xs" /></button>
            </div>
            <div v-if="!knowledgeItems.length" class="chat-context-empty"><Icon name="book" size="md" /><span>{{ t('chat.noKnowledge') }}</span></div>
          </div>
        </template>

        <template v-else>
          <p class="chat-context-panel__intro">{{ t('chat.memoryDescription') }}</p>
          <label class="chat-memory-toggle"><span><strong>{{ t('chat.useMemory') }}</strong><small>{{ t('chat.useMemoryHint') }}</small></span><input v-model="memoryEnabled" type="checkbox" /></label>
          <label class="chat-memory-editor">
            <span>{{ t('chat.savedMemory') }}</span>
            <textarea v-model="memory" rows="14" :placeholder="t('chat.memoryPlaceholder')" />
            <small>{{ t('chat.memoryPrivacy') }}</small>
          </label>
          <button v-if="memory" type="button" class="chat-memory-clear" @click="clearMemory"><Icon name="trash" size="xs" />{{ t('chat.clearMemory') }}</button>
        </template>
      </aside>
    </div>

    <BaseDialog
      :show="groupPickerOpen"
      :title="t('chat.selectGroupTitle')"
      width="normal"
      :show-close-button="Boolean(selectedGroup)"
      :close-on-escape="Boolean(selectedGroup)"
      @close="closeGroupPicker"
    >
      <p class="chat-group-dialog__intro">{{ t('chat.selectGroupDescription') }}</p>
      <div class="chat-group-list">
        <button
          v-for="group in availableChatGroups"
          :key="group.id"
          type="button"
          class="chat-group-option"
          :class="{ active: String(pendingGroupId) === String(group.id) }"
          @click="pendingGroupId = group.id"
        >
          <span class="chat-group-option__icon"><Icon name="cube" size="sm" /></span>
          <span><strong>{{ group.name }}</strong><small>{{ group.platform }} · {{ group.subscription_type === 'subscription' ? t('chat.subscriptionGroup') : t('chat.standardGroup') }}</small></span>
          <Icon v-if="String(pendingGroupId) === String(group.id)" name="check" size="sm" />
        </button>
        <div v-if="!availableChatGroups.length" class="chat-group-empty">{{ t('chat.noAvailableGroup') }}</div>
      </div>
      <template #footer>
        <button v-if="selectedGroup" type="button" class="btn btn-secondary" @click="closeGroupPicker">{{ t('common.cancel') }}</button>
        <button type="button" class="btn btn-primary" :disabled="!pendingGroupId || applyingGroup" @click="confirmGroupChoice">
          {{ applyingGroup ? t('chat.creatingKey') : t('common.confirm') }}
        </button>
      </template>
    </BaseDialog>

    <ConfirmDialog
      :show="Boolean(pendingDeleteId)"
      :title="t('chat.deleteChat')"
      :message="t('chat.deleteConfirm')"
      danger
      @confirm="confirmDelete"
      @cancel="pendingDeleteId = ''"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import bash from 'shiki/dist/langs/bash.mjs'
import css from 'shiki/dist/langs/css.mjs'
import go from 'shiki/dist/langs/go.mjs'
import html from 'shiki/dist/langs/html.mjs'
import javascript from 'shiki/dist/langs/javascript.mjs'
import json from 'shiki/dist/langs/json.mjs'
import markdown from 'shiki/dist/langs/markdown.mjs'
import python from 'shiki/dist/langs/python.mjs'
import sql from 'shiki/dist/langs/sql.mjs'
import typescript from 'shiki/dist/langs/typescript.mjs'
import vue from 'shiki/dist/langs/vue.mjs'
import yaml from 'shiki/dist/langs/yaml.mjs'
import githubDark from 'shiki/dist/themes/github-dark.mjs'
import githubLight from 'shiki/dist/themes/github-light.mjs'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import Icon from '@/components/icons/Icon.vue'
import ModelIcon from '@/components/common/ModelIcon.vue'
import keysAPI from '@/api/keys'
import { getDefaultChatModels, getModelReasoningEfforts, sendChatResponse, type ChatGatewayMessage, type ChatReasoningEffort, type ChatResponseReference, type ChatResponseUsage } from '@/api/chat'
import userGroupsAPI from '@/api/groups'
import userChannelsAPI, { type UserAvailableChannel, type UserAvailableGroup, type UserSupportedModelPricing } from '@/api/channels'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { extractApiErrorMessage } from '@/utils/apiError'
import { formatCurrency, formatDate } from '@/utils/format'
import type { ApiKey, Group } from '@/types'

interface ChatAttachment { id: string; name: string; type: string; size: number; dataUrl: string }
interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; model?: string; reasoning?: string; reasoningEnabled?: boolean; reasoningDurationMs?: number; renderedContent?: string; references?: ChatResponseReference[]; usage?: ChatResponseUsage; standardCost?: number; estimatedCost?: number; userRateMultiplier?: number; happyHourMultiplier?: number; happyHourName?: string; pricingRecordedAt?: number; webSearchCalls?: number; webSearchUnitCost?: number; webSearchCost?: number; createdAt: number; attachments?: ChatAttachment[]; images?: string[]; pending?: boolean }
interface Conversation { id: string; title: string; createdAt: number; updatedAt: number; keyId: number; model: string; regenerationCost?: number; regenerationStandardCost?: number; messages: ChatMessage[] }
interface ChatModelOption { name: string; platform: string; pricing: UserSupportedModelPricing | null }
interface KnowledgeItem { id: string; name: string; type: string; size: number; dataUrl: string; enabled: boolean; kind: 'file' | 'note'; createdAt: number }
interface ChatPricingSnapshot { pricing: UserSupportedModelPricing | null; userRateMultiplier: number; happyHourMultiplier: number; happyHourName?: string; webSearchPricePerCall: number; recordedAt: number }

const STORAGE_KEY = 'sub2api_chat_conversations_v1'
const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_ATTACHMENTS = 5
const CHAT_KEY_NAME = 'Console Chat'
const CHAT_GROUP_STORAGE_KEY = 'sub2api_chat_group_id'
const MEMORY_STORAGE_KEY = 'sub2api_chat_memory_v1'
const MEMORY_ENABLED_STORAGE_KEY = 'sub2api_chat_memory_enabled_v1'
const KNOWLEDGE_DB_NAME = 'sub2api-chat-knowledge-v1'
const MAX_ACTIVE_KNOWLEDGE = 5
const IMAGE_MODEL_PATTERN = /(?:gpt-image|dall-e|imagen|grok-imagine|flux|seedream|qwen-image|imagegen|flash-image)/i
const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const conversations = ref<Conversation[]>([])
const activeConversationId = ref('')
const historyQuery = ref('')
const historyOpen = ref(false)
const apiKeys = ref<ApiKey[]>([])
const selectedKeyId = ref(0)
const models = ref<string[]>([])
const selectedModel = ref('')
const loadingModels = ref(false)
const channelCatalog = ref<UserAvailableChannel[]>([])
const bindableGroups = ref<Group[]>([])
const userGroupRates = ref<Record<number, number>>({})
const groupPickerOpen = ref(false)
const pendingGroupId = ref<number | string>('')
const applyingGroup = ref(false)
const modelPickerOpen = ref(false)
const modelSearch = ref('')
const draft = ref('')
const attachments = ref<ChatAttachment[]>([])
const sending = ref(false)
const webSearch = ref(false)
const imageGeneration = ref(false)
const workspaceMode = ref(false)
const reasoningEffort = ref<ChatReasoningEffort | null>(null)
const toolMenuOpen = ref(false)
const contextPanel = ref<'' | 'knowledge' | 'memory'>('')
const knowledgeItems = ref<KnowledgeItem[]>([])
const knowledgeNoteTitle = ref('')
const knowledgeNoteContent = ref('')
const memory = ref('')
const memoryEnabled = ref(true)
const pendingDeleteId = ref('')
const copiedMessageId = ref('')
const expandedReasoningIds = ref(new Set<string>())
const chatMainEl = ref<HTMLElement | null>(null)
const messagesEl = ref<HTMLElement | null>(null)
const composerEl = ref<HTMLTextAreaElement | null>(null)
const composerWrapEl = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const photoInput = ref<HTMLInputElement | null>(null)
const documentInput = ref<HTMLInputElement | null>(null)
const dataInput = ref<HTMLInputElement | null>(null)
const toolMenuEl = ref<HTMLElement | null>(null)
const modelPickerEl = ref<HTMLElement | null>(null)
const modelSearchInput = ref<HTMLInputElement | null>(null)
let requestController: AbortController | null = null
let composerResizeObserver: ResizeObserver | null = null
let highlighter: HighlighterCore | null = null

const activeConversation = computed(() => conversations.value.find((item) => item.id === activeConversationId.value))
const usableKeys = computed(() => apiKeys.value.filter((key) => key.status === 'active' && key.group_id))
const selectedKey = computed(() => usableKeys.value.find((key) => key.id === selectedKeyId.value))
const availableChatGroups = computed<UserAvailableGroup[]>(() => {
  const groups = new Map<string, UserAvailableGroup>()
  for (const section of channelCatalog.value.flatMap((channel) => channel.platforms)) {
    for (const group of section.groups) if (!groups.has(String(group.id))) groups.set(String(group.id), group)
  }
  for (const group of bindableGroups.value) {
    const existing = groups.get(String(group.id))
    if (existing) {
      existing.web_search_price_per_call = group.web_search_price_per_call
      if (!existing.happy_hour_events?.length) existing.happy_hour_events = group.happy_hour_events
      continue
    }
    if (group.status !== 'active') continue
    groups.set(String(group.id), {
      id: group.id,
      name: group.name,
      platform: group.platform,
      subscription_type: group.subscription_type,
      rate_multiplier: group.rate_multiplier,
      peak_rate_enabled: group.peak_rate_enabled,
      peak_start: group.peak_start,
      peak_end: group.peak_end,
      peak_rate_multiplier: group.peak_rate_multiplier,
      peak_rate_active: group.happy_hour_active,
      happy_hour_events: group.happy_hour_events,
      active_happy_hour: group.active_happy_hour,
      is_exclusive: group.is_exclusive,
      web_search_price_per_call: group.web_search_price_per_call,
    })
  }
  return [...groups.values()].sort((a, b) => Number(a.subscription_type !== 'standard') - Number(b.subscription_type !== 'standard') || a.name.localeCompare(b.name))
})
const selectedGroup = computed(() => availableChatGroups.value.find((group) => String(group.id) === String(selectedKey.value?.group_id)))
const filteredConversations = computed(() => {
  const query = historyQuery.value.trim().toLowerCase()
  if (!query) return conversations.value
  return conversations.value.filter((conversation) => conversation.title.toLowerCase().includes(query)
    || conversation.messages.some((message) => message.content.toLowerCase().includes(query)))
})
const canSend = computed(() => Boolean((draft.value.trim() || attachments.value.length) && selectedKey.value && selectedModel.value))
const starterPrompts = computed(() => [t('chat.promptSummarize'), t('chat.promptResearch'), t('chat.promptImage')])
const accountName = computed(() => authStore.user?.username || authStore.user?.email?.split('@')[0] || t('nav.myAccount'))
const accountInitials = computed(() => accountName.value.slice(0, 2).toUpperCase())
const dashboardPath = computed(() => authStore.isAdmin ? '/admin/dashboard' : '/dashboard')
const modelCatalog = computed(() => {
  const result = new Map<string, { platform: string; pricing: UserSupportedModelPricing | null }>()
  const groupId = selectedKey.value?.group_id
  if (!groupId) return result
  for (const channel of channelCatalog.value) {
    for (const section of channel.platforms) {
      if (!section.groups.some((group) => String(group.id) === String(groupId))) continue
      for (const model of section.supported_models) {
        const key = model.name.toLowerCase()
        if (!result.has(key)) result.set(key, { platform: model.platform || section.platform, pricing: model.pricing })
      }
    }
  }
  return result
})
const modelOptions = computed<ChatModelOption[]>(() => models.value.filter((name) => !IMAGE_MODEL_PATTERN.test(name)).map((name) => {
  const catalog = modelCatalog.value.get(name.toLowerCase())
  return { name, platform: catalog?.platform || inferModelPlatform(name), pricing: catalog?.pricing || null }
}))
const filteredModelOptions = computed(() => {
  const query = modelSearch.value.trim().toLowerCase()
  if (!query) return modelOptions.value
  return modelOptions.value.filter((option) => option.name.toLowerCase().includes(query) || option.platform.toLowerCase().includes(query))
})
const selectedModelMeta = computed(() => modelOptions.value.find((option) => option.name === selectedModel.value))
const reasoningOptions = computed<ChatReasoningEffort[]>(() => getModelReasoningEfforts(selectedModel.value))
const enabledKnowledgeItems = computed(() => knowledgeItems.value.filter((item) => item.enabled))
const enabledKnowledgeCount = computed(() => enabledKnowledgeItems.value.length)
const contextUsage = computed(() => {
  const limit = modelContextWindow(selectedModel.value)
  const latestUsage = [...(activeConversation.value?.messages || [])].reverse().find((message) => message.usage)?.usage
  const tokens = latestUsage?.totalTokens || estimateConversationTokens(activeConversation.value)
  return { tokens, limit, percent: Math.min(100, Math.round(tokens / limit * 100)) }
})
const formattedSessionCost = computed(() => {
  const costs = (activeConversation.value?.messages || []).map((message) => message.estimatedCost).filter((cost): cost is number => typeof cost === 'number')
  const regeneratedCost = activeConversation.value?.regenerationCost || 0
  if (!costs.length && !regeneratedCost) return activeConversation.value?.messages.length ? '—' : formatCurrency(0)
  return formatUsd(costs.reduce((sum, cost) => sum + cost, regeneratedCost))
})
const formattedSessionStandardCost = computed(() => {
  const costs = (activeConversation.value?.messages || []).map((message) => message.standardCost).filter((cost): cost is number => typeof cost === 'number')
  const regeneratedCost = activeConversation.value?.regenerationStandardCost || 0
  if (!costs.length && !regeneratedCost) return activeConversation.value?.messages.length ? '—' : formatCurrency(0)
  return formatUsd(costs.reduce((sum, cost) => sum + cost, regeneratedCost))
})

function uid() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}` }
function goToDashboard() { void router.push(dashboardPath.value) }
function renderMarkdown(content: string) { return DOMPurify.sanitize(marked.parse(content || '') as string) }
function reasoningTitle(message: ChatMessage) {
  if (message.pending && !message.content) return t('chat.thinking')
  if (message.reasoningDurationMs) return t('chat.thoughtFor', { seconds: Math.max(1, Math.round(message.reasoningDurationMs / 1000)) })
  return t('chat.reasoning')
}
function referenceLabel(reference: ChatResponseReference) {
  if (reference.type === 'web_search') return reference.title === 'Web search' ? t('chat.searchedWeb') : t('chat.searchedWebFor', { query: reference.title })
  if (reference.type === 'web_source') return t('chat.webSource', { title: reference.title })
  return t('chat.referencedDocument', { name: reference.title })
}
function addMessageReference(message: ChatMessage, reference: ChatResponseReference) {
  const references = message.references || (message.references = [])
  const genericWebIndex = references.findIndex((item) => item.type === 'web_search' && item.title === 'Web search')
  if (reference.type === 'web_search' && reference.title !== 'Web search' && genericWebIndex >= 0) references.splice(genericWebIndex, 1)
  if (!references.some((item) => item.type === reference.type && item.title === reference.title && item.url === reference.url)) references.push(reference)
}
function setReasoningOpen(messageId: string, open: boolean) {
  const next = new Set(expandedReasoningIds.value)
  if (open) next.add(messageId)
  else next.delete(messageId)
  expandedReasoningIds.value = next
}
function syncReasoningOpen(messageId: string, event: Event) { setReasoningOpen(messageId, (event.currentTarget as HTMLDetailsElement).open) }
function escapeHTML(value: string) { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char] || char) }
async function renderHighlightedMarkdown(content: string) {
  if (!highlighter) return renderMarkdown(content)
  const renderer = new marked.Renderer()
  renderer.code = ({ text, lang }) => {
    const requested = (lang || '').trim().toLowerCase().split(/\s+/)[0]
    const language = requested && highlighter?.getLoadedLanguages().includes(requested) ? requested : 'text'
    const highlighted = highlighter!.codeToHtml(text, { lang: language, themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false })
    return `<div class="chat-code-block"><div class="chat-code-toolbar"><span>${escapeHTML(requested || 'text')}</span><button type="button" data-copy-code>${escapeHTML(t('common.copy'))}</button></div>${highlighted}</div>`
  }
  return DOMPurify.sanitize(marked.parse(content || '', { renderer }) as string)
}
async function copyText(value: string) {
  try { await navigator.clipboard.writeText(value); appStore.showSuccess(t('common.copiedToClipboard')); return true }
  catch { appStore.showError(t('common.copyFailed')); return false }
}
async function copyReply(message: ChatMessage) {
  if (await copyText(message.content)) {
    copiedMessageId.value = message.id
    window.setTimeout(() => { if (copiedMessageId.value === message.id) copiedMessageId.value = '' }, 1600)
  }
}
function canRegenerateReply(message: ChatMessage) {
  if (sending.value || !selectedKey.value || !selectedModel.value || message.role !== 'assistant' || message.pending) return false
  return [...(activeConversation.value?.messages || [])].reverse().find((item) => item.role === 'assistant')?.id === message.id
}
async function regenerateReply(message: ChatMessage) {
  const conversation = activeConversation.value
  if (!conversation || !canRegenerateReply(message)) return
  const assistantIndex = conversation.messages.findIndex((item) => item.id === message.id)
  let userIndex = assistantIndex - 1
  while (userIndex >= 0 && conversation.messages[userIndex]?.role !== 'user') userIndex -= 1
  const userMessage = conversation.messages[userIndex]
  if (userIndex < 0 || !userMessage) return
  if (message.estimatedCost != null) conversation.regenerationCost = (conversation.regenerationCost || 0) + message.estimatedCost
  if (message.standardCost != null) conversation.regenerationStandardCost = (conversation.regenerationStandardCost || 0) + message.standardCost
  draft.value = userMessage.content
  attachments.value = (userMessage.attachments || []).map((file) => ({ ...file }))
  conversation.messages.splice(userIndex)
  conversation.updatedAt = Date.now()
  persist()
  await nextTick()
  await sendMessage()
}
function handleMarkdownClick(event: MouseEvent) {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-copy-code]')
  if (!button) return
  const code = button.closest('.chat-code-block')?.querySelector('code')?.textContent || ''
  void copyText(code).then((copied) => { if (copied) { button.textContent = t('common.copied'); window.setTimeout(() => { button.textContent = t('common.copy') }, 1400) } })
}
function modelContextWindow(model: string) {
  const value = model.toLowerCase()
  if (value.includes('gemini')) return 1_048_576
  if (value.includes('claude')) return 200_000
  if (value.includes('grok')) return 256_000
  if (value.includes('gpt-5') || value.includes('codex')) return 400_000
  return 128_000
}
function estimateConversationTokens(conversation?: Conversation) {
  if (!conversation) return 0
  return conversation.messages.reduce((sum, message) => sum + Math.ceil((message.content.length + (message.reasoning?.length || 0)) / 4) + (message.attachments?.length || 0) * 85, 0)
}
function compactTokens(tokens: number) { return tokens >= 1_000_000 ? `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 ? 1 : 0)}M` : `${Math.round(tokens / 1000)}K` }
function formatUsd(value: number) { return formatCurrency(value) }
function parseClockMinutes(value?: string) {
  const match = value?.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1]); const minutes = Number(match[2])
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60 ? hours * 60 + minutes : null
}
function serverMinute(timestamp: number) {
  const now = new Date(timestamp)
  const offset = appStore.cachedPublicSettings?.server_utc_offset?.match(/^([+-])(\d{2}):(\d{2})$/)
  if (!offset) return now.getHours() * 60 + now.getMinutes()
  const direction = offset[1] === '-' ? -1 : 1
  const offsetMinutes = direction * (Number(offset[2]) * 60 + Number(offset[3]))
  return ((now.getUTCHours() * 60 + now.getUTCMinutes() + offsetMinutes) % 1440 + 1440) % 1440
}
function activeHappyHourAt(group: UserAvailableGroup | undefined, timestamp: number) {
  if (!group) return undefined
  const events = group.happy_hour_events?.length
    ? group.happy_hour_events
    : group.peak_rate_enabled
      ? [{ name: 'Happy Hour', enabled: true, start: group.peak_start, end: group.peak_end, rate_multiplier: group.peak_rate_multiplier }]
      : []
  const minute = serverMinute(timestamp)
  return events.find((event) => {
    const start = parseClockMinutes(event.start); const end = parseClockMinutes(event.end)
    return event.enabled && start != null && end != null && start < end && minute >= start && minute < end
  })
}
function createPricingSnapshot(): ChatPricingSnapshot {
  const group = selectedGroup.value
  const recordedAt = Date.now()
  const activeEvent = activeHappyHourAt(group, recordedAt)
  const customRate = group ? userGroupRates.value[Number(group.id)] : undefined
  return {
    pricing: selectedModelMeta.value?.pricing || null,
    userRateMultiplier: customRate ?? group?.rate_multiplier ?? 1,
    happyHourMultiplier: activeEvent?.rate_multiplier ?? 1,
    happyHourName: activeEvent?.name,
    webSearchPricePerCall: group?.web_search_price_per_call ?? 0.01,
    recordedAt,
  }
}
function standardResponseCost(usage: ChatResponseUsage | undefined, pricing: UserSupportedModelPricing | null) {
  if (!pricing) return undefined
  if (usage && (pricing.input_price != null || pricing.output_price != null)) return (pricing.input_price || 0) * usage.inputTokens + (pricing.output_price || 0) * usage.outputTokens
  if (pricing.per_request_price != null) return pricing.per_request_price
  return undefined
}
function calculateResponseCosts(usage: ChatResponseUsage | undefined, webSearchCalls: number, snapshot: ChatPricingSnapshot) {
  const tokenStandardCost = standardResponseCost(usage, snapshot.pricing)
  const webSearchStandardCost = webSearchCalls > 0 ? snapshot.webSearchPricePerCall * webSearchCalls : undefined
  const standardParts = [tokenStandardCost, webSearchStandardCost].filter((cost): cost is number => cost != null)
  const tokenUserCost = tokenStandardCost == null ? undefined : tokenStandardCost * snapshot.userRateMultiplier * snapshot.happyHourMultiplier
  const webSearchUserCost = webSearchStandardCost == null ? undefined : webSearchStandardCost * snapshot.userRateMultiplier
  const userParts = [tokenUserCost, webSearchUserCost].filter((cost): cost is number => cost != null)
  return {
    standardCost: standardParts.length ? standardParts.reduce((sum, cost) => sum + cost, 0) : undefined,
    userCost: userParts.length ? userParts.reduce((sum, cost) => sum + cost, 0) : undefined,
    webSearchUserCost,
    webSearchUnitUserCost: webSearchCalls > 0 ? snapshot.webSearchPricePerCall * snapshot.userRateMultiplier : undefined,
  }
}
function formatConversationDate(timestamp: number) { return formatDate(new Date(timestamp), { month: 'short', day: 'numeric' }) }
function formatFileSize(size: number) { return size < 1024 * 1024 ? `${Math.ceil(size / 1024)} KB` : `${(size / 1024 / 1024).toFixed(1)} MB` }
function inferModelPlatform(model: string) {
  const value = model.toLowerCase()
  if (value.includes('claude')) return 'Anthropic'
  if (value.includes('gemini') || value.includes('gemma')) return 'Google'
  if (value.includes('grok')) return 'xAI'
  if (value.includes('deepseek')) return 'DeepSeek'
  if (value.includes('qwen')) return 'Alibaba'
  return 'OpenAI'
}
function reasoningLabel(effort: ChatReasoningEffort) {
  return { low: t('chat.reasoningLow'), medium: t('chat.reasoningMedium'), high: t('chat.reasoningHigh'), xhigh: t('chat.reasoningXHigh') }[effort]
}
function formatModelPrice(pricing: UserSupportedModelPricing | null) {
  if (!pricing) return t('chat.pricingUnavailable')
  if (pricing.input_price != null || pricing.output_price != null) {
    const input = pricing.input_price == null ? '-' : formatCurrency(pricing.input_price * 1_000_000)
    const output = pricing.output_price == null ? '-' : formatCurrency(pricing.output_price * 1_000_000)
    return `${t('chat.inputShort')} ${input} · ${t('chat.outputShort')} ${output} / 1M`
  }
  if (pricing.image_output_price != null) return `${formatCurrency(pricing.image_output_price)} / img`
  if (pricing.per_request_price != null) return `${formatCurrency(pricing.per_request_price)} / req`
  return t('chat.pricingUnavailable')
}
function chooseModel(model: string) { selectedModel.value = model; modelPickerOpen.value = false; modelSearch.value = '' }
function closePopovers(event: MouseEvent) {
  const target = event.target as Node
  if (!modelPickerEl.value?.contains(target)) modelPickerOpen.value = false
  if (!toolMenuEl.value?.contains(target)) toolMenuOpen.value = false
}
function openAttachmentPicker(type: 'photo' | 'document' | 'data') {
  const input = type === 'photo' ? photoInput.value : type === 'document' ? documentInput.value : dataInput.value
  toolMenuOpen.value = false
  input?.click()
}
function openImageStudio() {
  toolMenuOpen.value = false
  void router.push('/image-studio')
}
function openKnowledgeDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(KNOWLEDGE_DB_NAME, 1)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains('items')) database.createObjectStore('items', { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
async function loadKnowledge() {
  try {
    const database = await openKnowledgeDatabase()
    const items = await new Promise<KnowledgeItem[]>((resolve, reject) => {
      const request = database.transaction('items', 'readonly').objectStore('items').getAll()
      request.onsuccess = () => resolve(request.result as KnowledgeItem[])
      request.onerror = () => reject(request.error)
    })
    database.close()
    knowledgeItems.value = items.sort((a, b) => b.createdAt - a.createdAt)
  } catch { knowledgeItems.value = [] }
}
async function saveKnowledgeItem(item: KnowledgeItem) {
  const database = await openKnowledgeDatabase()
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction('items', 'readwrite').objectStore('items').put(item)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
  database.close()
}
async function handleKnowledgeFiles(event: Event) {
  const input = event.target as HTMLInputElement
  for (const file of [...input.files || []]) {
    if (file.size > MAX_FILE_SIZE) { appStore.showError(t('chat.fileTooLarge', { name: file.name })); continue }
    try {
      const item: KnowledgeItem = { id: uid(), name: file.name, type: file.type || 'application/octet-stream', size: file.size, dataUrl: await fileToDataUrl(file), enabled: enabledKnowledgeCount.value < MAX_ACTIVE_KNOWLEDGE, kind: 'file', createdAt: Date.now() }
      knowledgeItems.value.unshift(item)
      await saveKnowledgeItem(item)
    } catch { appStore.showError(t('chat.fileReadFailed', { name: file.name })) }
  }
  input.value = ''
}
async function addKnowledgeNote() {
  if (!knowledgeNoteContent.value.trim()) return
  const file = new File([knowledgeNoteContent.value.trim()], `${knowledgeNoteTitle.value.trim() || t('chat.untitledNote')}.md`, { type: 'text/markdown' })
  const item: KnowledgeItem = { id: uid(), name: knowledgeNoteTitle.value.trim() || t('chat.untitledNote'), type: file.type, size: file.size, dataUrl: await fileToDataUrl(file), enabled: enabledKnowledgeCount.value < MAX_ACTIVE_KNOWLEDGE, kind: 'note', createdAt: Date.now() }
  knowledgeItems.value.unshift(item)
  await saveKnowledgeItem(item)
  knowledgeNoteTitle.value = ''; knowledgeNoteContent.value = ''
}
async function toggleKnowledge(item: KnowledgeItem) {
  if (!item.enabled && enabledKnowledgeCount.value >= MAX_ACTIVE_KNOWLEDGE) { appStore.showError(t('chat.knowledgeLimit', { count: MAX_ACTIVE_KNOWLEDGE })); return }
  item.enabled = !item.enabled
  await saveKnowledgeItem(item)
}
async function removeKnowledge(id: string) {
  const database = await openKnowledgeDatabase()
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction('items', 'readwrite').objectStore('items').delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
  database.close()
  knowledgeItems.value = knowledgeItems.value.filter((item) => item.id !== id)
}
function loadMemory() {
  try {
    memory.value = localStorage.getItem(MEMORY_STORAGE_KEY) || ''
    memoryEnabled.value = localStorage.getItem(MEMORY_ENABLED_STORAGE_KEY) !== 'false'
  } catch { memory.value = ''; memoryEnabled.value = true }
}
function clearMemory() { memory.value = '' }
function persist() {
  const serializable = conversations.value.map((conversation) => ({ ...conversation, messages: conversation.messages.map(({ renderedContent: _, ...message }) => message) }))
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable)) }
  catch {
    const compact = serializable.map((conversation) => ({ ...conversation, messages: conversation.messages.map((message) => ({ ...message, attachments: message.attachments?.map(({ dataUrl: _, ...file }) => ({ ...file, dataUrl: '' })), images: [] })) }))
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(compact)) } catch { /* Storage may be disabled. */ }
  }
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (Array.isArray(parsed)) conversations.value = parsed
  } catch { conversations.value = [] }
  if (conversations.value.length) activeConversationId.value = conversations.value[0].id
  else createConversation()
}

function createConversation() {
  const conversation: Conversation = { id: uid(), title: t('chat.newChat'), createdAt: Date.now(), updatedAt: Date.now(), keyId: selectedKeyId.value, model: selectedModel.value, messages: [] }
  conversations.value.unshift(conversation)
  activeConversationId.value = conversation.id
  draft.value = ''
  attachments.value = []
  historyOpen.value = false
  persist()
}

async function openConversation(id: string) {
  activeConversationId.value = id
  const conversation = activeConversation.value
  if (conversation?.keyId && usableKeys.value.some((key) => key.id === conversation.keyId)) {
    const keyChanged = selectedKeyId.value !== conversation.keyId
    selectedKeyId.value = conversation.keyId
    selectedModel.value = conversation.model
    if (keyChanged) await loadModels()
  } else if (conversation?.model) {
    selectedModel.value = conversation.model
  }
  historyOpen.value = false
  await scrollToBottom()
}
function requestDelete(id: string) { pendingDeleteId.value = id }
function confirmDelete() {
  const id = pendingDeleteId.value
  conversations.value = conversations.value.filter((item) => item.id !== id)
  pendingDeleteId.value = ''
  if (activeConversationId.value === id) activeConversationId.value = conversations.value[0]?.id || ''
  if (!conversations.value.length) createConversation()
  else persist()
}

async function loadKeys() {
  try {
    const response = await keysAPI.list(1, 100, { status: 'active' })
    apiKeys.value = response.items
    const storedGroupID = localStorage.getItem(CHAT_GROUP_STORAGE_KEY) || ''
    const storedGroup = availableChatGroups.value.find((group) => String(group.id) === storedGroupID)
    if (storedGroup) await applyGroup(storedGroup.id)
    else {
      selectedKeyId.value = 0
      pendingGroupId.value = availableChatGroups.value[0]?.id || ''
      groupPickerOpen.value = true
      loadingModels.value = false
    }
  } catch (error) { appStore.showError(extractApiErrorMessage(error, t('chat.failedKeys'))) }
}
async function applyGroup(groupID: number | string) {
  applyingGroup.value = true
  try {
    let chatKey = usableKeys.value.find((key) => key.name === CHAT_KEY_NAME)
    if (chatKey && String(chatKey.group_id) !== String(groupID)) {
      chatKey = await keysAPI.update(chatKey.id, { group_id: Number(groupID) })
      apiKeys.value = apiKeys.value.map((key) => key.id === chatKey?.id ? chatKey : key)
    } else if (!chatKey) {
      chatKey = await keysAPI.create(CHAT_KEY_NAME, Number(groupID))
      apiKeys.value.unshift(chatKey)
    }
    selectedKeyId.value = chatKey.id
    localStorage.setItem(CHAT_GROUP_STORAGE_KEY, String(groupID))
    groupPickerOpen.value = false
    await loadModels()
  } finally { applyingGroup.value = false }
}
async function confirmGroupChoice() {
  if (!pendingGroupId.value || applyingGroup.value) return
  try { await applyGroup(pendingGroupId.value) }
  catch (error) { appStore.showError(extractApiErrorMessage(error, t('chat.failedKeys'))) }
}
function openGroupPicker() {
  pendingGroupId.value = selectedGroup.value?.id || availableChatGroups.value[0]?.id || ''
  groupPickerOpen.value = true
  modelPickerOpen.value = false
}
function closeGroupPicker() {
  if (!selectedGroup.value) return
  groupPickerOpen.value = false
  pendingGroupId.value = selectedGroup.value.id
}
async function loadChannelCatalog() {
  const [channelsResult, groupsResult, ratesResult] = await Promise.allSettled([userChannelsAPI.getAvailable(), userGroupsAPI.getAvailable(), userGroupsAPI.getUserGroupRates()])
  channelCatalog.value = channelsResult.status === 'fulfilled' ? channelsResult.value : []
  bindableGroups.value = groupsResult.status === 'fulfilled' ? groupsResult.value : []
  userGroupRates.value = ratesResult.status === 'fulfilled' ? ratesResult.value : {}
  if (!channelCatalog.value.length && !bindableGroups.value.length) appStore.showError(t('chat.noAvailableGroup'))
}
function catalogModelsForGroup(groupID: number | string | null | undefined) {
  if (groupID == null) return []
  const id = String(groupID)
  const sections = channelCatalog.value.flatMap((channel) => channel.platforms)
    .filter((section) => section.groups.some((group) => String(group.id) === id))
  const configured = [...new Set(sections.flatMap((section) => section.supported_models.map((model) => model.name)).filter((model) => !IMAGE_MODEL_PATTERN.test(model)))]
  if (configured.length) return configured
  const platforms = sections.map((section) => section.platform)
  if (!platforms.length) {
    const group = availableChatGroups.value.find((item) => String(item.id) === id)
    if (group) platforms.push(group.platform)
  }
  return [...new Set(platforms.flatMap(getDefaultChatModels).filter((model) => !IMAGE_MODEL_PATTERN.test(model)))]
}
async function loadModels() {
  if (!selectedKey.value) { models.value = []; selectedModel.value = ''; modelPickerOpen.value = false; return }
  loadingModels.value = true
  try {
    models.value = catalogModelsForGroup(selectedKey.value.group_id)
    if (!models.value.includes(selectedModel.value)) selectedModel.value = models.value[0] || ''
    if (!models.value.length) appStore.showError(t('chat.failedModels'))
  } catch { models.value = []; selectedModel.value = ''; appStore.showError(t('chat.failedModels')) }
  finally { loadingModels.value = false }
}
function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
async function addFiles(files: File[]) {
  const available = Math.max(0, MAX_ATTACHMENTS - attachments.value.length)
  for (const file of files.slice(0, available)) {
    if (file.size > MAX_FILE_SIZE) { appStore.showError(t('chat.fileTooLarge', { name: file.name })); continue }
    try { attachments.value.push({ id: uid(), name: file.name, type: file.type || 'application/octet-stream', size: file.size, dataUrl: await fileToDataUrl(file) }) }
    catch { appStore.showError(t('chat.fileReadFailed', { name: file.name })) }
  }
}
function handleFileInput(event: Event) { const input = event.target as HTMLInputElement; void addFiles([...input.files || []]); input.value = '' }
function handleDrop(event: DragEvent) { if (event.dataTransfer?.files.length) void addFiles([...event.dataTransfer.files]) }
function removeAttachment(id: string) { attachments.value = attachments.value.filter((item) => item.id !== id) }

async function scrollToBottom(behavior: 'auto' | 'smooth' = 'smooth') {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTo({ top: messagesEl.value.scrollHeight, behavior })
}
function resizeComposer() { const element = composerEl.value; if (!element) return; element.style.height = 'auto'; element.style.height = `${Math.min(element.scrollHeight, 180)}px` }
function updateComposerClearance() {
  const height = composerWrapEl.value?.getBoundingClientRect().height || 0
  chatMainEl.value?.style.setProperty('--chat-composer-height', `${Math.ceil(height)}px`)
}
function handleComposerKeydown(event: KeyboardEvent) { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (canSend.value) void sendMessage() } }
function stopGeneration() { requestController?.abort() }

async function sendMessage() {
  if (!canSend.value || !activeConversation.value || !selectedKey.value) return
  const conversation = activeConversation.value
  const pricingSnapshot = createPricingSnapshot()
  const userMessage: ChatMessage = { id: uid(), role: 'user', content: draft.value.trim(), createdAt: Date.now(), attachments: [...attachments.value] }
  const assistantMessageDraft: ChatMessage = {
    id: uid(),
    role: 'assistant',
    content: '',
    model: selectedModel.value,
    reasoningEnabled: Boolean(reasoningEffort.value),
    userRateMultiplier: pricingSnapshot.userRateMultiplier,
    happyHourMultiplier: pricingSnapshot.happyHourMultiplier,
    happyHourName: pricingSnapshot.happyHourName,
    pricingRecordedAt: pricingSnapshot.recordedAt,
    createdAt: pricingSnapshot.recordedAt,
    pending: true,
  }
  conversation.messages.push(userMessage, assistantMessageDraft)
  // Vue proxies objects inserted into the reactive array. Stream into that proxy so
  // every delta updates the UI immediately rather than waiting for another state change.
  const assistantMessage = conversation.messages[conversation.messages.length - 1]!
  for (const file of userMessage.attachments?.filter((item) => !item.type.startsWith('image/')) || []) addMessageReference(assistantMessage, { type: 'document', title: file.name })
  for (const item of enabledKnowledgeItems.value) addMessageReference(assistantMessage, { type: 'document', title: item.name })
  if (assistantMessage.reasoningEnabled) setReasoningOpen(assistantMessage.id, true)
  if (conversation.messages.length === 2) conversation.title = userMessage.content.slice(0, 54) || userMessage.attachments?.[0]?.name || t('chat.newChat')
  conversation.updatedAt = Date.now(); conversation.keyId = selectedKeyId.value; conversation.model = selectedModel.value
  draft.value = ''; attachments.value = []; resizeComposer(); sending.value = true; persist(); await scrollToBottom()
  requestController = new AbortController()
  let pendingText = ''
  let pendingReasoning = ''
  let streamFrame = 0
  let resolveStreamDrain: (() => void) | null = null
  const takeStreamUnit = (value: string) => {
    if (!value) return ['', ''] as const
    if (!value.trim()) return [value, ''] as const
    const match = value.match(/^\s*(?:[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]|[\p{L}\p{N}_]+|[^\s])/u)
    const unit = match?.[0] || value[0]
    return [unit, value.slice(unit.length)] as const
  }
  const flushStream = () => {
    streamFrame = 0
    if (pendingReasoning) {
      const [unit, rest] = takeStreamUnit(pendingReasoning)
      assistantMessage.reasoning = (assistantMessage.reasoning || '') + unit
      pendingReasoning = rest
    } else if (pendingText) {
      const [unit, rest] = takeStreamUnit(pendingText)
      assistantMessage.content += unit
      pendingText = rest
    }
    assistantMessage.renderedContent = renderMarkdown(assistantMessage.content)
    void scrollToBottom('auto')
    if (pendingReasoning || pendingText) scheduleStreamFlush()
    else if (resolveStreamDrain) {
      const resolve = resolveStreamDrain
      resolveStreamDrain = null
      resolve()
    }
  }
  const scheduleStreamFlush = () => {
    if (!streamFrame) streamFrame = window.requestAnimationFrame(flushStream)
  }
  const flushStreamImmediately = () => {
    if (streamFrame) window.cancelAnimationFrame(streamFrame)
    streamFrame = 0
    assistantMessage.reasoning = (assistantMessage.reasoning || '') + pendingReasoning
    assistantMessage.content += pendingText
    pendingReasoning = ''
    pendingText = ''
    assistantMessage.renderedContent = renderMarkdown(assistantMessage.content)
    if (resolveStreamDrain) {
      const resolve = resolveStreamDrain
      resolveStreamDrain = null
      resolve()
    }
  }
  const waitForStreamDrain = () => {
    if (!pendingReasoning && !pendingText) return Promise.resolve()
    scheduleStreamFlush()
    return new Promise<void>((resolve) => { resolveStreamDrain = resolve })
  }
  try {
    const messages: ChatGatewayMessage[] = conversation.messages.filter((message) => message.id !== assistantMessage.id).map((message) => ({ role: message.role, content: message.content, attachments: message.attachments?.filter((file) => file.dataUrl).map((file) => ({ name: file.name, type: file.type, dataUrl: file.dataUrl })) }))
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')
    if (lastUserMessage && enabledKnowledgeItems.value.length) {
      lastUserMessage.attachments = [
        ...(lastUserMessage.attachments || []),
        ...enabledKnowledgeItems.value.slice(0, MAX_ACTIVE_KNOWLEDGE).map((item) => ({ name: item.name, type: item.type, dataUrl: item.dataUrl })),
      ]
    }
    const previousGeneratedImage = [...conversation.messages].reverse().find((message) => message.id !== assistantMessage.id && message.images?.length)?.images?.at(-1)
    if (lastUserMessage && imageGeneration.value && previousGeneratedImage) {
      lastUserMessage.attachments = [...(lastUserMessage.attachments || []), { name: 'previous-generated-image.png', type: 'image/png', dataUrl: previousGeneratedImage }]
    }
    const result = await sendChatResponse({
      apiKey: selectedKey.value.key,
      model: selectedModel.value,
      messages,
      webSearch: webSearch.value,
      imageGeneration: imageGeneration.value,
      workspaceMode: workspaceMode.value,
      memory: memoryEnabled.value ? memory.value : '',
      reasoningEffort: reasoningEffort.value || undefined,
      signal: requestController.signal,
      onTextDelta: (delta) => {
        if (!assistantMessage.content && !pendingText && assistantMessage.reasoningEnabled) {
          assistantMessage.reasoningDurationMs = Date.now() - assistantMessage.createdAt
          setReasoningOpen(assistantMessage.id, false)
        }
        pendingText += delta
        scheduleStreamFlush()
      },
      onReasoningDelta: (delta) => { pendingReasoning += delta; scheduleStreamFlush() },
      onReference: (reference) => { addMessageReference(assistantMessage, reference); void scrollToBottom('auto') },
      onUsage: (usage) => { assistantMessage.usage = usage },
    })
    await waitForStreamDrain()
    if (!assistantMessage.content) assistantMessage.content = result.text
    if (!assistantMessage.reasoning) assistantMessage.reasoning = result.reasoning
    assistantMessage.images = result.images
    for (const reference of result.references || []) addMessageReference(assistantMessage, reference)
    assistantMessage.usage = result.usage
    assistantMessage.webSearchCalls = result.webSearchCalls
    const costs = calculateResponseCosts(result.usage, result.webSearchCalls || 0, pricingSnapshot)
    assistantMessage.standardCost = costs.standardCost
    assistantMessage.estimatedCost = costs.userCost
    assistantMessage.webSearchUnitCost = costs.webSearchUnitUserCost
    assistantMessage.webSearchCost = costs.webSearchUserCost
    if (!assistantMessage.content && !result.images.length) assistantMessage.content = t('chat.emptyResponse')
  } catch (error) {
    flushStreamImmediately()
    if ((error as Error).name === 'AbortError') assistantMessage.content ||= t('chat.stopped')
    else assistantMessage.content = t('chat.requestFailed', { message: extractApiErrorMessage(error, t('common.error')) })
  } finally {
    if (streamFrame || pendingText || pendingReasoning) flushStreamImmediately()
    if (assistantMessage.reasoning && !assistantMessage.reasoningDurationMs) assistantMessage.reasoningDurationMs = Date.now() - assistantMessage.createdAt
    assistantMessage.pending = false
    assistantMessage.renderedContent = await renderHighlightedMarkdown(assistantMessage.content)
    sending.value = false; requestController = null; conversation.updatedAt = Date.now(); persist(); await scrollToBottom()
  }
}

watch(activeConversationId, () => { void scrollToBottom() })
watch(modelPickerOpen, async (open) => { if (open) { await nextTick(); modelSearchInput.value?.focus() } })
watch(reasoningOptions, (options) => {
  if (!options.length) reasoningEffort.value = null
  else if (!reasoningEffort.value || !options.includes(reasoningEffort.value)) reasoningEffort.value = options.includes('medium') ? 'medium' : options[0]
}, { immediate: true })
watch(attachments, async () => { await nextTick(); updateComposerClearance() }, { deep: true })
watch([memory, memoryEnabled], () => {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, memory.value)
    localStorage.setItem(MEMORY_ENABLED_STORAGE_KEY, String(memoryEnabled.value))
  } catch { /* Storage may be disabled. */ }
})
onMounted(() => {
  marked.setOptions({ breaks: true, gfm: true })
  void createHighlighterCore({
    themes: [githubLight, githubDark],
    langs: [javascript, typescript, json, html, css, vue, bash, python, go, sql, markdown, yaml],
    engine: createJavaScriptRegexEngine(),
  }).then(async (instance) => {
    highlighter = instance
    await Promise.all(conversations.value.flatMap((conversation) => conversation.messages.filter((message) => message.role === 'assistant' && message.content).map(async (message) => { message.renderedContent = await renderHighlightedMarkdown(message.content) })))
  })
  loadHistory()
  loadMemory()
  void loadKnowledge()
  document.addEventListener('click', closePopovers)
  composerResizeObserver = new ResizeObserver(updateComposerClearance)
  if (composerWrapEl.value) composerResizeObserver.observe(composerWrapEl.value)
  updateComposerClearance()
  void loadChannelCatalog().then(loadKeys)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closePopovers)
  composerResizeObserver?.disconnect()
  highlighter?.dispose()
})
</script>

<style scoped>
.chat-workspace{height:calc(100dvh - 124px);min-height:580px;display:grid;grid-template-columns:260px minmax(0,1fr);overflow:hidden;border:1px solid rgba(57,48,28,.11);border-radius:14px;background:rgba(255,253,244,.7);box-shadow:0 18px 52px rgba(67,55,26,.09);backdrop-filter:blur(18px)}
.chat-history{min-width:0;display:flex;flex-direction:column;border-right:1px solid rgba(57,48,28,.1);background:rgba(244,239,217,.58)}.chat-history__header{display:flex;gap:8px;padding:14px}.chat-new{height:40px;flex:1;display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid rgba(39,107,83,.16);border-radius:9px;background:rgba(255,255,255,.65);color:#255c49;font-size:12px;font-weight:700}.chat-history__close{display:none}.chat-history-search{margin:0 14px 10px;display:flex;align-items:center;gap:8px;padding:9px 10px;border:1px solid rgba(57,48,28,.1);border-radius:9px;background:rgba(255,255,255,.5);color:#918a76}.chat-history-search input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:var(--ink);font-size:11px}.chat-history__list{flex:1;overflow-y:auto;padding:4px 8px 14px}.chat-history-row{display:flex;align-items:center;border-radius:9px;transition:background .16s ease,transform .16s ease}.chat-history-row:hover{background:rgba(255,255,255,.58);transform:translateX(1px)}.chat-history-row--active{background:rgba(39,107,83,.09)}.chat-history-item{min-width:0;flex:1;display:flex;align-items:center;gap:9px;padding:10px 8px;border:0;border-radius:9px;background:transparent;color:#625d4f;text-align:left}.chat-history-row--active .chat-history-item{color:#205644}.chat-history-item__icon{width:28px;height:28px;flex:0 0 auto;display:grid;place-items:center;border-radius:7px;background:rgba(255,255,255,.58)}.chat-history-item__copy{min-width:0;flex:1}.chat-history-item__copy strong,.chat-history-item__copy small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.chat-history-item__copy strong{font-size:11px;font-weight:680}.chat-history-item__copy small{margin-top:3px;color:#9a927c;font-size:9px}.chat-history-item__delete{width:26px;height:26px;flex:0 0 auto;display:grid;place-items:center;margin-right:5px;border:0;border-radius:6px;background:transparent;color:#a39b87;opacity:0}.chat-history-row:hover .chat-history-item__delete,.chat-history-item__delete:focus-visible{opacity:1}.chat-history-item__delete:hover{background:#fff1ef;color:#b83c35}.chat-history__empty{height:160px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#aaa28e;font-size:10px}.chat-history-backdrop{display:none}
.chat-main{min-width:0;display:flex;flex-direction:column}.chat-topbar{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:12px 18px;border-bottom:1px solid rgba(57,48,28,.09);background:rgba(255,255,255,.32)}.chat-topbar__title{min-width:0;display:flex;align-items:center;gap:10px}.chat-topbar__title>div span,.chat-topbar__title>div strong{display:block}.chat-topbar__title span{color:#8c846f;font-size:9px;font-weight:750;text-transform:uppercase}.chat-topbar__title strong{max-width:280px;overflow:hidden;color:#29271f;font-size:13px;text-overflow:ellipsis;white-space:nowrap}.chat-icon-button{width:36px;height:36px;display:grid;place-items:center;border:1px solid var(--line);border-radius:9px;background:rgba(255,255,255,.5);color:#706a59}.chat-menu-button{display:none}.chat-config{display:flex;align-items:center;gap:8px}.chat-config label{display:flex;align-items:center;gap:7px}.chat-config label>span{color:#8c846f;font-size:9px;font-weight:700;text-transform:uppercase}.chat-config select{width:150px;height:36px;padding:0 28px 0 10px;border:1px solid rgba(57,48,28,.11);border-radius:8px;background:rgba(255,255,255,.65);color:#37342b;font-size:10px;outline:0}.chat-config select:focus{border-color:rgba(39,107,83,.35);box-shadow:0 0 0 3px rgba(39,107,83,.08)}
.chat-messages{flex:1;overflow-y:auto;overscroll-behavior:contain;scroll-behavior:auto}.chat-welcome{width:min(720px,calc(100% - 32px));min-height:100%;margin:auto;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center}.chat-welcome__mark{width:56px;height:56px;display:grid;place-items:center;border:1px solid rgba(39,107,83,.16);border-radius:12px;background:rgba(39,107,83,.075);color:#276b53;box-shadow:0 10px 28px rgba(39,107,83,.09)}.chat-welcome h1{margin:18px 0 7px;color:#29271f;font-size:25px;font-weight:740}.chat-welcome p{max-width:520px;margin:0;color:#817a67;font-size:12px;line-height:1.7}.chat-prompts{width:100%;margin-top:26px;display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.chat-prompts button{min-height:76px;padding:13px;border:1px solid rgba(57,48,28,.1);border-radius:10px;background:rgba(255,255,255,.46);color:#5c5749;font-size:11px;line-height:1.5;text-align:left;transition:transform .18s ease,border-color .18s ease,background .18s ease}.chat-prompts button:hover{transform:translateY(-2px);border-color:rgba(39,107,83,.22);background:rgba(255,255,255,.72)}
.chat-message{padding:22px max(24px,calc((100% - 820px)/2));display:flex;gap:14px}.chat-message--user{background:rgba(247,243,225,.5)}.chat-message__avatar{width:32px;height:32px;flex:0 0 auto;display:grid;place-items:center;border:1px solid rgba(57,48,28,.1);border-radius:8px;background:#fff;color:#736d5b}.chat-message--assistant .chat-message__avatar{background:#276b53;color:#fff}.chat-message__content{min-width:0;flex:1;padding-top:5px;color:#353229;font-size:13px;line-height:1.75}.chat-message__content>p{margin:0;white-space:pre-wrap}.chat-markdown :deep(p){margin:0 0 12px}.chat-markdown :deep(p:last-child){margin-bottom:0}.chat-markdown :deep(ul),.chat-markdown :deep(ol){margin:8px 0;padding-left:20px}.chat-markdown :deep(pre){overflow:auto;margin:12px 0;padding:13px;border-radius:9px;background:#17211d;color:#dce7e1;font:11px/1.65 ui-monospace,monospace}.chat-markdown :deep(code){font-family:ui-monospace,monospace}.chat-markdown :deep(:not(pre)>code){padding:2px 5px;border-radius:5px;background:rgba(57,48,28,.07);font-size:11px}.chat-markdown :deep(a){color:#276b53;text-decoration:underline;text-underline-offset:3px}.chat-message__files{margin-top:12px;display:flex;flex-wrap:wrap;gap:6px}.chat-message__files span{display:flex;align-items:center;gap:5px;padding:5px 7px;border:1px solid rgba(57,48,28,.1);border-radius:7px;background:rgba(255,255,255,.55);color:#706a59;font-size:9px}.chat-message__images{margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,280px));gap:10px}.chat-message__images img{width:100%;aspect-ratio:1;object-fit:cover;border:1px solid var(--line);border-radius:10px}.chat-thinking{height:22px;display:flex;align-items:center;gap:4px}.chat-thinking i{width:5px;height:5px;border-radius:50%;background:#6e9b87;animation:chat-pulse 1.1s ease-in-out infinite}.chat-thinking i:nth-child(2){animation-delay:.14s}.chat-thinking i:nth-child(3){animation-delay:.28s}
.chat-composer-wrap{padding:10px max(20px,calc((100% - 820px)/2)) 14px;background:linear-gradient(to top,rgba(255,253,244,.98) 72%,rgba(255,253,244,0))}.chat-attachments{display:flex;gap:7px;margin-bottom:7px;overflow-x:auto}.chat-attachment{min-width:180px;display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--line);border-radius:9px;background:rgba(255,255,255,.82)}.chat-attachment>span{width:30px;height:30px;display:grid;place-items:center;border-radius:7px;background:#f0f7f3;color:#276b53}.chat-attachment>div{min-width:0;flex:1}.chat-attachment strong,.chat-attachment small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.chat-attachment strong{font-size:9px}.chat-attachment small{margin-top:2px;color:#98917d;font-size:8px}.chat-attachment button{width:24px;height:24px;display:grid;place-items:center;border:0;border-radius:6px;background:transparent;color:#948d79}.chat-composer{padding:11px;border:1px solid rgba(57,48,28,.13);border-radius:13px;background:rgba(255,255,255,.86);box-shadow:0 12px 34px rgba(67,55,26,.1);transition:border-color .18s ease,box-shadow .18s ease}.chat-composer:focus-within{border-color:rgba(39,107,83,.34);box-shadow:0 14px 38px rgba(67,55,26,.1),0 0 0 3px rgba(39,107,83,.07)}.chat-composer textarea{width:100%;min-height:30px;max-height:180px;resize:none;border:0;outline:0;background:transparent;color:#302e26;font:13px/1.6 inherit}.chat-composer__tools{margin-top:8px;display:flex;align-items:center;justify-content:space-between}.chat-composer__left{display:flex;align-items:center;gap:5px}.chat-tool{height:32px;display:flex;align-items:center;gap:6px;padding:0 8px;border:1px solid transparent;border-radius:8px;background:transparent;color:#817a67;font-size:9px;font-weight:680}.chat-tool:hover,.chat-tool.active{border-color:rgba(39,107,83,.14);background:#f0f7f3;color:#276b53}.chat-send{width:34px;height:34px;display:grid;place-items:center;border:0;border-radius:9px;background:#276b53;color:#fff;transition:transform .16s ease,background .16s ease}.chat-send:hover:not(:disabled){transform:translateY(-1px);background:#205644}.chat-send:disabled{background:#b6b09f;cursor:not-allowed}.chat-send--stop{background:#6f6655}.chat-composer-note{margin:7px 4px 0;color:#a09985;font-size:8px;text-align:center}
.dark .chat-workspace{background:rgba(28,31,27,.8);border-color:rgba(255,255,255,.08)}.dark .chat-history{background:rgba(20,23,20,.72);border-color:rgba(255,255,255,.07)}.dark .chat-new,.dark .chat-history-search,.dark .chat-icon-button,.dark .chat-config select,.dark .chat-composer,.dark .chat-attachment{background:rgba(255,255,255,.045);border-color:rgba(255,255,255,.09);color:#e7e3d5}.dark .chat-topbar{background:rgba(255,255,255,.02);border-color:rgba(255,255,255,.07)}.dark .chat-topbar__title strong,.dark .chat-welcome h1,.dark .chat-message__content{color:#eeeadd}.dark .chat-message--user{background:rgba(255,255,255,.018)}.dark .chat-message__avatar{background:#262a25;border-color:rgba(255,255,255,.08)}.dark .chat-composer-wrap{background:linear-gradient(to top,rgba(28,31,27,.98) 72%,rgba(28,31,27,0))}.dark .chat-composer textarea{color:#eeeadd}.dark .chat-prompts button{background:rgba(255,255,255,.035);border-color:rgba(255,255,255,.08);color:#cec9ba}
@keyframes chat-pulse{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
@media(max-width:900px){.chat-workspace{height:calc(100dvh - 105px);min-height:520px;grid-template-columns:1fr;border-radius:11px}.chat-history{position:fixed;z-index:160;top:0;bottom:0;left:0;width:min(310px,86vw);transform:translateX(-105%);transition:transform .22s cubic-bezier(.22,1,.36,1);box-shadow:20px 0 50px rgba(20,24,20,.2)}.chat-history--open{transform:translateX(0)}.chat-history-backdrop{position:fixed;z-index:150;inset:0;display:block;border:0;background:rgba(20,24,20,.35);backdrop-filter:blur(3px)}.chat-history__close,.chat-menu-button{display:grid;width:40px;height:40px;place-items:center;border:1px solid var(--line);border-radius:9px;background:transparent;color:#716b5a}.chat-topbar{align-items:flex-start;flex-direction:column;padding:10px 12px}.chat-config{width:100%}.chat-config label{min-width:0;flex:1;flex-direction:column;align-items:flex-start;gap:3px}.chat-config select{width:100%}.chat-message{padding:18px 14px}.chat-composer-wrap{padding:8px 10px 10px}.chat-prompts{grid-template-columns:1fr}.chat-welcome{padding:34px 0}.chat-tool span{display:none}}
@media(prefers-reduced-motion:reduce){.chat-thinking i{animation:none}.chat-history,.chat-message__images img,.chat-prompts button,.chat-send{transition:none}}
</style>

<style scoped>
/* Reference-led chat layout: open canvas, quiet controls, and a centered composer. */
.chat-workspace {
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 620px;
  margin: 0;
  grid-template-columns: 292px minmax(0, 1fr);
  border: 0;
  border-radius: 0;
  background: #fffdf6;
  box-shadow: none;
  backdrop-filter: none;
}

.chat-history {
  border-right: 1px solid rgba(52, 49, 39, .08);
  background: rgba(247, 241, 220, .78);
}
.chat-history__header { padding: 20px 18px 11px; }
.chat-new {
  height: 44px;
  padding: 0 8px;
  border: 0;
  background: transparent;
  color: #29291f;
  font-size: 14px;
  font-weight: 720;
}
.chat-new:hover { color: #1f6049; transform: translateX(2px); }
.chat-history-search {
  margin: 0 18px 12px;
  padding: 10px 8px;
  border: 0;
  border-bottom: 1px solid rgba(52, 49, 39, .09);
  border-radius: 0;
  background: transparent;
  color: #8a877b;
}
.chat-history-search:focus-within { border-color: rgba(31, 96, 73, .36); }
.chat-history-search input { font-size: 14px; }
.chat-context-shortcuts { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 0 18px 10px; }
.chat-context-shortcuts button { min-width: 0; height: 38px; display: flex; align-items: center; gap: 6px; padding: 0 8px; border: 0; border-radius: 7px; background: transparent; color: #747064; font-size: 10px; font-weight: 650; }
.chat-context-shortcuts button:hover,.chat-context-shortcuts button.active { background: rgba(255,255,255,.58); color: #1f6049; }
.chat-context-shortcuts button span { min-width: 0; overflow: hidden; flex: 1; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
.chat-context-shortcuts button small { min-width: 18px; color: #959084; font-size: 9px; text-align: center; }
.chat-history__section-label {
  padding: 13px 26px 7px;
  color: #969184;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.chat-history__list { padding: 0 13px 22px; }
.chat-history-row { margin: 2px 0; border-radius: 7px; }
.chat-history-row:hover { background: rgba(255, 255, 255, .6); transform: none; }
.chat-history-row--active { background: rgba(31, 96, 73, .07); }
.chat-history-item { padding: 9px 10px; }
.chat-history-item__icon { display: none; }
.chat-history-item__copy strong { font-size: 13px; font-weight: 600; }
.chat-history-item__copy small { font-size: 10px; }
.chat-history__account {
  width: calc(100% - 28px);
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 14px 16px;
  padding: 12px 10px;
  border: 0;
  border-top: 1px solid rgba(52, 49, 39, .08);
  border-radius: 0;
  background: transparent;
  color: #5f5c51;
  text-align: left;
  transition: color .18s ease, transform .18s ease;
}
.chat-history__account:hover { color: #1f6049; transform: translateX(2px); }
.chat-history__account-avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #262820;
  color: #fff;
  font-size: 10px;
  font-weight: 750;
}
.chat-history__account-copy { min-width: 0; flex: 1; }
.chat-history__account-copy strong, .chat-history__account-copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-history__account-copy strong { color: currentColor; font-size: 13px; font-weight: 700; }
.chat-history__account-copy small { margin-top: 2px; color: #aaa597; font-size: 10px; }

.chat-main { position: relative; overflow: hidden; background: rgba(255, 254, 249, .78); }
.chat-context-panel { position: absolute; z-index: 130; top: 0; right: 0; bottom: 0; width: min(430px,100%); display: flex; flex-direction: column; overflow-y: auto; border-left: 1px solid rgba(52,49,39,.1); background: rgba(255,254,248,.98); box-shadow: -18px 0 48px rgba(60,53,33,.12); backdrop-filter: blur(20px); animation: context-panel-in .24s cubic-bezier(.22,1,.36,1) both; }
.chat-context-panel > header { min-height: 68px; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; border-bottom: 1px solid rgba(52,49,39,.08); }
.chat-context-panel > header > div { display: flex; align-items: center; gap: 9px; color: #2f3028; }
.chat-context-panel > header strong { font-size: 15px; }
.chat-context-panel > header button { width: 36px; height: 36px; display: grid; place-items: center; border: 0; border-radius: 8px; background: transparent; color: #7f7b70; }
.chat-context-panel > header button:hover { background: rgba(244,240,224,.7); }
.chat-context-panel__intro { margin: 0; padding: 16px 18px 10px; color: #817d71; font-size: 12px; line-height: 1.6; }
.chat-knowledge-upload { min-height: 64px; display: flex; align-items: center; gap: 11px; margin: 8px 18px; padding: 10px 12px; border: 1px dashed rgba(31,96,73,.25); border-radius: 9px; background: rgba(238,244,236,.56); color: #1f6049; cursor: pointer; }
.chat-knowledge-upload > span { min-width: 0; flex: 1; }.chat-knowledge-upload strong,.chat-knowledge-upload small { display: block; }.chat-knowledge-upload strong { font-size: 12px; }.chat-knowledge-upload small { margin-top: 3px; color: #858176; font-size: 9px; }.chat-knowledge-upload input { display: none; }
.chat-knowledge-note { display: grid; gap: 7px; margin: 9px 18px 15px; }
.chat-knowledge-note input,.chat-knowledge-note textarea,.chat-memory-editor textarea { width: 100%; padding: 9px 10px; border: 1px solid rgba(52,49,39,.1); border-radius: 8px; outline: 0; background: #fff; color: #35362e; font: 12px/1.55 inherit; resize: vertical; }
.chat-knowledge-note input:focus,.chat-knowledge-note textarea:focus,.chat-memory-editor textarea:focus { border-color: rgba(31,96,73,.36); box-shadow: 0 0 0 3px rgba(31,96,73,.07); }
.chat-knowledge-note button { justify-self: end; height: 34px; display: flex; align-items: center; gap: 5px; padding: 0 10px; border: 0; border-radius: 7px; background: #1f6049; color: #fff; font-size: 10px; font-weight: 700; }
.chat-knowledge-note button:disabled { background: #c6c2b6; }
.chat-knowledge-list { padding: 0 12px 18px; }
.chat-knowledge-item { min-height: 58px; display: flex; align-items: center; gap: 8px; padding: 7px 6px; border-bottom: 1px solid rgba(52,49,39,.065); }
.chat-knowledge-toggle,.chat-knowledge-delete { width: 27px; height: 27px; flex: 0 0 auto; display: grid; place-items: center; border: 1px solid rgba(52,49,39,.1); border-radius: 7px; background: transparent; color: #999488; }
.chat-knowledge-toggle.active { border-color: rgba(31,96,73,.22); background: #eaf2e9; color: #1f6049; }.chat-knowledge-delete:hover { background: #fff0ee; color: #ad3b35; }
.chat-knowledge-item__icon { width: 30px; height: 30px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 7px; background: rgba(244,240,224,.75); color: #777267; }
.chat-knowledge-item__copy { min-width: 0; flex: 1; }.chat-knowledge-item__copy strong,.chat-knowledge-item__copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.chat-knowledge-item__copy strong { font-size: 11px; }.chat-knowledge-item__copy small { margin-top: 3px; color: #9d988c; font-size: 8px; }
.chat-context-empty { min-height: 150px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 7px; color: #a39e92; font-size: 11px; }
.chat-memory-toggle { min-height: 62px; display: flex; align-items: center; gap: 12px; margin: 8px 18px 15px; padding: 10px 12px; border: 1px solid rgba(52,49,39,.09); border-radius: 9px; background: rgba(247,243,228,.52); }
.chat-memory-toggle > span { min-width: 0; flex: 1; }.chat-memory-toggle strong,.chat-memory-toggle small { display: block; }.chat-memory-toggle strong { font-size: 12px; }.chat-memory-toggle small { margin-top: 3px; color: #918c80; font-size: 9px; }.chat-memory-toggle input { width: 17px; height: 17px; accent-color: #1f6049; }
.chat-memory-editor { display: grid; gap: 7px; margin: 0 18px; }.chat-memory-editor > span { color: #6f6b60; font-size: 10px; font-weight: 750; text-transform: uppercase; }.chat-memory-editor textarea { min-height: 260px; }.chat-memory-editor small { color: #999489; font-size: 9px; line-height: 1.5; }
.chat-memory-clear { height: 36px; display: flex; align-items: center; justify-content: center; gap: 6px; margin: 16px 18px; border: 1px solid rgba(173,59,53,.13); border-radius: 8px; background: transparent; color: #a33d37; font-size: 10px; font-weight: 700; }
.chat-topbar {
  min-height: 76px;
  padding: 13px 26px;
  border-bottom: 0;
  background: transparent;
}
.chat-topbar__title > div { display: flex; min-width: 0; flex-direction: column; gap: 2px; }
.chat-topbar__title strong {
  order: 0;
  max-width: 360px;
  color: #24251e;
  font-size: 18px;
  font-weight: 720;
}
.chat-topbar__title span {
  order: 1;
  max-width: 360px;
  overflow: hidden;
  color: #aaa699;
  font-size: 11px;
  font-weight: 500;
  text-overflow: ellipsis;
  text-transform: none;
  white-space: nowrap;
}
.chat-config { gap: 4px; }
.chat-group-trigger { max-width: 180px; height: 42px; display: inline-flex; align-items: center; gap: 7px; padding: 0 10px; border: 1px solid rgba(52,49,39,.08); border-radius: 9px; background: rgba(255,255,255,.42); color: #555249; font-size: 11px; font-weight: 680; transition: background .16s ease,border-color .16s ease; }
.chat-group-trigger:hover { border-color: rgba(31,96,73,.2); background: rgba(255,255,255,.72); color: #1f6049; }
.chat-group-trigger span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-group-dialog__intro { margin: 0 0 14px; color: #777267; font-size: 13px; line-height: 1.65; }
.chat-group-list { max-height: min(440px,55dvh); display: grid; gap: 7px; overflow-y: auto; overscroll-behavior: contain; }
.chat-group-option { width: 100%; min-height: 64px; display: grid; grid-template-columns: 38px minmax(0,1fr) 20px; align-items: center; gap: 10px; padding: 9px 11px; border: 1px solid rgba(52,49,39,.09); border-radius: 9px; background: #fff; color: #3d3c34; text-align: left; transition: transform .16s ease,border-color .16s ease,background .16s ease; }
.chat-group-option:hover { transform: translateY(-1px); border-color: rgba(31,96,73,.22); }
.chat-group-option.active { border-color: rgba(31,96,73,.36); background: #eef4ec; color: #1f6049; }
.chat-group-option__icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 8px; background: rgba(247,241,220,.72); }
.chat-group-option strong,.chat-group-option small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-group-option strong { font-size: 13px; }.chat-group-option small { margin-top: 4px; color: #8f8a7d; font-size: 10px; text-transform: capitalize; }
.chat-group-empty { padding: 32px 12px; color: #969184; font-size: 12px; text-align: center; }
.chat-config label { gap: 3px; }
.chat-config label > span { color: #a09c90; font-size: 10px; }
.chat-config select {
  width: 164px;
  height: 38px;
  padding: 0 28px 0 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
}
.chat-config select:hover { background: rgba(247, 241, 220, .72); }
.chat-config select:focus { border-color: transparent; box-shadow: 0 0 0 3px rgba(31, 96, 73, .08); }
.chat-model-picker { position: relative; display: flex; align-items: center; gap: 4px; }
.chat-model-picker__label { color: #a09c90; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.chat-model-trigger { width: 330px; min-width: 0; height: 50px; display: flex; align-items: center; gap: 10px; padding: 6px 10px; border: 1px solid rgba(52,49,39,.08); border-radius: 9px; background: rgba(255,255,255,.42); color: #36372f; text-align: left; transition: border-color .18s ease,background .18s ease,box-shadow .18s ease; }
.chat-model-trigger:hover:not(:disabled) { border-color: rgba(31,96,73,.2); background: rgba(255,255,255,.72); }
.chat-model-trigger:focus-visible { outline: 0; box-shadow: 0 0 0 3px rgba(31,96,73,.09); }
.chat-model-trigger:disabled { cursor: not-allowed; opacity: .55; }
.chat-model-trigger__copy { min-width: 0; flex: 1; }
.chat-model-trigger__copy strong,.chat-model-trigger__copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-model-trigger__copy strong { font-size: 12px; font-weight: 720; }
.chat-model-trigger__copy small { margin-top: 2px; color: #8f8a7d; font-size: 9px; font-weight: 500; }
.chat-model-menu { position: absolute; z-index: 80; top: calc(100% + 8px); right: 0; width: 480px; max-width: calc(100vw - 36px); padding: 8px; border: 1px solid rgba(52,49,39,.1); border-radius: 11px; background: rgba(255,254,248,.98); box-shadow: 0 18px 48px rgba(60,53,33,.14); backdrop-filter: blur(18px); animation: model-menu-in .18s cubic-bezier(.22,1,.36,1) both; }
.chat-model-search { height: 42px; display: flex; align-items: center; gap: 9px; margin-bottom: 6px; padding: 0 11px; border-bottom: 1px solid rgba(52,49,39,.09); color: #8d897d; }
.chat-model-search input { min-width: 0; width: 100%; border: 0; outline: 0; background: transparent; color: #303129; font-size: 13px; }
.chat-model-options { max-height: min(430px,calc(100vh - 180px)); overflow-y: auto; overscroll-behavior: contain; }
.chat-model-option { width: 100%; min-height: 58px; display: grid; grid-template-columns: 34px minmax(0,1fr) minmax(120px,auto) 16px; align-items: center; gap: 9px; padding: 8px 10px; border: 0; border-radius: 8px; background: transparent; color: #3a3a32; text-align: left; transition: background .15s ease,transform .15s ease; }
.chat-model-option:hover { background: rgba(239,242,229,.8); transform: translateX(1px); }
.chat-model-option--active { background: rgba(31,96,73,.07); color: #1f6049; }
.chat-model-option__icon { width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid rgba(52,49,39,.08); border-radius: 8px; background: rgba(255,255,255,.62); }
.chat-model-option__copy { min-width: 0; }
.chat-model-option__copy strong,.chat-model-option__copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-model-option__copy strong { font-size: 12px; font-weight: 700; }
.chat-model-option__copy small { margin-top: 3px; color: #9d988c; font-size: 9px; }
.chat-model-option__price { color: #767267; font-size: 9px; line-height: 1.45; text-align: right; white-space: nowrap; }
.chat-model-options__empty { padding: 32px 14px; color: #999589; font-size: 12px; text-align: center; }

.chat-messages { padding: 0 24px; }
.chat-welcome {
  width: min(760px, calc(100% - 32px));
  min-height: 100%;
  padding-bottom: 0;
}
.chat-welcome__mark { display: none; }
.chat-welcome h1 { margin: 0; color: #20211c; font-size: 34px; font-weight: 720; }
.chat-welcome p { margin-top: 34px; color: #8f8b80; font-size: 16px; }
.chat-prompts { display: flex; justify-content: center; gap: 8px; margin-top: 170px; }
.chat-prompts button {
  width: auto;
  min-height: 34px;
  padding: 7px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #898578;
  font-size: 12px;
  text-align: center;
}
.chat-prompts button:hover { background: rgba(247, 241, 220, .72); color: #1f6049; transform: translateY(-1px); }

.chat-message {
  width: min(850px, 100%);
  margin: 0 auto;
  padding: 24px 0;
  background: transparent;
  animation: chat-arrive .42s cubic-bezier(.16, 1, .3, 1) both;
}
.chat-message--user { --chat-arrive-x: 10px; }
.chat-message--assistant { --chat-arrive-x: -10px; }
.chat-message--pending .chat-message__avatar { animation: assistant-breathe 1.8s ease-in-out infinite; }
.chat-markdown--streaming { animation: chat-stream-reveal .2s ease-out both; }
.chat-message--user { flex-direction: row-reverse; background: transparent; }
.chat-message__avatar { width: 30px; height: 30px; border: 0; border-radius: 8px; box-shadow: none; }
.chat-message--assistant .chat-message__avatar { border: 1px solid rgba(52,49,39,.08); background: rgba(255,255,255,.78); color: #3f6f5b; }
.chat-message__content { padding-top: 3px; font-size: 15px; }
.chat-message--user .chat-message__content {
  max-width: min(680px, 80%);
  flex: 0 1 auto;
  padding: 10px 14px;
  border: 1px solid rgba(31, 96, 73, .08);
  border-radius: 14px 14px 5px 14px;
  background: rgba(234, 242, 234, .82);
}
.chat-message-actions { min-height: 28px; display: flex; align-items: center; gap: 9px; margin-top: 11px; color: #9a9589; font-size: 9px; opacity: 0; transform: translateY(3px); transition: opacity .16s ease,transform .16s ease; }
.chat-message:hover .chat-message-actions,.chat-message-actions:focus-within { opacity: 1; transform: translateY(0); }
.chat-message-actions button { height: 28px; display: inline-flex; align-items: center; gap: 5px; padding: 0 7px; border: 0; border-radius: 7px; background: transparent; color: #777368; font-size: 10px; }
.chat-message-actions button:hover { background: rgba(239,242,229,.8); color: #1f6049; }
.chat-token-usage { display: inline-flex; align-items: center; gap: 3px; }.chat-token-usage b { color: #777368; font-weight: 700; }.chat-token-usage i { width: 2px; height: 2px; margin: 0 2px; border-radius: 50%; background: currentColor; opacity: .55; }
.chat-message-actions .chat-user-cost { color:#26664f; font-weight:750; }.chat-message-actions .chat-happy-hour-cost { padding:3px 6px; border-radius:6px; background:rgba(197,143,36,.1); color:#8c641f; font-weight:750; }

.chat-composer-wrap {
  padding: 0;
  background: #fff;
}
.chat-composer {
  padding: 0;
  border: 0;
  border-top: 1px solid rgba(52, 49, 39, .1);
  border-radius: 0;
  background: #fff;
  box-shadow: none;
}
.chat-composer:focus-within { border-color: transparent; outline: 0; box-shadow: none; }
.chat-composer textarea { min-height: 48px; padding: 13px 16px 4px; font-size: 16px; }
.chat-composer-modes { display: flex; align-items: center; gap: 3px; padding: 8px 10px 0; }
.chat-composer-modes button { height: 32px; display: inline-flex; align-items: center; gap: 6px; padding: 0 10px; border: 0; border-radius: 7px; background: transparent; color: #8a867a; font-size: 11px; font-weight: 680; }
.chat-composer-modes button:hover,.chat-composer-modes button.active { background: rgba(236,242,232,.82); color: #1f6049; }
.chat-image-controls { display: grid; grid-template-columns: minmax(180px,1.5fr) repeat(4,minmax(92px,.7fr)); gap: 9px; padding: 12px 14px 8px; border-top: 1px solid rgba(52,49,39,.07); border-bottom: 1px solid rgba(52,49,39,.07); background: #fbfaf4; }
.chat-image-field { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.chat-image-field > span,.chat-image-field legend { padding: 0; color: #898579; font-size: 9px; font-weight: 750; text-transform: uppercase; }
.chat-image-field select { width: 100%; height: 38px; padding: 0 26px 0 9px; border: 1px solid rgba(52,49,39,.1); border-radius: 7px; outline: 0; background: #fff; color: #3e3d36; font-size: 11px; }
.chat-image-field select:focus { border-color: rgba(31,96,73,.35); box-shadow: 0 0 0 3px rgba(31,96,73,.07); }
.chat-aspect-field { grid-column: 1 / -1; display: flex; align-items: flex-end; flex-direction: row; gap: 6px; border: 0; }
.chat-aspect-field legend { align-self: center; margin-right: 5px; }
.chat-aspect-field button { width: 62px; height: 50px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 4px; border: 1px solid rgba(52,49,39,.09); border-radius: 7px; background: #fff; color: #817d71; font-size: 9px; transition: border-color .16s ease,background .16s ease,color .16s ease; }
.chat-aspect-field button i { width: 20px; max-height: 24px; border: 1.5px solid currentColor; border-radius: 2px; }
.chat-aspect-field button:hover,.chat-aspect-field button.active { border-color: rgba(31,96,73,.32); background: #eef4ec; color: #1f6049; }
.chat-composer--image textarea { min-height: 64px; padding-top: 12px; }
.chat-composer--image .chat-composer__right { margin-left: auto; }
.chat-composer__tools { margin-top: 0; padding: 5px 12px 10px; }
.chat-composer__left,.chat-composer__right { display: flex; align-items: center; gap: 5px; }
.chat-tool { color: #78756b; font-size: 11px; }
.chat-tool:hover, .chat-tool.active { border-color: transparent; background: rgba(236, 242, 232, .85); }
.chat-tool--add { width: 34px; padding: 0; justify-content: center; border: 1px solid rgba(52,49,39,.1); border-radius: 50%; }
.chat-tool-menu-wrap { position: relative; }
.chat-tool-menu { position: absolute; z-index: 90; bottom: calc(100% + 9px); left: 0; width: 340px; padding: 7px; border: 1px solid rgba(52,49,39,.1); border-radius: 11px; background: rgba(255,254,249,.98); box-shadow: 0 16px 44px rgba(60,53,33,.15); backdrop-filter: blur(18px); animation: model-menu-in .18s cubic-bezier(.22,1,.36,1) both; }
.chat-tool-menu > button { width: 100%; min-height: 52px; display: flex; align-items: center; gap: 11px; padding: 8px 10px; border: 0; border-radius: 8px; background: transparent; color: #4f4d44; text-align: left; transition: background .15s ease,color .15s ease; }
.chat-tool-menu > button:hover,.chat-tool-menu > button.active { background: rgba(236,242,232,.82); color: #1f6049; }
.chat-tool-menu > button > span { min-width: 0; flex: 1; }
.chat-tool-menu strong,.chat-tool-menu small { display: block; }
.chat-tool-menu strong { font-size: 12px; font-weight: 700; }
.chat-tool-menu small { margin-top: 2px; color: #999488; font-size: 9px; }
.chat-workspace-chip { height: 32px; display: inline-flex; align-items: center; gap: 5px; padding: 0 8px; border-radius: 8px; background: rgba(236,242,232,.85); color: #1f6049; font-size: 10px; font-weight: 650; }
.chat-reasoning-level { height: 34px; display: flex; align-items: center; gap: 4px; padding: 0 7px; border-radius: 8px; color: #777368; transition: background .15s ease; }
.chat-reasoning-level:hover { background: rgba(244,240,224,.72); }
.chat-reasoning-level select { max-width: 92px; border: 0; outline: 0; background: transparent; color: inherit; font-size: 11px; font-weight: 650; }
.chat-send { border-radius: 50%; background: #1f6049; }
.chat-send:not(:disabled) { animation: send-ready .28s cubic-bezier(.16,1,.3,1) both; }
.chat-send:disabled { background: #d3d0c5; }
.chat-composer-note { margin: 0; padding: 5px 10px 8px; background: #fff; color: #9f9b90; font-size: 10px; }
.chat-usage-strip { min-height: 28px; display: flex; align-items: center; justify-content:center; gap: 8px; padding: 4px 10px 7px; background:#fff; color:#969184; font-size:9px; }
.chat-usage-strip>span { display:inline-flex; align-items:center; gap:4px; white-space:nowrap; }
.chat-usage-strip>i { width:64px; height:4px; overflow:hidden; border-radius:999px; background:#ebe8dc; }
.chat-usage-strip>i b { height:100%; display:block; border-radius:inherit; background:#4f8b70; transition:width .35s cubic-bezier(.16,1,.3,1); }
.chat-attachments { margin: 0; padding: 9px 12px 0; background: #fff; }

.chat-main--empty .chat-composer-wrap {
  position: absolute;
  z-index: 4;
  top: 47%;
  left: 50%;
  width: min(850px, calc(100% - 72px));
  padding: 0;
  transform: translateX(-50%);
  background: transparent;
  animation: composer-enter .52s .12s cubic-bezier(.16,1,.3,1) both;
}
.chat-main--empty .chat-messages { overflow: hidden; }
.chat-main--empty .chat-welcome { height: 100%; min-height: 0; justify-content: flex-start; padding-top: clamp(110px, 16vh, 180px); padding-bottom: 0; box-sizing: border-box; }
.chat-main--empty .chat-welcome h1 { animation: welcome-enter .52s cubic-bezier(.16,1,.3,1) both; }
.chat-main--empty .chat-welcome p { animation: welcome-enter .52s .07s cubic-bezier(.16,1,.3,1) both; }
.chat-main--empty .chat-prompts { position: absolute; top: calc(47% + var(--chat-composer-height, 210px) + 42px); left: 50%; width: min(760px, calc(100% - 48px)); margin: 0; transform: translateX(-50%); }
.chat-main--empty .chat-prompts button { animation: prompt-enter .42s cubic-bezier(.16,1,.3,1) both; }
.chat-main--empty .chat-prompts button:nth-child(2) { animation-delay: .06s; }
.chat-main--empty .chat-prompts button:nth-child(3) { animation-delay: .12s; }
.chat-main--empty .chat-composer { overflow: visible; border: 0; border-radius: 12px; box-shadow: 0 12px 36px rgba(60,53,33,.08); }
.chat-main--empty .chat-composer:focus-within { border: 0; box-shadow: 0 12px 36px rgba(60,53,33,.08); }
.chat-main--empty .chat-composer-note { background: transparent; }
.chat-main--empty .chat-composer textarea { font-size: 18px; }
.chat-main--empty .chat-composer-note { margin-top: 10px; }
.chat-main--empty.chat-main--image .chat-composer-wrap { top: 31%; width: min(980px,calc(100% - 56px)); }

.dark .chat-workspace { background: #191b18; }
.dark .chat-history { background: rgba(28, 31, 27, .95); }
.dark .chat-main, .dark .chat-topbar, .dark .chat-composer-wrap { background: #1c1f1b; }
.dark .chat-main--empty .chat-composer-wrap { background: transparent; }
.dark .chat-history-row:hover { background: rgba(255, 255, 255, .045); }
.dark .chat-history-row--active { background: rgba(78, 145, 116, .12); }
.dark .chat-config select { background: transparent; }
.dark .chat-config select:hover { background: rgba(255, 255, 255, .05); }
.dark .chat-model-trigger,.dark .chat-model-menu { border-color: rgba(255,255,255,.09); background: rgba(31,34,30,.98); color: #eeeadd; }
.dark .chat-group-trigger,.dark .chat-group-option { border-color: rgba(255,255,255,.09); background: #242722; color: #ddd8ca; }
.dark .chat-group-option.active { border-color: rgba(117,170,143,.34); background: rgba(78,145,116,.14); color: #9ac5ae; }
.dark .chat-model-search input { color: #eeeadd; }
.dark .chat-model-option { color: #ddd8ca; }
.dark .chat-model-option:hover,.dark .chat-model-option--active { background: rgba(91,132,107,.16); }
.dark .chat-model-option__icon { border-color: rgba(255,255,255,.08); background: rgba(255,255,255,.04); }
.dark .chat-context-panel { border-color: rgba(255,255,255,.08); background: rgba(29,32,28,.98); }
.dark .chat-context-panel > header > div { color: #eeeadd; }
.dark .chat-knowledge-note input,.dark .chat-knowledge-note textarea,.dark .chat-memory-editor textarea { border-color: rgba(255,255,255,.09); background: #242722; color: #eeeadd; }
.dark .chat-knowledge-upload,.dark .chat-memory-toggle { border-color: rgba(255,255,255,.09); background: rgba(255,255,255,.035); }
.dark .chat-welcome h1, .dark .chat-topbar__title strong { color: #eeeadd; }
.dark .chat-message--user .chat-message__content { border-color: rgba(117, 170, 143, .1); background: rgba(54, 78, 64, .45); }
.dark .chat-composer,.dark .chat-composer-wrap,.dark .chat-composer-note,.dark .chat-usage-strip,.dark .chat-attachments { background: #222520; }
.dark .chat-tool-menu { border-color: rgba(255,255,255,.09); background: rgba(31,34,30,.98); }
.dark .chat-tool-menu > button { color: #d9d5c8; }
.dark .chat-reasoning-level select { color: #d9d5c8; }
.dark .chat-image-controls { border-color: rgba(255,255,255,.07); background: #1d201c; }
.dark .chat-image-field select,.dark .chat-aspect-field button { border-color: rgba(255,255,255,.09); background: #292c27; color: #d8d4c6; }
.dark .chat-aspect-field button.active { background: rgba(91,132,107,.18); color: #9ac5ae; }

.chat-answer-stream { position: relative; }
.chat-output-loading { width: 22px; height: 17px; display: inline-flex; align-items: center; gap: 3px; margin-top: 5px; color: #56816e; }
.chat-output-loading i { width: 3px; height: 3px; border-radius: 50%; background: currentColor; animation: chat-output-dot 1s ease-in-out infinite; }
.chat-output-loading i:nth-child(2) { animation-delay: .12s; }.chat-output-loading i:nth-child(3) { animation-delay: .24s; }
.chat-reasoning-panel { max-width: 680px; margin: 0 0 15px; color: #6f6b60; }
.chat-reasoning-panel summary { width: max-content; max-width: 100%; min-height: 32px; display: flex; align-items: center; gap: 7px; padding: 2px 2px; color: #6d6b63; font-size: 11px; font-weight: 700; cursor: pointer; list-style: none; user-select: none; transition: color .16s ease; }
.chat-reasoning-panel summary:hover { color: #28674f; }
.chat-reasoning-panel summary::-webkit-details-marker { display: none; }
.chat-reasoning-panel summary svg:last-child { margin-left: 2px; transition: transform .18s ease; }
.chat-reasoning-panel[open] summary svg:last-child { transform: rotate(180deg); }
.chat-reasoning-panel__mark { width: 22px; height: 22px; display: grid; place-items: center; flex: 0 0 auto; color: #37745c; }
.chat-reasoning-title { position: relative; overflow: hidden; white-space: nowrap; }
.chat-reasoning-title--active { animation: thinking-title-shimmer 1.45s ease-in-out infinite; }
.chat-reasoning-title--active::after { position: absolute; top: -20%; bottom: -20%; left: -5px; width: 3px; border-radius: 50%; background: rgba(255,255,255,.9); box-shadow: 0 0 7px 3px rgba(95,145,119,.2); content: ''; transform: translateX(-10px) skewX(-12deg); animation: thinking-sheen 1.45s ease-in-out infinite; }
.chat-reasoning-status { display: inline-flex; align-items: center; gap: 3px; margin-left: 1px; }
.chat-reasoning-status i { width: 3px; height: 3px; border-radius: 50%; background: #4c8a70; animation: chat-reasoning-dot 1.15s ease-in-out infinite; }
.chat-reasoning-status i:nth-child(2) { animation-delay: .14s; }.chat-reasoning-status i:nth-child(3) { animation-delay: .28s; }
.chat-reasoning-body { overflow: hidden; animation: reasoning-panel-open .22s cubic-bezier(.16,1,.3,1) both; }
.chat-reasoning-markdown { max-height: 280px; overflow-y: auto; padding: 4px 8px 7px 29px; color: #77766d; font-size: 12px; line-height: 1.68; scrollbar-width: thin; }
.chat-reasoning-live { padding: 4px 8px 7px 29px; color: #918c80; font-size: 11px; animation: reasoning-reveal .18s ease both; }
.chat-reasoning-markdown :deep(p) { margin: 0 0 7px; }
.dark .chat-reasoning-markdown { color: #aaa697; }
.chat-response-references { display: flex; flex-wrap: wrap; gap: 6px; margin: 1px 0 12px; }
.chat-response-references>a,.chat-response-references>span { min-width: 0; max-width: min(100%,360px); height: 30px; display: inline-flex; align-items: center; gap: 6px; padding: 0 8px; border: 1px solid rgba(52,49,39,.08); border-radius: 7px; background: rgba(248,248,243,.72); color: #747168; font-size: 10px; text-decoration: none; transition: border-color .16s ease,background .16s ease,color .16s ease,transform .16s ease; }
.chat-response-references>a:hover { transform: translateY(-1px); border-color: rgba(31,96,73,.2); background: rgba(241,246,238,.95); color: #28674f; }
.chat-response-references span span,.chat-response-references a span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-response-references>span small { flex: 0 0 auto; padding-left: 2px; color: #438068; font-size: 9px; font-weight: 750; }
.chat-response-references>a svg:last-child { flex: 0 0 auto; opacity: .6; }
.chat-generated-image { position: relative; min-width: 0; }.chat-generated-image>a:first-child { display: block; }.chat-generated-image img { width: 100%; aspect-ratio: 1; display: block; object-fit: cover; border: 1px solid var(--line); border-radius: 10px; }.chat-image-download { position: absolute; right: 9px; bottom: 9px; width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid rgba(52,49,39,.1); border-radius: 8px; background: rgba(255,255,255,.9); color: #3c4139; box-shadow: 0 7px 18px rgba(30,28,20,.14); backdrop-filter: blur(8px); text-decoration: none; transition: transform .16s ease,background .16s ease,color .16s ease; }.chat-image-download:hover { transform: translateY(-1px); background: #fff; color: #1f6049; }.dark .chat-image-download { border-color: rgba(255,255,255,.1); background: rgba(34,37,32,.88); color: #ddd8ca; }
.dark .chat-message--assistant .chat-message__avatar { border-color: rgba(255,255,255,.09); background: rgba(255,255,255,.06); }
.dark .chat-response-references>a,.dark .chat-response-references>span { border-color: rgba(255,255,255,.08); background: rgba(255,255,255,.035); color: #aaa697; }

.chat-markdown :deep(h1),.chat-markdown :deep(h2),.chat-markdown :deep(h3),.chat-markdown :deep(h4) { margin: 1.3em 0 .55em; color: #26271f; font-weight: 740; line-height: 1.3; }
.chat-markdown :deep(h1) { font-size: 1.55em; }.chat-markdown :deep(h2) { font-size: 1.35em; }.chat-markdown :deep(h3) { font-size: 1.18em; }
.chat-markdown :deep(blockquote) { margin: 14px 0; padding: 7px 14px; border-left: 3px solid rgba(31,96,73,.3); background: rgba(239,242,229,.5); color: #666358; }
.chat-markdown :deep(table) { width: 100%; margin: 14px 0; border-collapse: separate; border-spacing: 0; overflow: hidden; border: 1px solid rgba(52,49,39,.1); border-radius: 8px; font-size: 13px; }
.chat-markdown :deep(th),.chat-markdown :deep(td) { padding: 9px 11px; border-right: 1px solid rgba(52,49,39,.08); border-bottom: 1px solid rgba(52,49,39,.08); text-align: left; }
.chat-markdown :deep(th) { background: rgba(244,240,224,.7); font-weight: 720; }.chat-markdown :deep(tr:last-child td) { border-bottom: 0; }.chat-markdown :deep(th:last-child),.chat-markdown :deep(td:last-child) { border-right: 0; }
.chat-markdown :deep(hr) { margin: 20px 0; border: 0; border-top: 1px solid rgba(52,49,39,.1); }
.chat-markdown :deep(img) { max-width: 100%; height: auto; border-radius: 8px; }
.chat-markdown :deep(.chat-code-block) { overflow:hidden; margin:14px 0; border:1px solid rgba(52,49,39,.1); border-radius:9px; background:#f6f8fa; }
.chat-markdown :deep(.chat-code-toolbar) { height:34px; display:flex; align-items:center; justify-content:space-between; padding:0 8px 0 12px; border-bottom:1px solid rgba(52,49,39,.08); background:#f1f3f1; color:#777368; font:10px/1.2 ui-monospace,monospace; text-transform:lowercase; }
.chat-markdown :deep(.chat-code-toolbar button) { height:25px; padding:0 7px; border:0; border-radius:6px; background:transparent; color:#68655d; font:10px/1 inherit; }
.chat-markdown :deep(.chat-code-toolbar button:hover) { background:#fff; color:#1f6049; }
.chat-markdown :deep(.chat-code-block pre) { margin:0; border-radius:0; background:transparent!important; }
.chat-markdown :deep(.chat-code-block code) { display:block; min-width:max-content; }
.dark .chat-markdown :deep(.chat-code-block) { border-color:rgba(255,255,255,.09); background:#1f2321; }
.dark .chat-markdown :deep(.chat-code-toolbar) { border-color:rgba(255,255,255,.08); background:#252a27; color:#aaa697; }
.dark .chat-markdown :deep(.chat-code-toolbar button:hover) { background:rgba(255,255,255,.06); color:#9ac5ae; }
.chat-markdown :deep(input[type='checkbox']) { margin-right: 7px; accent-color: #1f6049; }
.dark .chat-markdown :deep(h1),.dark .chat-markdown :deep(h2),.dark .chat-markdown :deep(h3),.dark .chat-markdown :deep(h4) { color: #eeeadd; }
.dark .chat-markdown :deep(table),.dark .chat-markdown :deep(th),.dark .chat-markdown :deep(td) { border-color: rgba(255,255,255,.08); }.dark .chat-markdown :deep(th) { background: rgba(255,255,255,.04); }

@keyframes chat-arrive { from { opacity: 0; transform: translate3d(var(--chat-arrive-x,0),10px,0) scale(.992); } to { opacity: 1; transform: translate3d(0,0,0) scale(1); } }
@keyframes chat-stream-reveal { from { opacity: .58; } to { opacity: 1; } }
@keyframes model-menu-in { from { opacity: 0; transform: translateY(-5px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes context-panel-in { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
@keyframes welcome-enter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes composer-enter { from { opacity: 0; transform: translate(-50%,14px) scale(.99); } to { opacity: 1; transform: translate(-50%,0) scale(1); } }
@keyframes prompt-enter { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
@keyframes assistant-breathe { 0%,100% { box-shadow: 0 0 0 0 rgba(31,96,73,0); } 50% { box-shadow: 0 0 0 5px rgba(31,96,73,.09); } }
@keyframes send-ready { from { opacity: .65; transform: scale(.88); } to { opacity: 1; transform: scale(1); } }
@keyframes reasoning-reveal { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes reasoning-panel-open { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
@keyframes chat-reasoning-dot { 0%,60%,100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-2px); } }
@keyframes chat-output-dot { 0%,65%,100% { opacity: .22; transform: scale(.75); } 32% { opacity: 1; transform: scale(1); } }
@keyframes thinking-title-shimmer { 0%,100% { color: #77756c; } 50% { color: #2f7257; } }
@keyframes thinking-sheen { 0%,18% { opacity: 0; transform: translateX(-10px) skewX(-12deg); } 45% { opacity: .9; } 72%,100% { opacity: 0; transform: translateX(90px) skewX(-12deg); } }
@keyframes composer-enter-mobile { from { opacity: 0; transform: translateY(12px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }

@media (max-width: 900px) {
  .chat-workspace { width: 100%; height: 100dvh; min-height: 0; margin: 0; grid-template-columns: minmax(0,1fr); }
  .chat-main { width: 100%; min-width: 0; min-height: 0; grid-column: 1; }
  .chat-history { width: min(320px, 88vw); }
  .chat-context-panel { position: fixed; width: 100%; }
  .chat-topbar { min-height: 116px; padding: 12px 14px; }
  .chat-config select { background: rgba(247, 241, 220, .55); }
  .chat-model-picker { min-width: 0; flex: 1; align-items: flex-start; flex-direction: column; gap: 3px; }
  .chat-model-trigger { width: 100%; height: 46px; }
  .chat-model-menu { position: fixed; top: 126px; right: 12px; left: 12px; width: auto; max-width: none; }
  .chat-model-option { grid-template-columns: 34px minmax(0,1fr) 16px; }
  .chat-model-option__price { grid-column: 2; text-align: left; white-space: normal; }
  .chat-messages { padding: 0 14px; }
  .chat-main--empty .chat-composer-wrap { top: auto; bottom: 0; width: calc(100% - 24px); padding: 10px 0 12px; background: #fffdf8; }
  .chat-tool-menu { position: fixed; right: 12px; bottom: 72px; left: 12px; width: auto; }
  .chat-reasoning-level select { max-width: 76px; }
  .chat-main--empty.chat-main--image .chat-composer-wrap { top: auto; width: calc(100% - 16px); }
  .chat-image-controls { grid-template-columns: repeat(2,minmax(0,1fr)); max-height: 40vh; overflow-y: auto; }
  .chat-image-field--model,.chat-aspect-field { grid-column: 1 / -1; }
  .chat-aspect-field { align-items: center; flex-wrap: wrap; }
  .chat-aspect-field legend { width: 100%; }
  .chat-main--empty .chat-welcome { justify-content: center; padding: 20px 0 calc(var(--chat-composer-height, 180px) + 24px); }
  .chat-welcome h1 { font-size: 23px; }
  .chat-welcome p { margin-top: 18px; }
  .chat-prompts { display: none; }
  .chat-message { padding: 18px 0; }
  .chat-message--user .chat-message__content { max-width: 88%; }
  .dark .chat-main--empty .chat-composer-wrap { background: #1c1f1b; }
}

@media (max-width: 640px) {
  .chat-workspace { width: 100%; height: 100dvh; min-height: 0; margin: 0; grid-template-columns: minmax(0,1fr); background: #fffdf8; }
  .chat-main { width: 100%; height: 100dvh; min-height: 0; grid-column: 1; }
  .chat-topbar { min-height: 64px; height: 64px; align-items: center; flex-direction: row; gap: 8px; padding: 8px 10px; border-bottom: 1px solid rgba(52,49,39,.07); background: rgba(255,253,248,.94); backdrop-filter: blur(16px); }
  .chat-topbar__title { min-width: 0; flex: 1; gap: 7px; }
  .chat-topbar__title > div { min-width: 0; width: 100%; }
  .chat-topbar__title strong { width: 100%; max-width: 150px; font-size: 13px; }
  .chat-topbar__title span { width: 100%; max-width: 150px; overflow: hidden; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
  .chat-menu-button { width: 40px; height: 40px; flex: 0 0 auto; border: 0; background: rgba(247,241,220,.65); }
  .chat-config { width: auto; min-width: 0; flex: 0 0 auto; }
  .chat-group-trigger { width: 40px; flex: 0 0 40px; justify-content: center; padding: 0; }
  .chat-group-trigger span { display: none; }
  .chat-config > label { display: none; }
  .chat-model-picker { width: clamp(118px,40vw,150px); flex: 0 0 auto; display: block; }
  .chat-model-picker__label { display: none; }
  .chat-model-trigger { width: 100%; height: 42px; gap: 7px; padding: 5px 8px; border-color: rgba(52,49,39,.08); background: rgba(247,241,220,.55); }
  .chat-model-trigger__copy strong { font-size: 10px; }
  .chat-model-trigger__copy small { display: none; }
  .chat-model-menu { top: auto; right: 0; bottom: 0; left: 0; width: 100%; max-width: none; max-height: 78dvh; padding: 8px 8px calc(10px + env(safe-area-inset-bottom)); border: 0; border-radius: 15px 15px 0 0; box-shadow: 0 -18px 50px rgba(32,30,23,.2); }
  .chat-model-search { position: sticky; z-index: 2; top: 0; height: 48px; background: inherit; }
  .chat-model-options { max-height: calc(78dvh - 62px); }
  .chat-model-option { min-height: 62px; grid-template-columns: 38px minmax(0,1fr) 18px; padding: 9px; }
  .chat-model-option__icon { width: 36px; height: 36px; }
  .chat-model-option__copy strong { font-size: 13px; }
  .chat-model-option__copy small { font-size: 10px; }
  .chat-model-option__price { grid-column: 2; font-size: 10px; text-align: left; white-space: normal; }

  .chat-history { width: min(340px,92vw); padding-top: env(safe-area-inset-top); }
  .chat-history__header { padding: 12px 14px 8px; }
  .chat-new { font-size: 15px; }
  .chat-history-search { margin: 0 14px 10px; }
  .chat-context-shortcuts { padding: 0 14px 10px; }
  .chat-context-shortcuts button { height: 44px; font-size: 11px; }
  .chat-history-item { padding: 12px 10px; }

  .chat-messages { padding: 0 10px; }
  .chat-message { gap: 9px; padding: 16px 0; }
  .chat-message__avatar { width: 28px; height: 28px; border-radius: 7px; }
  .chat-message__content { padding-top: 2px; font-size: 14px; line-height: 1.65; }
  .chat-message--user .chat-message__avatar { display: none; }
  .chat-message--user .chat-message__content { max-width: 90%; padding: 10px 12px; border-radius: 13px 13px 4px 13px; }
  .chat-message__images { grid-template-columns: 1fr; }
  .chat-markdown :deep(pre) { max-width: calc(100vw - 58px); font-size: 11px; }
  .chat-markdown :deep(table) { display: block; overflow-x: auto; white-space: nowrap; }
  .chat-reasoning-panel summary { min-height: 38px; font-size: 11px; }

  .chat-main--empty .chat-welcome { width: calc(100% - 28px); padding: 24px 0 calc(var(--chat-composer-height, 190px) + 24px); box-sizing: border-box; }
  .chat-welcome h1 { font-size: 24px; line-height: 1.3; }
  .chat-welcome p { max-width: 290px; margin-top: 14px; font-size: 13px; line-height: 1.55; }
  .chat-main--empty .chat-composer-wrap,.chat-main--empty.chat-main--image .chat-composer-wrap { right: 6px; bottom: 0; left: 6px; width: auto; padding: 0; transform: none; background: transparent; }
  .chat-main--empty .chat-composer-wrap { animation-name: composer-enter-mobile; }
  .chat-main--empty .chat-composer { border-radius: 14px 14px 0 0; box-shadow: 0 -10px 34px rgba(54,48,30,.1); }
  .chat-composer-wrap { padding-bottom: env(safe-area-inset-bottom); background: #fff; }
  .chat-composer { border-radius: 14px 14px 0 0; }
  .chat-composer-modes { padding: 7px 8px 0; }
  .chat-composer-modes button { height: 34px; font-size: 11px; }
  .chat-composer textarea,.chat-main--empty .chat-composer textarea { min-height: 48px; max-height: 120px; padding: 11px 13px 3px; font-size: 16px; }
  .chat-composer__tools { min-height: 48px; padding: 5px 9px 8px; }
  .chat-tool { min-width: 36px; height: 36px; justify-content: center; padding: 0 8px; }
  .chat-tool span { display: none; }
  .chat-workspace-chip { max-width: 90px; overflow: hidden; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
  .chat-reasoning-level { height: 36px; padding: 0 4px; }
  .chat-reasoning-level select { width: 66px; max-width: 66px; font-size: 10px; }
  .chat-send { width: 38px; height: 38px; }
  .chat-composer-note { display: none; }
  .chat-usage-strip { min-height:26px; justify-content:flex-start; overflow-x:auto; padding:3px 9px 4px; scrollbar-width:none; }
  .chat-usage-strip>i { width:42px; flex:0 0 42px; }
  .chat-message-actions { opacity:1; transform:none; }
  .chat-attachments { padding: 7px 8px 0; }
  .chat-attachment { min-width: 155px; }
  .chat-tool-menu { right: 0; bottom: 0; left: 0; width: 100%; padding: 9px 9px calc(10px + env(safe-area-inset-bottom)); border: 0; border-radius: 15px 15px 0 0; box-shadow: 0 -18px 50px rgba(32,30,23,.2); }
  .chat-tool-menu > button { min-height: 58px; }
  .chat-tool-menu strong { font-size: 13px; }
  .chat-tool-menu small { font-size: 10px; }

  .chat-composer--image { max-height: calc(100dvh - 72px); overflow-y: auto; overscroll-behavior: contain; }
  .chat-image-controls { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; max-height: none; padding: 10px; }
  .chat-image-field--model,.chat-aspect-field { grid-column: 1 / -1; }
  .chat-image-field select { height: 42px; font-size: 12px; }
  .chat-aspect-field { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 5px; }
  .chat-aspect-field legend { grid-column: 1 / -1; width: 100%; }
  .chat-aspect-field button { width: 100%; height: 48px; padding: 0; }
  .chat-aspect-field button i { width: 17px; max-height: 20px; }
  .chat-composer--image textarea { min-height: 62px; }

  .chat-context-panel { inset: 0; width: 100%; padding-top: env(safe-area-inset-top); border: 0; box-shadow: none; }
  .chat-context-panel > header { position: sticky; z-index: 3; top: 0; min-height: 58px; padding: 0 14px; background: rgba(255,254,248,.96); backdrop-filter: blur(16px); }
  .chat-context-panel__intro { padding: 14px 14px 8px; font-size: 13px; }
  .chat-knowledge-upload,.chat-knowledge-note,.chat-memory-toggle,.chat-memory-editor { margin-right: 14px; margin-left: 14px; }
  .chat-knowledge-upload { min-height: 72px; }
  .chat-knowledge-item { min-height: 64px; }
  .chat-memory-editor textarea { min-height: 45dvh; font-size: 14px; }

  .dark .chat-topbar { background: rgba(28,31,27,.94); }
  .dark .chat-composer-wrap { background: #222520; }
  .dark .chat-context-panel > header { background: rgba(29,32,28,.96); }
}

@media (prefers-reduced-motion: reduce) { .chat-message,.chat-message--pending .chat-message__avatar,.chat-markdown--streaming,.chat-send:not(:disabled),.chat-main--empty .chat-composer-wrap,.chat-main--empty .chat-welcome h1,.chat-main--empty .chat-welcome p,.chat-main--empty .chat-prompts button,.chat-reasoning-status i,.chat-reasoning-body,.chat-reasoning-title--active,.chat-reasoning-title--active::after,.chat-output-loading i { animation: none; } }
</style>
