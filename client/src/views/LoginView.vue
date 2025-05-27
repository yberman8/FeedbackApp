<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Left side - Decorative panel -->
      <v-col cols="12" md="6" class="d-none d-md-flex align-center justify-center gradient-bg">
        <div class="text-center px-8 py-12 login-left-content">
          <h1 class="text-h3 font-weight-bold text-white mb-6">ברוכים הבאים</h1>
          <p class="text-h6 text-white mb-8">מערכת ניהול משובים מתקדמת</p>
          <div class="d-flex justify-center">
            <v-chip color="white" size="large" class="px-4 py-2">
              <v-icon start color="white">mdi-check-circle</v-icon>
              <span class="text-white font-weight-medium">ניהול משובים קל ומהיר</span>
            </v-chip>
          </div>
        </div>
      </v-col>

      <!-- Right side - Login form -->
      <v-col cols="12" md="6" class="d-flex align-center justify-center login-bg">
        <v-card width="100%" max-width="450" class="mx-auto glass-card" elevation="0">
          <v-card-text class="text-center pt-12 px-8">
            <div class="login-icon-wrapper mb-6">
              <v-icon icon="mdi-lock" size="32" color="white" />
            </div>
            <h2 class="text-h4 font-weight-bold mb-3 text-primary">התחברות</h2>
            <p class="text-body-1 text-medium-emphasis mb-8">
              ברוכים הבאים חזרה! אנא התחברו למערכת
            </p>

            <v-form @submit.prevent="handleLogin" v-model="isValid">
              <v-text-field v-model="email" label="דוא״ל" type="email" :rules="[rules.required, rules.email]"
                prepend-inner-icon="mdi-email-outline" variant="outlined" class="mb-4 login-field" color="primary"
                bg-color="grey-lighten-5" />

              <v-text-field v-model="password" label="סיסמה" :type="showPassword ? 'text' : 'password'"
                :rules="[rules.required]" prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword" variant="outlined" class="mb-6 login-field"
                color="primary" bg-color="grey-lighten-5" />

              <v-btn type="submit" color="primary" size="large" block :loading="loading" :disabled="!isValid || loading"
                class="mb-4 login-btn" elevation="2">
                <v-icon start>mdi-login</v-icon>
                התחבר
              </v-btn>

              <v-btn variant="text" color="primary" block class="forgot-password-btn">
                שכחתי סיסמה
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <SnackBar v-model="showError" :snacbarText="errorMessage" :snackbarColorBt="'red'"></SnackBar>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import SnackBar from '@/components/widgets/snackBar.vue'

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const isValid = ref(false);
const showError = ref(false);
const errorMessage = ref('');

const rules = {
  required: v => !!v || 'שדה חובה',
  email: v => /.+@.+\..+/.test(v) || 'אימייל לא תקין',
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace(`/admin`);
  }
});

const handleLogin = async () => {
  loading.value = true;
  try {

    await authStore.login(email.value, password.value);
    router.replace(`/admin`);

  } catch (error) {
    console.log(error);
    errorMessage.value = 'התחברות נכשלה. אנא בדקו את פרטי ההתחברות ונסו שוב.';
    showError.value = true;
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.gradient-bg {
  background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 50%, #7986cb 100%);
  position: relative;
  overflow: hidden;
}

.gradient-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.5;
}

.login-left-content {
  position: relative;
  z-index: 1;
  max-width: 500px;
}

.login-bg {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
}

.login-field {
  border-radius: 8px;
}

.login-btn {
  border-radius: 8px;
  height: 48px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
}

.forgot-password-btn {
  font-weight: 500;
  text-transform: none;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }

  100% {
    transform: translateY(0px);
  }
}

@media (max-width: 960px) {
  .login-bg {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 24px;
  }

  .glass-card {
    margin-top: 40px;
    margin-bottom: 40px;
  }
}
</style>