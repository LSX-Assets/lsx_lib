import { create } from "zustand";

type ModelsStore = {
  models: string[];
  loaded: boolean;
  loading: boolean;
};

export const useModels = create<ModelsStore>(() => ({
  models: [],
  loaded: false,
  loading: false,
}));

// Lazy-load the ~54k model-name list ONCE, only when a model picker actually
// mounts (ModelSelect calls loadModels() in an effect). The dynamic import()
// means the list splits into its own chunk (tsup splitting:true) and never
// ships to a consumer's runtime until first use — it's pure dead weight for
// UIs that never show a model picker. Singleton guard collapses concurrent
// mounts to a single load; reset on failure so a later mount can retry.
let requested = false;
export function loadModels(): void {
  if (requested) return;
  requested = true;
  useModels.setState({ loading: true });
  import("../data/modelNames")
    .then((m) => {
      useModels.setState({
        models: Array.isArray(m.MODEL_NAMES) ? m.MODEL_NAMES : [],
        loaded: true,
        loading: false,
      });
    })
    .catch(() => {
      requested = false;
      useModels.setState({ loaded: true, loading: false });
    });
}
