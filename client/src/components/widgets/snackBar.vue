<template>
    <v-snackbar v-model="openMode" multi-line :timeout="4000" :color="snackbarColorBt">
        {{ snacbarText }}
        <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="openMode = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>
<script>
export default {
    props: {
        snacbarText: String,
        snackbarColorBt: String,
        value: { type: Boolean, default: false },
    },
    methods: {
    },
    computed: {
        openMode: {
            get() {
                return this.value
            },
            set(v) {
                return this.$emit('input', v)
            }
        },
    },
}
</script>

  