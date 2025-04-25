import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Reaction {
  type: string;
  count: number;
}

interface Confession {
  id: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
  author?: {
    username: string;
    college: string;
  };
  reactions: Reaction[];
  comments: number;
}

interface ConfessionState {
  confessions: Confession[];
  currentConfession: Confession | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  filter: 'all' | 'trending' | 'recent' | 'popular';
  search: string;
}

const initialState: ConfessionState = {
  confessions: [],
  currentConfession: null,
  isLoading: false,
  error: null,
  hasMore: true,
  page: 1,
  filter: 'all',
  search: '',
};

const confessionSlice = createSlice({
  name: 'confessions',
  initialState,
  reducers: {
    setConfessions: (state, action: PayloadAction<Confession[]>) => {
      state.confessions = action.payload;
      state.error = null;
    },
    appendConfessions: (state, action: PayloadAction<Confession[]>) => {
      state.confessions = [...state.confessions, ...action.payload];
    },
    setCurrentConfession: (state, action: PayloadAction<Confession | null>) => {
      state.currentConfession = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setFilter: (state, action: PayloadAction<ConfessionState['filter']>) => {
      state.filter = action.payload;
      state.page = 1;
      state.confessions = [];
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
      state.confessions = [];
    },
    updateConfession: (state, action: PayloadAction<Partial<Confession> & { id: string }>) => {
      const { id, ...updates } = action.payload;
      const index = state.confessions.findIndex(c => c.id === id);
      if (index !== -1) {
        state.confessions[index] = { ...state.confessions[index], ...updates };
      }
      if (state.currentConfession?.id === id) {
        state.currentConfession = { ...state.currentConfession, ...updates };
      }
    },
    addReaction: (state, action: PayloadAction<{ confessionId: string; reaction: Reaction }>) => {
      const { confessionId, reaction } = action.payload;
      const confession = state.confessions.find(c => c.id === confessionId);
      if (confession) {
        const existingReaction = confession.reactions.find(r => r.type === reaction.type);
        if (existingReaction) {
          existingReaction.count = reaction.count;
        } else {
          confession.reactions.push(reaction);
        }
      }
    },
    incrementComments: (state, action: PayloadAction<string>) => {
      const confession = state.confessions.find(c => c.id === action.payload);
      if (confession) {
        confession.comments += 1;
      }
    },
  },
});

export const {
  setConfessions,
  appendConfessions,
  setCurrentConfession,
  setLoading,
  setError,
  setHasMore,
  setPage,
  setFilter,
  setSearch,
  updateConfession,
  addReaction,
  incrementComments,
} = confessionSlice.actions;

export default confessionSlice.reducer; 