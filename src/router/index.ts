import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import useAuth from "../composables/useAuth";

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
    component: () =>
      import(/* webpackChunkName: "Login" */ "../views/Login.vue"),
    meta: {
      requiresAuth: false,
      title: "Login",
    },
  },
  {
    path: "/room/:id",
    name: "Room",
    component: () => import(/* webpackChunkName: "Room" */ "../views/Room.vue"),
    meta: {
      requiresAuth: true,
      title: "Room",
    },
  },
  {
    path: "/:catchAll(.*)*",
    redirect: { name: "Dashboard" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// checks if user is logged in on every navigation
// waits for firebase auth on app initialization
router.beforeEach(async (to) => {
  const { getCurrentUser } = useAuth();
  if (to.meta.requiresAuth && !(await getCurrentUser())) {
    return { name: "Login" }; // just to be explicit, use the name of the route
  } else if (!to.meta.requiresAuth && (await getCurrentUser())) {
    return { name: "Dashboard" };
  }
});

export default router;
