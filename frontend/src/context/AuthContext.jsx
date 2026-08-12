// App-wide auth state: fetches the current user from GET /auth/me (never decodes the JWT
// client-side) whenever a session token is present, and exposes login/logout that keep this
// state in sync with the stored session.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getSession,
  clearSession,
  getMe,
  login as loginRequest,
  logout as logoutRequest,
} from "../services/authService";
import { disconnectAllSockets } from "../services/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() =>
    Boolean(getSession()?.accessToken),
  );

  useEffect(() => {
    const session = getSession();
    if (!session?.accessToken) return;

    getMe()
      .then((currentUser) => setUser(currentUser))
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async ({ role, email, password }) => {
    const { user: loggedInUser } = await loginRequest({
      role,
      email,
      password,
    });
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    disconnectAllSockets();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
