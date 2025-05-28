<template>
    <v-container class="py-6">
        <v-row justify="center">
            <v-col cols="12" md="8" lg="6">
                <div class="d-flex align-center mb-6">
                    <v-btn icon variant="text" @click="$router.go(-1)" class="me-2">
                        <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                    <h1 class="text-h4 font-weight-bold">פרטי משוב</h1>
                </div>

                <!-- Loading -->
                <v-card v-if="loading" class="text-center pa-8">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <div class="mt-4">טוען פרטי משוב...</div>
                </v-card>

                <!-- Error -->
                <v-card v-else-if="error" class="text-center pa-8" color="error-lighten-5">
                    <v-icon size="64" color="error">mdi-alert-circle</v-icon>
                    <div class="text-h6 mt-4">{{ error }}</div>
                    <v-btn color="primary" class="mt-4" @click="$router.push({ name: 'Admin' })">
                        חזרה לרשימת משובים
                    </v-btn>
                </v-card>

                <!-- Feedback Details -->
                <v-card v-else-if="feedback" class="elevation-4">
                    <v-card-title class="pa-6 bg-primary text-white">
                        <div class="d-flex justify-space-between align-center w-100">
                            <div class="d-flex align-center">
                                <v-avatar color="white" class="me-3">
                                    <v-icon color="primary">mdi-account</v-icon>
                                </v-avatar>
                                <div>
                                    <div class="text-h5">{{ feedback.name }}</div>
                                    <div class="text-caption">
                                        {{ formatDate(feedback.createdAt) }}
                                    </div>
                                </div>
                            </div>

                            <v-chip :color="getRatingColor(feedback.rating)" variant="flat" size="large"
                                class="text-white">
                                <v-icon start>mdi-star</v-icon>
                                {{ feedback.rating }} - {{ getRatingText(feedback.rating) }}
                            </v-chip>
                        </div>
                    </v-card-title>

                    <!-- Content -->
                    <v-card-text class="pa-6">
                        <div class="mb-6">
                            <h3 class="text-h6 mb-3">תוכן המשוב:</h3>
                            <div class="text-body-1 pa-4 bg-grey-lighten-4 rounded" dir="rtl">
                                {{ feedback.message }}
                            </div>
                        </div>

                        <v-row>
                            <v-col cols="12" md="6">
                                <v-card variant="outlined" class="pa-4">
                                    <div class="text-subtitle-2 text-grey-darken-1 mb-1">תאריך יצירה</div>
                                    <div class="text-body-1">{{ formatFullDate(feedback.createdAt) }}</div>
                                </v-card>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-card variant="outlined" class="pa-4">
                                    <div class="text-subtitle-2 text-grey-darken-1 mb-1">מזהה משוב</div>
                                    <div class="text-body-1 font-mono">{{ feedback._id }}</div>
                                </v-card>
                            </v-col>
                        </v-row>

                        <!-- Rating -->
                        <v-card variant="outlined" class="mt-4 pa-4">
                            <h4 class="text-h6 mb-3">ניתוח דירוג</h4>
                            <div class="d-flex align-center mb-2">
                                <span class="me-2">דירוג:</span>
                                <v-rating :model-value="feedback.rating" readonly color="amber" size="small"></v-rating>
                                <span class="ms-2 text-grey-darken-1">({{ feedback.rating }}/5)</span>
                            </div>
                            <div class="text-body-2 text-grey-darken-1">
                                {{ getRatingDescription(feedback.rating) }}
                            </div>
                        </v-card>
                    </v-card-text>

                    <!-- Actions -->
                    <v-card-actions class="pa-6">
                        <v-btn variant="outlined" @click="$router.push({ name: 'Admin' })">
                            <v-icon start>mdi-arrow-right</v-icon>
                            חזרה לרשימה
                        </v-btn>

                        <v-spacer></v-spacer>

                        <v-btn color="error" variant="outlined" @click="deleteFeedback">
                            <v-icon start>mdi-delete</v-icon>
                            מחק משוב
                        </v-btn>

                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <!-- Delete Dialog -->
        <v-dialog v-model="deleteDialog" max-width="400">
            <v-card>
                <v-card-title>אישור מחיקה</v-card-title>
                <v-card-text>
                    האם אתה בטוח שברצונך למחוק את המשוב של {{ feedback?.name }}?
                    פעולה זו לא ניתנת לביטול.
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="deleteDialog = false">ביטול</v-btn>
                    <v-btn color="error" @click="confirmDelete">מחק</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { feedbacksService } from '@/services/feedbacks.service';

const props = defineProps({
    id: String
})

const feedback = ref(null)
const loading = ref(true)
const error = ref(null)
const deleteDialog = ref(false)

const route = useRoute()
const router = useRouter()

const fetchFeedback = async () => {
    try {
        const feedbackId = props.id || route.params.id;
        const response = await feedbacksService.fetchFeedback(feedbackId);
        if (response) {
            feedback.value = response;
        } else {
            error.value = 'משוב לא נמצא'
        }
    } catch (err) {
        error.value = 'שגיאה בטעינת המשוב'
        console.error('Error fetching feedback:', err)
    } finally {
        loading.value = false
    }
}


const getRatingColor = (rating) => {
    if (rating >= 4) return 'green'
    if (rating >= 3) return 'amber'
    return 'red'
}

const getRatingText = (rating) => {
    const texts = {
        1: 'לא מרוצה',
        2: 'פחות מרוצה',
        3: 'בסדר',
        4: 'מרוצה',
        5: 'מרוצה מאוד'
    }
    return texts[rating] || 'לא ידוע'
}

const getRatingDescription = (rating) => {
    const descriptions = {
        1: 'הלקוח חווה חוויה שלילית ודורש שיפור משמעותי',
        2: 'יש מקום לשיפור בשירות או במוצר',
        3: 'חוויה סבירה, אך ניתן להשתפר',
        4: 'הלקוח מרוצה מהשירות או המוצר',
        5: 'חוויה מעולה! הלקוח מאוד מרוצה'
    }
    return descriptions[rating] || ''
}

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const formatFullDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const deleteFeedback = () => {
    deleteDialog.value = true
}

const confirmDelete = async () => {
    try {
        const feedbackId = props.id || route.params.id;
        await feedbacksService.deleteFeedback(feedbackId);
        router.replace({ name: 'Admin' })
    } catch (error) {
        error.value = 'שגיאה במחיקת המשוב'
        console.error('Error deleting feedback:', error)
    }
    deleteDialog.value = false
}

onMounted(() => {
    fetchFeedback()
})
</script>

<style scoped>
.font-mono {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
}
</style>
