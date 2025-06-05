import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import TranslationView from '../views/TranslationView.vue'
import AuthService from '@/services/auth.service'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/translate',
      name: 'translate',
      component: TranslationView
    },
    {
      path: '/stuff',
      name: 'stuff',
      component: () => import('../views/StuffView.vue')
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/FavoritesView.vue')
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const auth = new AuthService()
  const publicPages = ['/login', '/register', '/translate']
  const authRequired = !publicPages.includes(to.path)
  const loggedIn = auth.getCurrentUser()

  if (authRequired && !loggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
