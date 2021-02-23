import { Router } from "vue-router";
import firebase from "firebase/app";
import { auth, createAuthProvider } from "@/firebase";
import { reactive, readonly, toRefs } from "vue";

// TODO: Once we need extra info on the user object, add a user object
interface UserStateType {
  initialized: boolean;
  error: string;
}
const userState: UserStateType = reactive({
  initialized: false,
  error: "",
});

/**
 * TODO: move state into a useUser hook or something
 * avoids having to use separate router instance for each function
 * would fit better with vuex pattern of mutations and actions
 */
export default function () {
  const onUserLogout = async (router: Router) => {
    try {
      // TODO: if signout is available within rooms, remove connection node on logout
      await auth.signOut();
      router.push({ name: "Login" });
    } catch {
      userState.error = "Error signing out.";
    }
  };

  const signInWithGoogle = async (router: Router) => {
    const provider = createAuthProvider(); // for now only a google auth provider
    try {
      // if new name or profile photo is needed from google profile do it here
      // check provider id and do user.updateProfile
      await auth.signInWithPopup(provider);
      router.push({ name: "Dashboard" });
    } catch (err) {
      userState.error = "Unsuccessful login, show a UI element";
    }
  };

  const getCurrentUser = () => {
    return new Promise<firebase.User | null>((resolve, reject) => {
      if (userState.initialized) {
        resolve(auth.currentUser);
      }
      const unsubscribe = auth.onAuthStateChanged((user) => {
        userState.initialized = true; // add a timeout if the animation flash is too quick
        unsubscribe();
        resolve(user);
      }, reject);
    });
  };

  return {
    onUserLogout,
    signInWithGoogle,
    getCurrentUser,
    ...toRefs(readonly(userState)),
  };
}
