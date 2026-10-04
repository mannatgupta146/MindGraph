import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/config';

export const useStore = create(
  persist(
    (set, get) => ({
      // State
      saves: [],
      inboxSaves: [],
      archivedSaves: [],
      collections: [],
      graphData: { nodes: [], links: [] },
      
      // Loading states (for initial empty load)
      loadingSaves: false,
      loadingInbox: false,
      loadingArchives: false,
      loadingCollections: false,
      loadingGraph: false,

      // Actions
      setSaves: (saves) => set({ saves }),
      setInboxSaves: (inboxSaves) => set({ inboxSaves }),
      setArchivedSaves: (archivedSaves) => set({ archivedSaves }),
      setCollections: (collections) => set({ collections }),
      setGraphData: (graphData) => set({ graphData }),

      // Fetchers with Background Sync (Stale-While-Revalidate pattern)
      fetchSaves: async (force = false) => {
        const currentSaves = get().saves;
        if (force || currentSaves.length === 0) {
          set({ loadingSaves: true });
        }
        try {
          const { data } = await api.get('/saves');
          set({ saves: data, loadingSaves: false });
          return data;
        } catch (err) {
          console.error('Error fetching saves:', err);
          set({ loadingSaves: false });
        }
      },

      fetchInbox: async (force = false) => {
        const currentInbox = get().inboxSaves;
        if (force || currentInbox.length === 0) {
          set({ loadingInbox: true });
        }
        try {
          const { data } = await api.get('/saves/inbox');
          set({ inboxSaves: data, loadingInbox: false });
          return data;
        } catch (err) {
          console.error('Error fetching inbox:', err);
          set({ loadingInbox: false });
        }
      },

      fetchArchives: async (force = false) => {
        const currentArchives = get().archivedSaves;
        if (force || currentArchives.length === 0) {
          set({ loadingArchives: true });
        }
        try {
          const { data } = await api.get('/saves/archived');
          set({ archivedSaves: data, loadingArchives: false });
          return data;
        } catch (err) {
          console.error('Error fetching archives:', err);
          set({ loadingArchives: false });
        }
      },

      fetchCollections: async (force = false) => {
        const currentCollections = get().collections;
        if (force || currentCollections.length === 0) {
          set({ loadingCollections: true });
        }
        try {
          const { data } = await api.get('/collections');
          set({ collections: data, loadingCollections: false });
          return data;
        } catch (err) {
          console.error('Error fetching collections:', err);
          set({ loadingCollections: false });
        }
      },

      fetchGraphData: async (force = false) => {
        const currentGraph = get().graphData;
        if (force || !currentGraph.nodes || currentGraph.nodes.length === 0) {
          set({ loadingGraph: true });
        }
        try {
          const { data } = await api.get('/saves/graph');
          set({ graphData: data, loadingGraph: false });
          return data;
        } catch (err) {
          console.error('Error fetching graph data:', err);
          set({ loadingGraph: false });
        }
      },

      // Optimistic mutators
      removeSaveFromAll: (saveId) => {
        set((state) => ({
          saves: state.saves.filter((s) => s._id !== saveId),
          inboxSaves: state.inboxSaves.filter((s) => s._id !== saveId),
          archivedSaves: state.archivedSaves.filter((s) => s._id !== saveId),
        }));
      },

      clearStore: () => {
        set({
          saves: [],
          inboxSaves: [],
          archivedSaves: [],
          collections: [],
          graphData: { nodes: [], links: [] },
        });
      },
    }),
    {
      name: 'mindgraph_cache_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
