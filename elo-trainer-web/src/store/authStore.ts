// Auth store with email verification

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGameStore } from './gameStore';

const API_URL = 'https://elo-booster-api.vercel.app';

interface AuthState {
  email: string | null;
  token: string | null;
  tokenExpiresAt: string | null;
  isPremium: boolean;
  premiumUntil: string | null;
  plan: string | null;
  isLoading: boolean;
  error: string | null;
  pendingEmail: string | null;
  
  sendCode: (email: string, language?: string) => Promise<boolean>;
  verifyCode: (code: string) => Promise<boolean>;
  verifyToken: () => Promise<boolean>;
  logout: () => void;
  checkPremium: () => Promise<void>;
  subscribe: (plan: 'monthly' | 'yearly') => Promise<void>;
  manageSubscription: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      email: null,
      token: null,
      tokenExpiresAt: null,
      isPremium: false,
      premiumUntil: null,
      plan: null,
      isLoading: false,
      error: null,
      pendingEmail: null,
      
      sendCode: async (email: string, language: string = 'fr') => {
        const emailLower = email.toLowerCase().trim();
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailLower)) {
          set({ error: 'Email invalide' });
          return false;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_URL}/api/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailLower, language }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            set({ error: data.error || 'Erreur envoi code', isLoading: false });
            return false;
          }
          
          set({ pendingEmail: emailLower, isLoading: false });
          return true;
          
        } catch (error) {
          set({ error: 'Erreur réseau', isLoading: false });
          return false;
        }
      },
      
      verifyCode: async (code: string) => {
        const { pendingEmail } = get();
        
        if (!pendingEmail) {
          set({ error: 'Pas d\'email en attente' });
          return false;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_URL}/api/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: pendingEmail, code }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            set({ error: data.error || 'Code invalide', isLoading: false });
            return false;
          }
          
          set({ 
            email: data.email,
            token: data.token,
            tokenExpiresAt: data.expiresAt,
            pendingEmail: null,
            isLoading: false,
            error: null,
          });
          
          await get().checkPremium();
          
          return true;
          
        } catch (error) {
          set({ error: 'Erreur réseau', isLoading: false });
          return false;
        }
      },
      
      verifyToken: async () => {
        const { token } = get();
        
        if (!token) {
          return false;
        }
        
        try {
          const response = await fetch(`${API_URL}/api/verify-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          
          const data = await response.json();
          
          if (!response.ok || !data.valid) {
            get().logout();
            return false;
          }
          
          set({
            email: data.email,
            isPremium: data.isPremium,
            premiumUntil: data.premiumUntil,
            plan: data.plan,
            tokenExpiresAt: data.expiresAt,
          });
          
          return true;
          
        } catch (error) {
          return false;
        }
      },
      
      logout: () => {
        set({ 
          email: null, 
          token: null,
          tokenExpiresAt: null,
          isPremium: false, 
          premiumUntil: null, 
          plan: null,
          error: null,
          pendingEmail: null,
        });
        useGameStore.getState().resetStats();
      },
      
      checkPremium: async () => {
        const { email } = get();
        if (!email) return;
        
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_URL}/api/check-premium?email=${encodeURIComponent(email)}`);
          const data = await response.json();
          
          set({
            isPremium: data.premium || false,
            premiumUntil: data.premiumUntil || null,
            plan: data.plan || null,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error checking premium:', error);
          set({ isLoading: false });
        }
      },
      
      subscribe: async (plan: 'monthly' | 'yearly') => {
        const { email } = get();
        if (!email) {
          set({ error: 'Veuillez vous connecter d\'abord' });
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_URL}/api/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email, 
              plan,
              successUrl: window.location.origin + '/app/premium?success=true',
              cancelUrl: window.location.origin + '/app/premium?canceled=true',
            }),
          });
          
          const data = await response.json();
          
          if (data.url) {
            window.location.href = data.url;
          } else {
            set({ error: data.error || 'Erreur lors de la création du paiement', isLoading: false });
          }
        } catch (error) {
          console.error('Subscribe error:', error);
          set({ error: 'Erreur de connexion', isLoading: false });
        }
      },
      
      manageSubscription: async () => {
        const { email } = get();
        if (!email) return;
        
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_URL}/api/create-portal-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email,
              returnUrl: window.location.origin + '/app/premium',
            }),
          });
          
          const data = await response.json();
          
          if (data.url) {
            window.location.href = data.url;
          } else {
            set({ error: data.error || 'Erreur', isLoading: false });
          }
        } catch (error) {
          console.error('Portal error:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'elo-trainer-auth',
      partialize: (state) => ({
        email: state.email,
        token: state.token,
        tokenExpiresAt: state.tokenExpiresAt,
        isPremium: state.isPremium,
        premiumUntil: state.premiumUntil,
        plan: state.plan,
      }),
    }
  )
);
