<template>
    <v-container class="fill-height">
        <v-row align="center" justify="center">
            <v-col cols="12" md="6" class="text-center">
                <div class="error-container">
                    <div class="error-number">404</div>
                    <v-icon size="120" color="grey-lighten-1" class="mb-4">
                        mdi-file-question-outline
                    </v-icon>
                    <h1 class="text-h4 font-weight-bold mb-4">הדף לא נמצא</h1>
                    <p class="text-h6 text-grey-darken-1 mb-6">
                        מצטערים, הדף שחיפשת לא קיים או הועבר למקום אחר
                    </p>

                    <div class="d-flex justify-center gap-4 flex-wrap">
                        <v-btn color="primary" size="large" :to="{ name: 'Home' }">
                            <v-icon start>mdi-home</v-icon>
                            דף הבית
                        </v-btn>

                        <v-btn variant="outlined" size="large" :to="{ name: 'Admin' }">
                            <v-icon start>mdi-shield-account</v-icon>
                            פאנל ניהול
                        </v-btn>

                        <v-btn variant="text" size="large" @click="$router.go(-1)">
                            <v-icon start>mdi-arrow-right</v-icon>
                            חזרה
                        </v-btn>
                    </div>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
    document.title = 'דף לא נמצא - SimpleFeedbackApp'
})
</script>

<style scoped>
.fill-height {
    min-height: 100vh;
}

.error-container {
    position: relative;
}

.error-number {
    font-size: 8rem;
    font-weight: 900;
    color: #f5f5f5;
    position: absolute;
    top: -2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: -1;
    user-select: none;
}

.gap-4 {
    gap: 1rem;
}
</style>