<template>
  <div class="xdr-details">
    <TabbedViewer :tabs="tabs">
      <template #summary>
        <TransactionSummary :summary-data="xdrDetails?.summary" />
      </template>
      <template #txrep>
        <OutputBlock title="TxRep (Conceptual)" :content="xdrDetails?.txrep" />
      </template>
      <template #json>
        <OutputBlock title="JSON Representation of XDR" :content="xdrDetails?.json" />
      </template>
      <template #base64>
        <OutputBlock title="Base64 XDR" :content="xdrDetails?.base64" />
      </template>
    </TabbedViewer>
  </div>
</template>

<script setup lang="ts">
import TabbedViewer from '../ui/TabbedViewer.vue';
import TransactionSummary from './TransactionSummary.vue';
import OutputBlock from './OutputBlock.vue';
import type { XdrDetailsData } from '../../composables/useSep7Diagnoser'; // Assuming type export

const props = defineProps<{
  xdrDetails: XdrDetailsData | null | undefined;
}>();

const tabs = [
  { title: 'Summary', slotName: 'summary' }, // FR3.2
  { title: 'TxRep', slotName: 'txrep' },     // FR3.3 (Placeholder)
  { title: 'JSON', slotName: 'json' },       // FR3.4
  { title: 'Base64 XDR', slotName: 'base64' } // FR3.5
];
</script>

<style scoped>
/* Styles for XdrDetails */
</style>
