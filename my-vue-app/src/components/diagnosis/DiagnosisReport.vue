<template>
  <div class="diagnosis-report">
    <h1 class="text-2xl font-bold mb-2">SEP-7 URI Diagnosis Report</h1>
    <p class="text-sm text-gray-600 mb-1"><strong>URI:</strong> <code class="break-all">{{ reportData.uri }}</code></p>
    <p class="text-sm text-gray-500 mb-6"><strong>Analyzed on:</strong> {{ new Date(reportData.timestamp).toLocaleString() }}</p>

    <!-- Syntax Analysis Card -->
    <DiagnosticCard title="Syntax Analysis" :status="reportData.syntax?.isValid">
      <div v-if="reportData.syntax">
        <p><strong>Scheme:</strong> {{ reportData.syntax.scheme || 'N/A' }}</p>
        <p><strong>Operation:</strong> {{ reportData.syntax.operation || 'N/A' }}</p>
        <div v-if="!reportData.syntax.isValid && reportData.syntax.errors.length > 0">
          <h4 class="font-semibold text-red-600 mt-2">Errors:</h4>
          <ul class="list-disc list-inside ml-4 text-red-500">
            <li v-for="(err, i) in reportData.syntax.errors" :key="i">{{ err.message }}</li>
          </ul>
        </div>
        <p v-else-if="reportData.syntax.isValid" class="text-green-600 mt-2">Syntax is valid.</p>
      </div>
      <p v-else class="text-gray-500">No syntax analysis data.</p>
    </DiagnosticCard>

    <!-- Parameters Analysis Card -->
    <DiagnosticCard title="Parameters Analysis" v-if="reportData.parameters && reportData.syntax?.isValid">
      <ParamsTable
        :parameters="reportData.parameters"
        :xdr-data="reportData.xdrDetails"
        :replace-data="reportData.replaceDetails"
      />
    </DiagnosticCard>
    <DiagnosticCard title="Parameters Analysis" v-else-if="!reportData.syntax?.isValid">
       <p class="text-gray-500">Skipped due to invalid URI syntax.</p>
    </DiagnosticCard>


    <!-- Security Analysis Card -->
    <DiagnosticCard title="Security Analysis" :status="reportData.security?.summary" v-if="reportData.security && reportData.syntax?.isValid">
        <div class="space-y-2">
            <p><strong>Origin Domain:</strong>
                <span v-if="reportData.security.originDomain?.value">{{ reportData.security.originDomain.value }}</span>
                <span v-else class="text-gray-500">Not Provided</span>
                <span v-if="reportData.security.originDomain?.value" :class="['ml-2 text-xs', reportData.security.originDomain.isValid ? 'text-green-600' : 'text-red-600']">
                    ({{ reportData.security.originDomain.message || (reportData.security.originDomain.isValid ? 'Format OK' : 'Format Issue') }})
                </span>
            </p>
            <p><strong>Signature:</strong>
                <span v-if="reportData.security.signature?.value" class="truncate inline-block max-w-md">{{ reportData.security.signature.value }}</span>
                <span v-else class="text-gray-500">Not Provided</span>
                 <span v-if="reportData.security.signature?.value" :class="['ml-2 text-xs', reportData.security.signature.isValid ? 'text-green-600' : 'text-yellow-600']">
                    ({{ reportData.security.signature.message || (reportData.security.signature.isValid ? 'Valid (Mock)' : 'Validation Pending') }})
                </span>
            </p>
            <div v-if="reportData.security.messages && reportData.security.messages.length > 0">
                <h4 class="font-semibold text-yellow-700 mt-2">Security Notes:</h4>
                <ul class="list-disc list-inside ml-4 text-yellow-600">
                    <li v-for="(msg, i) in reportData.security.messages" :key="i">{{ msg.message }}</li>
                </ul>
            </div>
            <p class="mt-2"><strong>Overall Security Assessment:</strong> <span :class="getMessageClass(reportData.security.summary)">{{ reportData.security.summary }}</span></p>
        </div>
    </DiagnosticCard>
     <DiagnosticCard title="Security Analysis" v-else-if="!reportData.syntax?.isValid">
       <p class="text-gray-500">Skipped due to invalid URI syntax.</p>
    </DiagnosticCard>

  </div>
</template>

<script setup lang="ts">
import type { DiagnosisReportData, ParameterStatus } from '../../composables/useSep7Diagnoser';
import DiagnosticCard from './DiagnosticCard.vue';
import ParamsTable from './ParamsTable.vue';

const props = defineProps<{
  reportData: DiagnosisReportData;
}>();

const getMessageClass = (status: ParameterStatus | null | undefined) => {
  if (!status) return 'text-gray-600';
  switch (status) {
    case ParameterStatus.Invalid: return 'text-red-600 font-semibold';
    case ParameterStatus.Warning: return 'text-yellow-700 font-semibold';
    case ParameterStatus.Info: return 'text-blue-600';
    case ParameterStatus.Valid: return 'text-green-600 font-semibold';
    default: return 'text-gray-600';
  }
};
</script>

<style scoped>
/* Styles for DiagnosisReport */
code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  background-color: #f3f4f6; /* Tailwind gray-100 */
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
}
</style>
