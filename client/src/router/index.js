import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: 'SimpleFeedbackApp - דף הבית',
    },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/AdminView.vue'),
    meta: {
      title: 'פאנל ניהול משובים',
      requiresAdmin: true,
    },
  },
  {
    path: '/feedback/:id',
    name: 'FeedbackDetail',
    component: () => import('../views/FeedbackDetailView.vue'),
    props: true,
    meta: {
      title: 'פרטי משוב',
      requiresAdmin: true,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      title: 'SimpleFeedbackApp - דף כניסה',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: 'דף לא נמצא',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Update page title
  document.title = to.meta.title || 'SimpleFeedbackApp'

  const authStore = useAuthStore();
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const isAuthenticated = authStore.isAuthenticated;

  // Redirect authenticated users away from /login
  if (to.path === '/login' && isAuthenticated) {
    return next('/admin');
  }
  else if (requiresAdmin && !isAuthenticated) {
    return next('/login');
  } else {
    return next();
  }
})




export default router;