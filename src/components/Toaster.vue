<script setup>
import { useToast } from '@/composables/useToast'
const { toasts } = useToast()
</script>
<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
    <Transition v-for="t in toasts" :key="t.id" name="toast" appear>
      <div :class="['pointer-events-auto rounded-xl border p-4 shadow-xl text-sm flex items-start gap-3',
        t.variant==='destructive' ? 'bg-destructive text-destructive-foreground border-destructive/20'
          : 'bg-card text-card-foreground border-border']">
        <div class="flex-1">
          <p class="font-semibold">{{ t.title }}</p>
          <p v-if="t.description" class="text-xs opacity-80 mt-0.5">{{ t.description }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>
<style scoped>
.toast-enter-from,.toast-leave-to { opacity:0; transform:translateY(8px); }
.toast-enter-active,.toast-leave-active { transition:all .25s ease; }
</style>
