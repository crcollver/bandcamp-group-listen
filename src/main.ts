import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import router from "./router";

// TODO: waiting for firebase auth causes app to hang on refresh or init
// move this onAuthStateChanged to a promise so we can make a splash screen
createApp(App)
  .use(router)
  .mount("#app");
