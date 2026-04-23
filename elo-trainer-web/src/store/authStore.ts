// Store d'authentification avec email

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = 'https://elo-booster-api.vercel.app';

interface AuthState {
  email: string | null;
  isPremium: boolean;
  premiumUntil: string | null;
  plan: string | null;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string) => Promise<void>;
  logout: () => void;
  checkPremium: () => Promise<void>;
  subscribe: (plan: 'monthly' | 'yearly') => Promise<void>;
  manageSubscription: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      email: null,
      isPremium: false,
      premiumUntil: null,
      plan: null,
      isLoading: false,
      error: null,
      
      login: async (email: string) => {
        const emailLower = email.toLowerCase().trim();
        
        // Validation basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailLower)) {
          set({ error: 'Email invalide' });
          return;
        }
        
        set({ email: emailLower, error: null });
        
        // Vérifier le statut premium
        await get().checkPremium();
      },
      
      logout: () => {
        set({ 
          email: null, 
          isPremium: false, 
          premiumUntil: null, 
          plan: null,
          error: null 
        });
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
    }
  )
);
