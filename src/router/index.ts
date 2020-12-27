import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import { auth } from "../firebase";

// TODO: make meta its own TS interface, the Router docs seem incomplete
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      requiresAuth: true,
      title: "Dashboard",
    },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
    meta: {
      requiresAuth: false,
      title: "Login",
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// checks if user is logged in on every navigation
// uses some cool new features of Vue Router 4
router.beforeEach(to => {
  document.title = to.meta.title || "Firebase Chat App";
  if (to.meta.requiresAuth && !auth.currentUser) {
    return { name: "Login" }; // just to be explicit, use the name of the route
  } else if (!to.meta.requiresAuth && auth.currentUser) {
    return { name: "Dashboard" };
  }
});

export default router;