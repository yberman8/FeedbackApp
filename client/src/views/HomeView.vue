<template>
  <v-container fluid class="pa-0">
    <div class="gradient-bg min-h-screen">
      <v-container class="py-8">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <!-- Header -->
            <div class="text-center mb-8">
              <h1 class="text-h3 font-weight-bold text-white mb-2">
                SimpleFeedbackApp
              </h1>
              <p class="text-h6 text-blue-lighten-1">
                נשמח לשמוע את המשוב שלך
              </p>
            </div>

            <!-- Feedback Card -->
            <v-card class="elevation-8 rounded-lg">
              <v-card-title class="text-center pa-6">
                <v-icon class="me-2" color="primary">mdi-message-text</v-icon>
                טופס משוב
              </v-card-title>
              <v-card-subtitle class="text-center pb-4">
                אנא שתף אותנו בחוויה שלך ועזור לנו להשתפר
              </v-card-subtitle>

              <v-card-text class="pa-6">
                <v-form ref="form" v-model="valid" @submit.prevent="handleSubmitFeedback">
                  <v-text-field v-model="feedback.name" label="שם מלא" prepend-inner-icon="mdi-account"
                    variant="outlined" :rules="nameRules" required class="mb-4" dir="rtl"></v-text-field>

                  <v-select v-model="feedback.rating" label="דירוג (1-5)" prepend-inner-icon="mdi-star"
                    variant="outlined" :items="ratingItems" :rules="ratingRules" required class="mb-4"></v-select>

                  <v-textarea v-model="feedback.message" label="הודעה" prepend-inner-icon="mdi-message"
                    variant="outlined" :rules="messageRules" rows="4" required class="mb-4" dir="rtl"></v-textarea>

                  <v-btn type="submit" color="primary" size="large" block :loading="loading" :disabled="!valid"
                    class="mb-4">
                    <v-icon start>mdi-send</v-icon>
                    שלח משוב
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>

            <!-- Actions -->
            <div class="text-center mt-6" v-if="authStore.isAuthenticated">
              <v-btn variant="outlined" color="white" :to="{ name: 'Admin' }" class="me-4">
                <v-icon start>mdi-shield-account</v-icon>
                פאנל ניהול
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Stats Section -->
        <v-row ref="statsSection" justify="center" class="mt-12">
          <v-col cols="12" md="10">
            <v-card class="pa-6" color="rgba(255,255,255,0.1)" variant="outlined">
              <v-card-title class="text-center text-white mb-4">
                <v-icon class="me-2">mdi-chart-box</v-icon>
                סטטיסטיקות
              </v-card-title>

              <v-row>
                <v-col cols="6" md="3" class="text-center">
                  <div class="text-h4 font-weight-bold text-white">{{ stats.total }}</div>
                  <div class="text-caption text-blue-lighten-2">סך הכל משובים</div>
                </v-col>
                <v-col cols="6" md="3" class="text-center">
                  <div class="text-h4 font-weight-bold text-white">{{ stats.averageRating }}</div>
                  <div class="text-caption text-blue-lighten-2">דירוג ממוצע</div>
                </v-col>
                <v-col cols="6" md="3" class="text-center">
                  <div class="text-h4 font-weight-bold text-white">{{ stats.positive }}</div>
                  <div class="text-caption text-blue-lighten-2">משובים חיוביים</div>
                </v-col>
                <v-col cols="6" md="3" class="text-center">
                  <div class="text-h4 font-weight-bold text-white">{{ stats.weekly }}</div>
                  <div class="text-caption text-blue-lighten-2">השבוע</div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <SnackBar v-model="snackbar.show" :snacbarText="snackbar.text" :snackbarColorBt="snackbar.color"></SnackBar>

  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { feedbacksService } from '@/services/feedbacks.service';
import { useAuthStore } from '@/stores/auth';
import SnackBar from '@/components/widgets/snackBar.vue'

const router = useRouter()
const setLoading = inject('setLoading')
const authStore = useAuthStore();

const valid = ref(false)
const loading = ref(false)
const form = ref(null)
const statsSection = ref(null)

const feedback = reactive({
  name: '',
  rating: null,
  message: ''
})

const snackbar = reactive({
  show: false,
  text: '',
  color: 'green'
})

const stats = reactive({
  total: 0,
  averageRating: '0',
  positive: 0,
  weekly: 0
})

// Form validation rules
const nameRules = [
  v => !!v || 'שם הוא שדה חובה',
  v => (v && v.length >= 2) || 'שם חייב להכיל לפחות 2 תווים'
]

const ratingRules = [
  v => !!v || 'דירוג הוא שדה חובה'
]

const messageRules = [
  v => !!v || 'הודעה היא שדה חובה',
  v => (v && v.length >= 10) || 'הודעה חייבת להכיל לפחות 10 תווים'
]

// Rating options
const ratingItems = [
  { title: '1 - לא מרוצה', value: 1 },
  { title: '2 - פחות מרוצה', value: 2 },
  { title: '3 - בסדר', value: 3 },
  { title: '4 - מרוצה', value: 4 },
  { title: '5 - מרוצה מאוד', value: 5 }
]

const handleSubmitFeedback = async () => {
  if (!valid.value) return

  loading.value = true
  setLoading?.(true)

  try {
    const response = await feedbacksService.submitFeedback({
      name: feedback.name,
      rating: feedback.rating,
      message: feedback.message
    })
    showSnackbar('המשוב שלך נשלח בהצלחה!', 'green')
    resetForm()
    await fetchStats() 
  } catch (error) {
    showSnackbar('אירעה שגיאה בשליחת המשוב', 'red')
    console.error('Error submitting feedback:', error)
  } finally {
    loading.value = false
    setLoading?.(false)
  }
}

const resetForm = () => {
  feedback.name = ''
  feedback.rating = null
  feedback.message = ''
  form.value?.resetValidation()
}

const showSnackbar = (text, color) => {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

const fetchStats = async () => {
  try {
    const response = await feedbacksService.fetchStats();
    console.log(response);

    Object.assign(stats, response)

  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.v-card {
  backdrop-filter: blur(10px);
}
</style>