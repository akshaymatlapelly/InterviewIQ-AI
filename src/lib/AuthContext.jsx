import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '../api/base44Client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAuth = async () => {
    try {
      setLoading(true);
      const me = await base44.auth.me();
      if (me && me.email) {
        setUser(me);
        // Fetch UserProfile matching user's email
        const profiles = await base44.entities.UserProfile.filter({
          email: me.email
        });
        if (profiles && profiles.length > 0) {
          setProfile(profiles[0]);
        } else {
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user session:", error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  const login = () => {
    base44.auth.loginWithProvider('google', window.location.origin + '/dashboard');
  };

  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const res = await base44.auth.loginViaEmailPassword(email, password);
      if (res && res.user) {
        setUser(res.user);
        const profiles = await base44.entities.UserProfile.filter({
          email: res.user.email
        });
        if (profiles && profiles.length > 0) {
          setProfile(profiles[0]);
        } else {
          setProfile(null);
        }
        return res.user;
      }
      throw new Error("Invalid email or password.");
    } catch (error) {
      console.error("Login email error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email, password, fullName) => {
    try {
      setLoading(true);
      await base44.auth.register({
        email,
        password,
        full_name: fullName
      });
      const res = await base44.auth.loginViaEmailPassword(email, password);
      if (res && res.user) {
        setUser(res.user);
        setProfile(null);
        return res.user;
      }
      throw new Error("Auto login after registration failed.");
    } catch (error) {
      console.error("Register email error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await base44.auth.logout(window.location.origin + '/');
    } catch (e) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const refetchProfile = async () => {
    if (user && user.email) {
      try {
        const profiles = await base44.entities.UserProfile.filter({
          email: user.email
        });
        if (profiles && profiles.length > 0) {
          setProfile(profiles[0]);
          return profiles[0];
        }
      } catch (error) {
        console.error("Error refetching profile:", error);
      }
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      loginWithEmail,
      registerWithEmail,
      logout,
      refetchProfile,
      isAuthenticated: !!user,
      setProfile
    }}>
      {children}
    </AuthContext.Provider>

  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
