<template>
  <div class="replace-info p-4 border rounded bg-gray-50">
    <h3 class="text-lg font-semibold mb-3">
      Replace Instructions
    </h3>
    <div v-if="!replaceData || !replaceData.fields || replaceData.fields.length === 0">
      <p
        v-if="replaceData && replaceData.errors && replaceData.errors.length > 0"
        class="text-orange-600"
      >
        {{ replaceData.errors[0].message }}
      </p>
      <p
        v-else
        class="text-gray-500"
      >
        No 'replace' instructions provided or parsed.
      </p>
    </div>
    <div v-else>
      <ul class="space-y-2">
        <li
          v-for="(item, index) in replaceData.fields"
          :key="index"
          class="p-2 border-b border-gray-200"
        >
          <div class="font-mono text-sm">
            <strong class="text-blue-600">Path:</strong> {{ item.field }}
          </div>
          <div class="font-mono text-sm mt-1">
            <strong class="text-green-600">Value:</strong> <span class="text-gray-700">"{{ item.value }}"</span>
          </div>
          <p
            v-if="item.hint"
            class="text-xs text-gray-500 mt-1"
          >
            <em>Hint: {{ item.hint }}</em>
          </p>
        </li>
      </ul>
      <div
        v-if="!replaceData.isValid && replaceData.errors && replaceData.errors.length > 0"
        class="mt-3"
      >
        <p class="text-red-500 font-semibold">
          Parsing Issues:
        </p>
        <ul class="list-disc list-inside ml-4">
          <li
            v-for="(err, i) in replaceData.errors"
            :key="i"
            class="text-red-500 text-sm"
          >
            {{ err.message }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ReplaceInstructionData } from '../../composables/useSep7Diagnoser'; // Assuming type export

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  replaceData: ReplaceInstructionData | null | undefined;
}>();
</script>

<style scoped>
/* Styles for ReplaceInfo */
</style>
