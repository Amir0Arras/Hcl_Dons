<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/context/authStore'
import Toaster from '@/components/Toaster.vue'

const auth = useAuthStore()
onMounted(() => auth.initSession())
</script>
<template>
  <RouterView />
  <Toaster />
</template>
