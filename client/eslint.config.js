import vue from 'eslint-plugin-vue';
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
      },
    },
    plugins: {
      vue,
    },
    rules: {
      ...vue.configs['vue3-essential'].rules,
      // תוכל להוסיף כאן חוקים נוספים משלך
    },
  },
];
