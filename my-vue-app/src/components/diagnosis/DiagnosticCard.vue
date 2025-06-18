<template>
  <div class="diagnostic-card border rounded-lg shadow mb-6 bg-white">
    <header class="bg-gray-100 px-4 py-3 border-b rounded-t-lg flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-700">{{ title }}</h2>
      <span v-if="statusIcon" class="text-2xl">{{ statusIcon }}</span>
    </header>
    <div class="p-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ParameterStatus } from '../../composables/useSep7Diagnoser'; // For status prop

const props = defineProps<{
  title: string;
  status?: ParameterStatus | boolean | null; // Can be overall status for the card
}>();

const statusIcon = computed(() H {
  if (typeof props.status === 'boolean') {
    return props.status ? '✅' : '❌';
  }
  switch (props.status) {
    case ParameterStatus.Valid: return '✅';
    case ParameterStatus.Invalid: return '❌';
    case ParameterStatus.Warning: return '⚠️';
    case ParameterStatus.Info: return 'ℹ️';
    default: return '';
  }
});
</script>

<style scoped>
/* Styles for DiagnosticCard */
</style>
