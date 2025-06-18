<template>
  <footer class="app-footer py-8 text-center text-sm text-gray-500 border-t bg-gray-50">
    <p>&copy; {{ new Date().getFullYear() }} SEP-7 Diagnoser. All rights reserved (or MIT License if applicable).</p>
    <p class="mt-1">
      <a href="#" class="text-blue-600 hover:underline">Stellar SEP-7 Docs</a> |
      <a href="#" class="text-blue-600 hover:underline">GitHub</a> |
      <a href="#" class="text-blue-600 hover:underline">About</a>
    </p>
  </footer>
</template>

<script setup lang="ts">
// No script logic needed for this simple static footer
</script>

<style scoped>
/* Styles for TheFooter */
.app-footer a {
  /* Example: */
  /* margin: 0 0.5rem; */
}
</style>
