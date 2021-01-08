import firebase from "firebase/app";
import { reactive, readonly } from "vue";

interface FirebaseState<T> {
  loading: boolean;
  error: string;
  data: T[];
}

export default function<T>(fbReference: firebase.database.Reference) {
  const state: FirebaseState<T> = reactive({
    loading: true,
    error: "",
    data: [],
  });
  const fetchFromFB = async () => {
    try {
      await fbReference.once("value", snapshot => {
        snapshot.forEach(child => {
          state.data.push({ id: child.key, ...child.val() });
        });
      });
    } catch (err) {
      state.error = `Error fetching data.`;
    } finally {
      state.loading = false;
    }
  };
  return { fbState: readonly(state), fetchFromFB };
}
