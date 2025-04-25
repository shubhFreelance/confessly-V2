import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  isNotificationsOpen: boolean;
  isProfileMenuOpen: boolean;
  isConfessionModalOpen: boolean;
  isReportModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isEditModalOpen: boolean;
  isShareModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isPremiumModalOpen: boolean;
  isPrivateVaultModalOpen: boolean;
  isThemeCustomizationModalOpen: boolean;
}

const initialState: UIState = {
  theme: 'system',
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  isNotificationsOpen: false,
  isProfileMenuOpen: false,
  isConfessionModalOpen: false,
  isReportModalOpen: false,
  isDeleteModalOpen: false,
  isEditModalOpen: false,
  isShareModalOpen: false,
  isSettingsModalOpen: false,
  isPremiumModalOpen: false,
  isPrivateVaultModalOpen: false,
  isThemeCustomizationModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    toggleNotifications: (state) => {
      state.isNotificationsOpen = !state.isNotificationsOpen;
    },
    toggleProfileMenu: (state) => {
      state.isProfileMenuOpen = !state.isProfileMenuOpen;
    },
    toggleConfessionModal: (state) => {
      state.isConfessionModalOpen = !state.isConfessionModalOpen;
    },
    toggleReportModal: (state) => {
      state.isReportModalOpen = !state.isReportModalOpen;
    },
    toggleDeleteModal: (state) => {
      state.isDeleteModalOpen = !state.isDeleteModalOpen;
    },
    toggleEditModal: (state) => {
      state.isEditModalOpen = !state.isEditModalOpen;
    },
    toggleShareModal: (state) => {
      state.isShareModalOpen = !state.isShareModalOpen;
    },
    toggleSettingsModal: (state) => {
      state.isSettingsModalOpen = !state.isSettingsModalOpen;
    },
    togglePremiumModal: (state) => {
      state.isPremiumModalOpen = !state.isPremiumModalOpen;
    },
    togglePrivateVaultModal: (state) => {
      state.isPrivateVaultModalOpen = !state.isPrivateVaultModalOpen;
    },
    toggleThemeCustomizationModal: (state) => {
      state.isThemeCustomizationModalOpen = !state.isThemeCustomizationModalOpen;
    },
    closeAllModals: (state) => {
      state.isConfessionModalOpen = false;
      state.isReportModalOpen = false;
      state.isDeleteModalOpen = false;
      state.isEditModalOpen = false;
      state.isShareModalOpen = false;
      state.isSettingsModalOpen = false;
      state.isPremiumModalOpen = false;
      state.isPrivateVaultModalOpen = false;
      state.isThemeCustomizationModalOpen = false;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  toggleMobileMenu,
  toggleNotifications,
  toggleProfileMenu,
  toggleConfessionModal,
  toggleReportModal,
  toggleDeleteModal,
  toggleEditModal,
  toggleShareModal,
  toggleSettingsModal,
  togglePremiumModal,
  togglePrivateVaultModal,
  toggleThemeCustomizationModal,
  closeAllModals,
} = uiSlice.actions;

export default uiSlice.reducer; 