<template>
  <div class="tabbed-viewer">
    <div class="tabs border-b">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        @click="activeTab = index"
        :class="[
          'px-4 py-2 focus:outline-none',
          activeTab === index ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        {{ tab.title }}
      </button>
    </div>
    <div class="tab-content p-4">
      <slot :name="tabs[activeTab]?.slotName || 'default'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Tab {
  title: string;
  slotName?: string; // Optional: if you want to name slots specifically
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  tabs: Tab[];
}>();

const activeTab = ref(0);

// The slots object from useSlots() is not explicitly used in the script or template.
// Vue's <slot> tag handles slot rendering automatically.
// The slot to render is determined directly in the template like:
// <slot :name="tabs[activeTab]?.slotName || 'default'" />

</script>

<style scoped>
.tabs button {
  transition: color 0.2s, border-color 0.2s;
}
</style>
