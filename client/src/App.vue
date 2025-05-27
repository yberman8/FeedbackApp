<template>
  <v-app>
    <Appbar  v-if="showNavigation"></Appbar>

    <v-main>
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in" appear>
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </v-main>

    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </v-overlay>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import Appbar from '@/components/widgets/navBar.vue'

const route = useRoute()
const { mobile } = useDisplay()

const loading = ref(false)
const showNavigation = computed(() => {
  return route.path !== '/' && route.path !== '/login'
})


// Global loading state management
const setLoading = (state) => {
  loading.value = state
}

// Provide loading function to child components
provide('setLoading', setLoading)

</script>

<style scoped>
/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>