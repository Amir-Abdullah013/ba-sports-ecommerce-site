import { useState, useEffect } from 'react';
import { useSession, signIn, signOut, getSession } from 'next-auth/react';

export const useAccounts = () => {
  const { data: session, status, update } = useSession();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved accounts from localStorage
  useEffect(() => {
    const savedAccounts = localStorage.getItem('userAccounts');
    if (savedAccounts) {
      try {
        const parsed = JSON.parse(savedAccounts);
        setAccounts(parsed.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed)));
      } catch (error) {
        console.error('Error parsing saved accounts:', error);
        setAccounts([]);
      }
    }
  }, [session]);

  // Add new account
  const addAccount = async () => {
    setIsLoading(true);
    try {
      // Sign in with Google and force account selection
      await signIn('google', {
        prompt: 'select_account',
        callbackUrl: window.location.pathname
      });
    } catch (error) {
      console.error('Error adding account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to a different account
  const switchAccount = async (targetAccount) => {
    if (!targetAccount || targetAccount.email === session?.user?.email) {
      return; // Already using this account
    }

    setIsLoading(true);
    try {
      // Update the target account's last used time
      const updatedAccounts = accounts.map(acc => 
        acc.email === targetAccount.email 
          ? { ...acc, lastUsed: new Date().toISOString() }
          : acc
      );
      setAccounts(updatedAccounts);
      localStorage.setItem('userAccounts', JSON.stringify(updatedAccounts));

      // Sign out current session and sign in with new account
      await signOut({ redirect: false });
      
      // Small delay to ensure sign out is complete
      setTimeout(() => {
        signIn('google', {
          prompt: 'none',
          login_hint: targetAccount.email,
          callbackUrl: window.location.pathname
        });
      }, 100);
    } catch (error) {
      console.error('Error switching account:', error);
      // Fallback: force account selection
      signIn('google', {
        prompt: 'select_account',
        callbackUrl: window.location.pathname
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove account from saved accounts
  const removeAccount = (accountEmail) => {
    const filteredAccounts = accounts.filter(acc => acc.email !== accountEmail);
    setAccounts(filteredAccounts);
    localStorage.setItem('userAccounts', JSON.stringify(filteredAccounts));

    // If removing current account, sign out
    if (session?.user?.email === accountEmail) {
      signOut();
    }
  };

  // Get current account info
  const currentAccount = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    picture: session.user.image
  } : null;

  // Get other accounts (not currently active)
  const otherAccounts = accounts.filter(acc => acc.email !== session?.user?.email);

  return {
    // Current session data
    session,
    status,
    currentAccount,
    
    // Account management
    accounts,
    otherAccounts,
    addAccount,
    switchAccount,
    removeAccount,
    
    // Loading state
    isLoading,
    
    // Utility functions
    hasMultipleAccounts: accounts.length > 1,
    totalAccounts: accounts.length
  };
};
