// Page Premium avec login email et abonnement Stripe

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import './PremiumScreen.css';

export function PremiumScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, lang } = useLanguage();
  const { 
    email, 
    isPremium, 
    premiumUntil, 
    plan,
    isLoading, 
    error,
    login, 
    logout, 
    checkPremium,
    subscribe,
    manageSubscription 
  } = useAuthStore();
  const { setPremium } = useGameStore();
  
  const [emailInput, setEmailInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Vérifier le retour de Stripe
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      checkPremium();
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams, checkPremium]);
  
  // Synchroniser le premium avec gameStore
  useEffect(() => {
    setPremium({ isPremium, source: isPremium ? 'subscription' : undefined });
  }, [isPremium, setPremium]);
  
  // Vérifier le premium au chargement si connecté
  useEffect(() => {
    if (email) {
      checkPremium();
    }
  }, [email, checkPremium]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(emailInput);
  };
  
  const handleLogout = () => {
    logout();
    setPremium({ isPremium: false });
    setEmailInput('');
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="premium-screen">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← {t('back')}
      </button>

      <div className="premium-container">
        {/* Message de succès Stripe */}
        {showSuccess && (
          <div className="success-banner">
            🎉 {lang === 'fr' ? 'Paiement réussi ! Bienvenue dans Premium.' : 'Payment successful! Welcome to Premium.'}
          </div>
        )}
        
        {/* Si connecté et Premium */}
        {email && isPremium && (
          <div className="premium-active">
            <div className="premium-badge-large">👑</div>
            <h1>{t('youArePremium')}</h1>
            <p className="premium-email">{email}</p>
            <p className="premium-details">
              {lang === 'fr' ? 'Abonnement' : 'Subscription'}: <strong>{plan === 'yearly' ? (lang === 'fr' ? 'Annuel' : 'Yearly') : (lang === 'fr' ? 'Mensuel' : 'Monthly')}</strong>
              <br />
              {lang === 'fr' ? 'Valide jusqu\'au' : 'Valid until'}: <strong>{formatDate(premiumUntil)}</strong>
            </p>
            <p className="premium-enjoy">{t('enjoyFeatures')}</p>
            
            <div className="premium-actions">
              <button className="btn-manage" onClick={manageSubscription} disabled={isLoading}>
                {lang === 'fr' ? '⚙️ Gérer mon abonnement' : '⚙️ Manage subscription'}
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                {lang === 'fr' ? 'Déconnexion' : 'Log out'}
              </button>
            </div>
          </div>
        )}
        
        {/* Si connecté mais pas Premium */}
        {email && !isPremium && (
          <>
            <div className="logged-in-header">
              <p className="logged-as">{lang === 'fr' ? 'Connecté :' : 'Logged in:'} <strong>{email}</strong></p>
              <button className="btn-logout-small" onClick={handleLogout}>
                {lang === 'fr' ? 'Déconnexion' : 'Log out'}
              </button>
            </div>
            
            <h1>{t('goPremium')}</h1>
            <p className="premium-subtitle">{t('unlockAll')}</p>

            {/* Avantages */}
            <div className="benefits-list">
              <div className="benefit">
                <span className="benefit-icon">♟️</span>
                <div>
                  <h3>{t('playBlack')}</h3>
                  <p>{t('playBothColors')}</p>
                </div>
              </div>
              <div className="benefit">
                <span className="benefit-icon">📊</span>
                <div>
                  <h3>{t('depth20')}</h3>
                  <p>{t('beyondFirst5')}</p>
                </div>
              </div>
              <div className="benefit">
                <span className="benefit-icon">♾️</span>
                <div>
                  <h3>{t('unlimited')}</h3>
                  <p>{t('noDaily')}</p>
                </div>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🔍</span>
                <div>
                  <h3>{t('detailedReview')}</h3>
                  <p>{t('analyzeEach')}</p>
                </div>
              </div>
            </div>

            {/* Choix d'abonnement */}
            <div className="subscription-options">
              <div className="subscription-card" onClick={() => subscribe('monthly')}>
                <h3>{lang === 'fr' ? 'Mensuel' : 'Monthly'}</h3>
                <div className="price">
                  <span className="amount">3€</span>
                  <span className="period">/{lang === 'fr' ? 'mois' : 'month'}</span>
                </div>
                <button className="btn-subscribe" disabled={isLoading}>
                  {isLoading ? '...' : (lang === 'fr' ? 'Choisir' : 'Select')}
                </button>
              </div>
              
              <div className="subscription-card popular" onClick={() => subscribe('yearly')}>
                <div className="popular-badge">{lang === 'fr' ? '2 mois offerts' : '2 months free'}</div>
                <h3>{lang === 'fr' ? 'Annuel' : 'Yearly'}</h3>
                <div className="price">
                  <span className="amount">24€</span>
                  <span className="period">/{lang === 'fr' ? 'an' : 'year'}</span>
                </div>
                <p className="savings">{lang === 'fr' ? 'Soit 2€/mois' : 'Only €2/month'}</p>
                <button className="btn-subscribe" disabled={isLoading}>
                  {isLoading ? '...' : (lang === 'fr' ? 'Choisir' : 'Select')}
                </button>
              </div>
            </div>
            
            {error && <p className="error-message">{error}</p>}
            
            <p className="secure-note">
              🔒 {lang === 'fr' ? 'Paiement sécurisé par Stripe • Annulation à tout moment' : 'Secure payment by Stripe • Cancel anytime'}
            </p>
          </>
        )}
        
        {/* Si pas connecté */}
        {!email && (
          <>
            <h1>{t('goPremium')}</h1>
            <p className="premium-subtitle">{t('unlockAll')}</p>

            {/* Avantages */}
            <div className="benefits-list">
              <div className="benefit">
                <span className="benefit-icon">♟️</span>
                <div>
                  <h3>{t('playBlack')}</h3>
                  <p>{t('playBothColors')}</p>
                </div>
              </div>
              <div className="benefit">
                <span className="benefit-icon">📊</span>
                <div>
                  <h3>{t('depth20')}</h3>
                  <p>{t('beyondFirst5')}</p>
                </div>
              </div>
              <div className="benefit">
                <span className="benefit-icon">♾️</span>
                <div>
                  <h3>{t('unlimited')}</h3>
                  <p>{t('noDaily')}</p>
                </div>
              </div>
            </div>

            {/* Formulaire de connexion */}
            <div className="login-section">
              <h2>{lang === 'fr' ? 'Connectez-vous pour continuer' : 'Log in to continue'}</h2>
              <form onSubmit={handleLogin} className="login-form">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={lang === 'fr' ? 'Votre email' : 'Your email'}
                  required
                />
                <button type="submit" className="btn-login" disabled={isLoading}>
                  {isLoading ? '...' : (lang === 'fr' ? 'Continuer' : 'Continue')}
                </button>
              </form>
              {error && <p className="error-message">{error}</p>}
              <p className="login-note">
                {lang === 'fr' 
                  ? 'Pas de mot de passe. Votre email sert uniquement à retrouver votre abonnement.' 
                  : 'No password needed. Your email is only used to retrieve your subscription.'}
              </p>
            </div>
            
            {/* Prix */}
            <div className="pricing-preview">
              <p>{lang === 'fr' ? 'À partir de' : 'Starting at'} <strong>3€/{lang === 'fr' ? 'mois' : 'month'}</strong></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
