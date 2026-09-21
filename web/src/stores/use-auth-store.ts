import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
    id: string;
    username: string;
    display_name: string;
};

type AuthState = {
    token: string | null;
    user: AuthUser | null;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
    isAuthenticated: boolean;
};

function decodeToken(token: string): { id: string; username: string } | null {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return { id: decoded.id, username: decoded.username };
    } catch {
        return null;
    }
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            login: (token, user) => {
                const decoded = decodeToken(token);
                if (!decoded) return;
                set({ token, user: { id: decoded.id, username: decoded.username, display_name: user.display_name }, isAuthenticated: true });
            },
            logout: () => set({ token: null, user: null, isAuthenticated: false }),
        }),
        {
            name: "infinite-canvas:auth_store",
            partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);

export function getAuthHeader(): Record<string, string> {
    const token = useAuthStore.getState().token;
    return token ? { Authorization: `Bearer ${token}` } : {};
}
