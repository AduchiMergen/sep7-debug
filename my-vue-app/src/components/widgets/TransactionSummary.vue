<template>
  <div class="transaction-summary p-1">
    <div v-if="!summaryData || Object.keys(summaryData).length === 0">
      <p class="text-gray-500">No summary data available.</p>
    </div>
    <div v-else-if="summaryData.error">
        <p class="text-red-500 font-semibold">Error in XDR Data:</p>
        <p class="text-red-400">{{ summaryData.error }}</p>
    </div>
    <div v-else class="space-y-3">
      <div v-for="(value, key) in summaryData" :key="key" class="summary-item">
        <strong class="capitalize text-gray-700">{{ formatKey(key) }}:</strong>
        <template v-if="key === 'operations' && Array.isArray(value)">
          <ul class="list-disc list-inside ml-4 mt-1 space-y-1">
            <li v-for="(op, index) in value" :key="index" class="text-sm text-gray-600">{{ op }}</li>
          </ul>
        </template>
        <template v-else>
          <span class="text-sm text-gray-800 ml-2">{{ value }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SummaryData {
  error?: string;
  source?: string;
  fee?: number | string;
  sequence?: string;
  memo?: string;
  operationCount?: number;
  operations?: string[];
  network?: string;
  [key: string]: any; // Allow other properties
}

const props = defineProps<{
  summaryData: SummaryData | null | undefined;
}>();

const formatKey = (key: string) => {
  return key.replace(/([A-Z])/g, ' \$1').replace(/^./, (str) => str.toUpperCase());
};
</script>

<style scoped>
.summary-item {
  /* border-bottom: 1px dashed #eee; */
  /* padding-bottom: 0.5rem; */
}
.summary-item:last-child {
  border-bottom: none;
}
</style>
