<template>
  <v-container class="grey-lighten-5 min-h-screen">
    <v-row justify="center">
      <v-col cols="12" md="10">
        <!-- Header -->
        <v-row class="mb-6">
          <v-col cols="12" md="8">
            <div class="d-flex align-center mb-2">
              <v-btn icon variant="text" @click="$router.go(-1)" class="me-2">
                <v-icon>mdi-arrow-right</v-icon>
              </v-btn>
              <h1 class="text-h4 font-weight-bold">פאנל ניהול משובים</h1>
            </div>
            <p class="text-subtitle-1 text-grey-darken-1">ניהול וצפייה במשובי לקוחות</p>
          </v-col>
          <v-col cols="12" md="4" class="text-end">
            <v-btn variant="outlined" color="primary" :to="{ name: 'Home' }" class="me-2">
              <v-icon start>mdi-home</v-icon>
              דף הבית
            </v-btn>
            <v-btn color="primary" @click="refreshData" :loading="refreshing">
              <v-icon start>mdi-refresh</v-icon>
              רענן
            </v-btn>
          </v-col>
        </v-row>

        <!-- Statistics Cards -->
        <v-row class="mb-6">
          <v-col cols="12" sm="6" md="3">
            <v-card class="text-center pa-4" color="blue-lighten-5" @click="filterBy('all')">
              <v-icon size="48" color="blue">mdi-message-text</v-icon>
              <div class="text-h4 font-weight-bold mt-2">{{ feedbacks.length }}</div>
              <div class="text-subtitle-2 text-grey-darken-1">סך הכל משובים</div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="text-center pa-4" color="amber-lighten-5">
              <v-icon size="48" color="amber">mdi-star</v-icon>
              <div class="text-h4 font-weight-bold mt-2">{{ averageRating }}</div>
              <div class="text-subtitle-2 text-grey-darken-1">דירוג ממוצע</div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="text-center pa-4" color="green-lighten-5" @click="filterBy('positive')">
              <v-icon size="48" color="green">mdi-thumb-up</v-icon>
              <div class="text-h4 font-weight-bold mt-2">{{ positiveFeedbacks }}</div>
              <div class="text-subtitle-2 text-grey-darken-1">משובים חיוביים</div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="text-center pa-4" color="purple-lighten-5" @click="filterBy('weekly')">
              <v-icon size="48" color="purple">mdi-calendar-week</v-icon>
              <div class="text-h4 font-weight-bold mt-2">{{ weeklyFeedbacks }}</div>
              <div class="text-subtitle-2 text-grey-darken-1">השבוע</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Filters and Search -->
        <v-card class="mb-4">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-text-field v-model="searchQuery" label="חיפוש משובים" prepend-inner-icon="mdi-magnify"
                  variant="outlined" density="compact" hide-details clearable></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select v-model="sortBy" label="מיון לפי" :items="sortOptions" variant="outlined" density="compact"
                  hide-details></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-select v-model="filterRating" label="סינון לפי דירוג" :items="ratingFilterOptions" variant="outlined"
                  density="compact" hide-details clearable></v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-btn color="error" variant="outlined" @click="clearFilters" block>
                  נקה סינונים
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Feedbacks List -->
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>רשימת משובים ({{ feedbacks.length }})</span>
            <v-chip v-if="activeFilter !== 'all'" color="primary" variant="flat" closable @click:close="clearFilters">
              {{ getFilterLabel(activeFilter) }}
            </v-chip>

            <!-- Items per page selector -->
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="d-flex align-center">
                <span class="text-body-2 me-3">פריטים בעמוד:</span>
                <v-select v-model="itemsPerPage" :items="itemsPerPageOptions" variant="outlined" density="compact"
                  hide-details style="max-width: 100px" @update:modelValue="fetchFeedbacks"></v-select>
              </div>
              <div class="text-body-2 text-grey-darken-1 mr-4">
                {{ displayInfo }}
              </div>
            </div>
          </v-card-title>

          <v-card-text>
            <v-row v-if="loading" justify="center" class="py-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <div class="ms-4">טוען משובים...</div>
            </v-row>

            <div v-else-if="feedbacks.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-message-text-outline</v-icon>
              <div class="text-h6 text-grey-darken-1 mt-4">
                {{ searchQuery ? 'לא נמצאו משובים התואמים לחיפוש' : 'אין משובים עדיין' }}
              </div>
            </div>

            <div v-else class="feedback-list">
              <v-card v-for="feedback in paginatedFeedbacks" :key="feedback._id" class="mb-4 feedback-card"
                variant="outlined" @click="viewFeedbackDetail(feedback)">
                <v-card-text class="pa-4">
                  <div class="d-flex justify-space-between align-start mb-3">
                    <div class="d-flex align-center">
                      <v-avatar color="blue-lighten-1" class="me-3">
                        <v-icon color="white">mdi-account</v-icon>
                      </v-avatar>
                      <div>
                        <div class="text-h6 font-weight-medium">{{ feedback.name }}</div>
                        <div class="text-caption text-grey-darken-1">
                          {{ formatDate(feedback.createdAt) }}
                        </div>
                      </div>
                    </div>

                    <div class="d-flex align-center">
                      <v-chip :color="getRatingColor(feedback.rating)" variant="flat" class="text-white me-2"
                        size="small">
                        <v-icon start size="small">mdi-star</v-icon>
                        {{ feedback.rating }}
                      </v-chip>

                      <v-menu>
                        <template v-slot:activator="{ props }">
                          <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props"
                            @click.stop></v-btn>
                        </template>
                        <v-list>
                          <v-list-item @click="viewFeedbackDetail(feedback)">
                            <template v-slot:prepend>
                              <v-icon>mdi-eye</v-icon>
                            </template>
                            <v-list-item-title>צפה בפרטים</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="deleteFeedback(feedback._id)">
                            <template v-slot:prepend>
                              <v-icon color="error">mdi-delete</v-icon>
                            </template>
                            <v-list-item-title>מחק</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </div>

                  <div class="text-body-1" dir="rtl">
                    {{ truncateMessage(feedback.message) }}
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- Pagination Controls -->
            <div v-if="totalPagesComputed > 1" class="mt-6">
              <div class="text-center mt-4">
                <v-pagination v-model="currentPage" :length="totalPagesComputed" :total-visible="7"
                  :disabled="serverLoading" show-first-last-page></v-pagination>
              </div>
            </div>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
    <SnackBar v-model="snackbar.show" :snacbarText="snackbar.text" :snackbarColorBt="snackbar.color"></SnackBar>

  </v-container>



