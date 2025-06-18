<template>
  <div class="params-table">
    <div v-if="!parameters || parameters.details.length === 0">
      <p class="text-gray-500">No parameters found or analyzed.</p>
      return;
    </div>
    <ul class="space-y-4">
      <li v-for="param in parameters.details" :key="param.name" class="p-3 border rounded-md bg-gray-50 hover:shadow-sm">
        <div class="flex items-center mb-1">
          <span class="text-2xl mr-2">{{ param.status }}</span>
          <strong class="font-mono text-blue-600">{{ param.name }}</strong>
        </div>
        <div class="ml-8">
          <p class="text-sm text-gray-700 break-all">
            <span class="font-semibold">Value:</span> <code class="bg-gray-200 px-1 rounded">{{ param.value || '(empty)' }}</code>
          </p>
          <p v-if="param.message" :class="['text-xs mt-1', getMessageClass(param.status)]">
            {{ param.message }}
          </p>

          <!-- Embed XdrDetails for 'xdr' parameter -->
          <div v-if="param.name === 'xdr' && param.status === ParameterStatus.Valid && xdrData">
            <h4 class="mt-3 mb-1 text-md font-semibold text-gray-700">XDR Details:</h4>
            <XdrDetails :xdr-details="xdrData" />
          </div>

          <!-- Embed ReplaceInfo for 'replace' parameter -->
          <div v-if="param.name === 'replace' && param.status === ParameterStatus.Valid && replaceData">
             <h4 class="mt-3 mb-1 text-md font-semibold text-gray-700">Replace Instructions:</h4>
            <ReplaceInfo :replace-data="replaceData" />
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ParametersAnalysis, ParameterStatus as ParamStatusType, XdrDetailsData, ReplaceInstructionData } from '../../composables/useSep7Diagnoser';
import XdrDetails from '../widgets/XdrDetails.vue';
import ReplaceInfo from '../widgets/ReplaceInfo.vue';

// Re-exporting ParameterStatus for template usage
const ParameterStatus = ParamStatusType;

const props = defineProps<{
  parameters: ParametersAnalysis | null | undefined;
  // Pass the full report data or specific parts needed for widgets
  xdrData?: XdrDetailsData | null | undefined;
  replaceData?: ReplaceInstructionData | null | undefined;
}>();

const getMessageClass = (status: ParamStatusType) => {
  switch (status) {
    case ParameterStatus.Invalid: return 'text-red-600';
    case ParameterStatus.Warning: return 'text-yellow-700';
    case ParameterStatus.Info: return 'text-blue-600';
    case ParameterStatus.Valid: return 'text-green-600';
    default: return 'text-gray-600';
  }
};
</script>

<style scoped>
/* Styles for ParamsTable */
code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  word-break: break-all;
}
</style>
