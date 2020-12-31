import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { auth } from "./firebase";
import router from "./router";

// TODO: waiting for firebase auth causes app to hang on refresh or init
// move this onAuthStateChanged to a promise so we can make a splash screen
const unsubscribe = auth.onAuthStateChanged(() => {
  createApp(App)
    .use(router)
    .mount("#app");
  unsubscribe();
});
