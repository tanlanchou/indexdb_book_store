import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AddView from '../views/AddView.vue'
import DetailView from '../views/view.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/add',
      name: 'add',
      component: AddView
    },
    {
      path: '/detail',
      name: 'view',
      component: DetailView
    }
  ]
})

export default router
