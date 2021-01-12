import firebase from "firebase/app";
import { reactive, readonly, onBeforeUnmount } from "vue";

interface FirebaseState<T> {
  loading: boolean;
  error: string;
  data: T[];
}

// while this is a nice exercise in generics, I'm having difficulty connecting the pieces
// for now handle these functions in own component hooks
// TODO: come back to this once some more code is written
export default function<T>(fbReference: firebase.database.Reference) {
  const state: FirebaseState<T> = reactive({
    loading: true,
    error: "",
    data: [],
  });
  const fetchListOnce = async () => {
    try {
      await fbReference.once("value", snapshot => {
        snapshot.forEach(child => {
          state.data.push({ id: child.key, ...child.val() });
        });
      });
    } catch (err) {
      console.error(err);
    } finally {
      state.loading = false;
    }
  };

  const createChildAddedListener = () => {
    fbReference.on("child_added", snapshot => {
      state.data.push(snapshot.val());
    });
  };

  const createNewNode = async (node: T) => {
    try {
      await fbReference.push(node);
    } catch (err) {
      console.error(err);
    }
  };

  onBeforeUnmount(() => {
    fbReference.off();
    console.log("Remove listener");
  });

  return {
    fbState: readonly(state),
    fetchListOnce,
    createNewNode,
    createChildAddedListener,
  };
}
