<template>
  <div
    id="app"
    class="container mx-auto p-4"
  >
    <TheHeader />

    <main class="mt-8">
      <div v-if="!diagnosisResult">
        <UriInput @uri-pasted="handleUriPasted" />
        <ExampleGallery
          @use-example="handleUseExample"
          class="mt-8"
        />
      </div>
      <div v-else>
        <DiagnosisReport :report-data="diagnosisResult" />
        <button
          @click="resetDiagnosis"
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Analyze Another URI
        </button>
      </div>
    </main>

    <TheFooter class="mt-12" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Import components
import TheHeader from './components/TheHeader.vue';
import TheFooter from './components/TheFooter.vue';
import UriInput from './components/ui/UriInput.vue';
import ExampleGallery from './components/ui/ExampleGallery.vue';
import DiagnosisReport from './components/diagnosis/DiagnosisReport.vue';

// Define the type for DiagnosisReportData (placeholder)
// This will eventually be imported from or defined by useSep7Diagnoser.ts
interface DiagnosisReportData {
  // Define structure based on useSep7Diagnoser.ts output later
  // For now, an empty interface or a simple structure suffices
  uri: string;
  syntax?: { valid: boolean; errors: string[] };
  // ... other fields
}

const diagnosisResult = ref<DiagnosisReportData | null>(null);

// FR1: Handles URI pasted from UriInput component
const handleUriPasted = (uri: string) => {
  console.log('URI pasted:', uri);
  // Here, we will eventually call useSep7Diagnoser
  // For now, let's simulate a diagnosis result for display purposes
  // This will be replaced by actual logic from useSep7Diagnoser.ts
  if (uri) {
    diagnosisResult.value = { uri: uri, syntax: { valid: true, errors: [] } }; // Placeholder
  }
};

// Handles example selection from ExampleGallery component
const handleUseExample = (exampleUri: string) => {
  console.log('Example URI selected:', exampleUri);
  // Similar to handleUriPasted, this will use useSep7Diagnoser
  if (exampleUri) {
    diagnosisResult.value = { uri: exampleUri, syntax: { valid: false, errors: ['Simulated error for example'] } }; // Placeholder
  }
};

const resetDiagnosis = () => {
  diagnosisResult.value = null;
};

// FR5.3: Support for diagnosis via URL parameter
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const uriFromQuery = urlParams.get('uri');
  if (uriFromQuery) {
    console.log('URI from query param:', uriFromQuery);
    // This will also eventually call useSep7Diagnoser
    diagnosisResult.value = { uri: uriFromQuery, syntax: { valid: true, errors: [] } }; // Placeholder
  }
});

</script>

<style>
/* Basic styling to ensure layout is somewhat reasonable.
   TailwindCSS is expected to be set up (as per initial ls showing tailwind.config.js)
   If not, these might not apply directly without further setup.
*/
body {
  font-family: sans-serif;
  background-color: #f4f7f6;
}

#app {
  max-width: 900px;
}
</style>
