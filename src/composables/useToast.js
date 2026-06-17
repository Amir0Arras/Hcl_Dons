import { ref } from 'vue'
const toasts = ref([])
export function useToast() {
  function toast({ title, description, variant = 'default', duration = 4000 }) {
    const id = Date.now()
    toasts.value.push({ id, title, description, variant })
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, duration)
  }
  return { toast, toasts }
}