</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { feedbacksService } from '@/services/feedbacks.service';
import SnackBar from '@/components/widgets/snackBar.vue'

const router = useRouter()

const feedbacks = ref([])
const loading = ref(true)
const refreshing = ref(false)
const sortBy = ref('date')
const searchQuery = ref('')
const filterRating = ref(null)
const activeFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const totalCount = ref(0)
const totalPages = ref(0)
const hasNextPage = ref(false)
const hasPrevPage = ref(false)
const serverLoading = ref(false)

const snackbar = reactive({
  show: false,
  text: '',
  color: 'green'
})

// Sort and filter options
const sortOptions = [
  { title: 'מיון לפי תאריך', value: 'date' },
  { title: 'מיון לפי דירוג', value: 'rating' },
  { title: 'מיון לפי שם', value: 'name' }
]

const ratingFilterOptions = [
  { title: 'כל הדירוגים', value: null },
  { title: '5 כוכבים', value: 5 },
  { title: '4 כוכבים', value: 4 },
  { title: '3 כוכבים', value: 3 },
  { title: '2 כוכבים', value: 2 },
  { title: '1 כוכב', value: 1 }
]

const itemsPerPageOptions = [10, 20, 50, 100];

const displayInfo = computed(() => {
  const start = ((currentPage.value - 1) * itemsPerPage.value) + 1
  const end = Math.min(currentPage.value * itemsPerPage.value, totalCount.value)
  return `מציג ${start}-${end} מתוך ${totalCount.value} משובים`
})


