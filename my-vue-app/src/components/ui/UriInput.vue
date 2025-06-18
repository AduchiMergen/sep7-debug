<template>
  <div class="uri-input p-4 border rounded shadow-sm bg-white">
    <h2 class="text-xl font-semibold mb-3">Enter SEP-7 URI</h2>
    <textarea
      v-model="uri"
      placeholder="web+stellar:tx?XDR=...&origin_domain=..."
      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="4"
    ></textarea>
    <button
      @click="submitUri"
      class="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
    >
      Analyze URI
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const uri = ref('');
const emit = defineEmits(['uri-pasted']);

const submitUri = () => {
  if (uri.value.trim()) {
    emit('uri-pasted', uri.value.trim());
  }
};
</script>

<style scoped>
/* Add any specific styles for UriInput if needed */
.uri-input {
  /* Example: */
  /* background-color: #f9f9f9; */
}
</style>
