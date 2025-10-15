import pb from '$lib/services/pocketbase';
import type { AuthModel } from 'pocketbase';

// Svelte 5 runes-based auth store
class AuthStore {
  // $state rune creates reactive state
  user = $state<AuthModel | null>(null);
  isAuthenticated = $state<boolean>(false);

  constructor() {
    // Initialize from PocketBase auth store
    this.user = pb.authStore.model;
    this.isAuthenticated = pb.authStore.isValid;

    // Listen for auth changes
    pb.authStore.onChange(() => {
      this.user = pb.authStore.model;
      this.isAuthenticated = pb.authStore.isValid;
    });
  }

  async login(email: string, password: string) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      this.user = authData.record;
      this.isAuthenticated = true;
      return authData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  logout() {
    pb.authStore.clear();
    this.user = null;
    this.isAuthenticated = false;
  }
}

// Export singleton instance
export const authStore = new AuthStore();
