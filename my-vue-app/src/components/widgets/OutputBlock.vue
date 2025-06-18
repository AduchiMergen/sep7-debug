<template>
  <div class="output-block p-4 border rounded bg-gray-50">
    <h3 class="text-lg font-semibold mb-2">{{ title }}</h3>
    <pre class="whitespace-pre-wrap break-all bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">{{ content }}</pre>
    <button
      @click="copyToClipboard"
      class="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
      :disabled="!canCopy || justCopied"
    >
      {{ justCopied ? 'Copied!' : 'Copy to Clipboard' }}
    </button>
    <p v-if="copyError" class="text-red-500 text-xs mt-1">{{ copyError }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  content: string | null | undefined;
  title: string;
}>();

const justCopied = ref(false);
const copyError = ref<string | null>(null);

const canCopy = computed(() => !!props.content && typeof navigator !== 'undefined' && !!navigator.clipboard);

const copyToClipboard = async () => {
  if (!props.content || !canCopy.value) return;

  try {
    await navigator.clipboard.writeText(props.content);
    justCopied.value = true;
    copyError.value = null;
    setTimeout(() => {
      justCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    copyError.value = 'Failed to copy to clipboard.';
  }
};
</script>

<style scoped>
/* Styles for OutputBlock */
pre {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}
</style>