const averageRating = computed(() => {
  if (feedbacks.value.length === 0) return '0'
  const sum = feedbacks.value.reduce((acc, feedback) => acc + feedback.rating, 0)
  return (sum / feedbacks.value.length).toFixed(1)
})

const positiveFeedbacks = computed(() => {
  return feedbacks.value.filter(feedback => feedback.rating >= 4).length
})

const weeklyFeedbacks = computed(() => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return feedbacks.value.filter(feedback => new Date(feedback.createdAt) > weekAgo).length
})

// Watch for filter changes to reset pagination
watch([searchQuery, filterRating, activeFilter, sortBy], () => {
  currentPage.value = 1
  fetchFeedbacks()

})

// Watch for currentPage changes to reset pagination
watch([currentPage, ], () => {
  fetchFeedbacks()

})

// הסר את computed properties הישנים ועדכן
const paginatedFeedbacks = computed(() => {
  // עכשיו feedbacks.value כבר מכיל רק את הפריטים של העמוד הנוכחי
  return feedbacks.value
})

// עדכן את totalPages להשתמש בנתונים מהשרת
const totalPagesComputed = computed(() => {
  return totalPages.value
})


const fetchFeedbacks = async () => {
  try {

    const options = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      rating: filterRating.value,
      filter: activeFilter.value,
      sortBy: sortBy.value
    }

    const response = await feedbacksService.fetchFeedbacks(options);
    // עדכן את הנתונים מהשרת
    feedbacks.value = response.feedbacks
    totalCount.value = response.pagination.totalCount
    totalPages.value = response.pagination.totalPages
    hasNextPage.value = response.pagination.hasNextPage
    hasPrevPage.value = response.pagination.hasPrevPage

  } catch (error) {
    console.error('Error fetching feedbacks:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const refreshData = async () => {
  refreshing.value = true
  await fetchFeedbacks()
}

const filterBy = (filter) => {
  activeFilter.value = filter
  currentPage.value = 1
  fetchFeedbacks()
}

const clearFilters = () => {
  searchQuery.value = ''
  filterRating.value = null
  activeFilter.value = 'all'
  currentPage.value = 1
}

const getFilterLabel = (filter) => {
  const labels = {
    positive: 'משובים חיוביים',
    weekly: 'השבוע',
    all: 'הכל'
  }
  return labels[filter] || filter
}

const getRatingColor = (rating) => {
  if (rating >= 4) return 'green'
  if (rating >= 3) return 'amber'
  return 'red'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showSnackbar = (text, color) => {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

const truncateMessage = (message, length = 100) => {
  return message.length > length ? message.substring(0, length) + '...' : message
}

const viewFeedbackDetail = (feedback) => {
  router.push({
    name: 'FeedbackDetail',
    params: { id: feedback._id }
  })
}

const deleteFeedback = async (id) => {
  if (confirm('האם אתה בטוח שברצונך למחוק את המשוב?')) {
    try {
      await feedbacksService.deleteFeedback(id);
      await fetchFeedbacks()
      showSnackbar('המשוב נמחק בהצלחה!', 'green')
    } catch (error) {
      showSnackbar('אירעה שגיאה במחיקת המשוב', 'red')
      console.error('Error deleting feedback:', error)
    }
  }
}

onMounted(() => {
  fetchFeedbacks()
})
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.feedback-card {
  border-right: 4px solid #2196F3 !important;
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.feedback-card:hover {
  transform: translateY(-2px);
}

.feedback-list {
  max-height: none;
}
</style>