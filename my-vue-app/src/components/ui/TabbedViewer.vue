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
      <slot :name="tabs[activeTab]?.slotName || 'default'"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useSlots, computed } from 'vue';

interface Tab {
  title: string;
  slotName?: string; // Optional: if you want to name slots specifically
}

const props = defineProps<{
  tabs: Tab[];
}>();

const activeTab = ref(0);
const slots = useSlots();

// This computed property helps determine which slot to render.
// It's a basic way; more complex logic might be needed if slots are dynamic or have specific naming patterns.
const currentSlotName = computed(() => {
  const currentTab = props.tabs[activeTab.value];
  if (currentTab && currentTab.slotName && slots[currentTab.slotName]) {
    return currentTab.slotName;
  }
  // Fallback or default slot name if needed
  return 'default'; // Or handle error/default content
});

</script>

<style scoped>
.tabs button {
  transition: color 0.2s, border-color 0.2s;
}
</style>
