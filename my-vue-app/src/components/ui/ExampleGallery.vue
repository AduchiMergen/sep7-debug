<template>
  <div class="example-gallery p-4 border rounded shadow-sm bg-white">
    <h2 class="text-xl font-semibold mb-3">
      Or Try an Example
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ExampleCard
        v-for="example in examples"
        :key="example.name"
        :name="example.name"
        :uri="example.uri"
        @use-example="handleUseExample"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ExampleCard from './ExampleCard.vue';

// Define the type for an example
interface Example {
  name: string;
  uri: string;
}

// FR5.1: Набор готовых примеров SEP-7 URI.
const examples = ref<Example[]>([
  {
    name: 'Simple TX',
    uri: 'web+stellar:tx?xdr=AAAAAgAAAADLpZ3uGZ3xZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ0AAAABAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAADLpZ3uGZ3xZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ0AAAABAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAAA&origin_domain=example.com'
  },
  {
    name: 'Pay Operation',
    uri: 'web+stellar:pay?destination=GCALN3MYZSXASG2K2SQLP5P2BXP5NHY2HMYW22LOB2EOMFX4KUYHDJ2N&amount=100.5&asset_code=USD&asset_issuer=GDSTRSHXHGJ73GUPXUZAEVWXOO2WM4K3N2K2BGLCCIZC4T6G3G52DXNN&origin_domain=example.com'
  },
  {
    name: 'TX with Memo',
    uri: 'web+stellar:tx?xdr=AAAAAgAAAADLpZ3uGZ3xZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ0AAAABAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAADLpZ3uGZ3xZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ3X4XZ0AAAABAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAAAMAAAAY29uZ3JhdHVsYXRpb25zITEAAAA&origin_domain=example.com&signature=base64_encoded_signature_here'
  },
  // Add more examples as needed
]);

const emit = defineEmits(['use-example']);

const handleUseExample = (uri: string) => {
  emit('use-example', uri);
};
</script>

<style scoped>
/* Add any specific styles for ExampleGallery if needed */
</style>
