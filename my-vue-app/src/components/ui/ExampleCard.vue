<template>
  <div class="example-card p-3 border rounded shadow-sm bg-gray-50 hover:shadow-md transition-shadow">
    <p class="text-sm text-gray-700 mb-2 truncate" :title="uri">{{ name }}</p>
    <p class="text-xs text-gray-500 mb-2 truncate" :title="uri">{{ uri }}</p>
    <button
      @click="useExample"
      class="px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-700"
    >
      Use Example
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string;
  uri: string;
}>();

const emit = defineEmits(['use-example']);

const useExample = () => {
  emit('use-example', props.uri);
};
</script>

<style scoped>
/* Add any specific styles for ExampleCard if needed */
.example-card {
  /* Example: */
  /* min-width: 150px; */
}
</style>
