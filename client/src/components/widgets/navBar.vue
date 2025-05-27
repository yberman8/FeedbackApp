<template>
  <div>
    <v-app-bar app color="primary" dark elevation="2">
      <v-app-bar-title class="d-flex align-center">
        <v-icon class="me-2">mdi-message-text</v-icon>
        SimpleFeedbackApp
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <div v-bind="props" @mouseover="isFocused = true" @mouseleave="isFocused = false" @click="logOut"
            class="logout-wrapper ml-4" style="cursor: pointer">
            <v-icon class="me-2 image-transition" :size="isFocused ? 'large' : 'small'"
              :height="isFocused ? 'large' : 'small'">mdi-logout</v-icon>
          </div>
        </template>
        <span>התנתק</span>
      </v-tooltip>

    </v-app-bar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue'
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify'
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const { mobile } = useDisplay()

const isFocused = ref(false)

const logOut = () => {
  console.log('Logging out...')
  authStore.logout();
  router.replace(`/login`);

}

// Navigation items
// const navigationItems = [
//   {
//     name: 'home',
//     title: 'דף הבית',
//     path: '/',
//     icon: 'mdi-home'
//   },
//   {
//     name: 'admin',
//     title: 'פאנל ניהול',
//     path: '/admin',
//     icon: 'mdi-shield-account'
//   }
// ]

</script>
<style scoped>
.logout-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.logout-wrapper:hover {
  background-color: rgba(13, 44, 109, 0.06);
}

.image-transition {
  transition: width 0.3s ease, height 0.3s ease;
}

/* Responsive Adjustments */
@media (max-width: 960px) {
  .logo-wrapper {
    height: 50px;
  }
}
</style>