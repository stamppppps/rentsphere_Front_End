import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CondoState = {
    condoId: string | null;
    condoName: string | null;
    selectCondo: (id: string, name: string) => void;
    clearCondo: () => void;
};

export const useCondoStore = create<CondoState>()(
    persist(
        (set) => ({
            condoId: null,
            condoName: null,
            selectCondo: (id, name) => set({ condoId: id, condoName: name }),
            clearCondo: () => set({ condoId: null, condoName: null }),
        }),
        {
            name: "rentsphere_selected_condo_store",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

/** Helper for use outside React components (e.g. in async functions) */
export function getSelectedCondoId(): string | null {
    return useCondoStore.getState().condoId;
}

export function getSelectedCondoName(): string | null {
    return useCondoStore.getState().condoName;
}
