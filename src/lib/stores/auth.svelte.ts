import { decodeJwt } from "$lib/utils/jwt";
import type { User } from "$lib/features/auth/types";

function createAuthStore() {
  let isAuthenticated = $state(false);
  let user = $state<User | null>(null);

  return {
    get isAuthenticated() {
      return isAuthenticated;
    },
    get user() {
      return user;
    },
    setAuthenticated: (value: boolean) => {
      isAuthenticated = value;
    },
    setUser: (value: User | null) => {
      user = value;
    },
    init: () => {
      if (typeof localStorage === "undefined") {
        return;
      }

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = decodeJwt(token);
          if (payload) {
            isAuthenticated = true;
            user = {
              userId: payload.sub as string,
              email: payload.email as string,
              role: (payload.role as string) || "user",
            };
          } else {
            localStorage.removeItem("token");
            isAuthenticated = false;
            user = null;
          }
        } catch (error) {
          console.error("Token init failed", error);
          localStorage.removeItem("token");
          isAuthenticated = false;
          user = null;
        }
      } else {
        isAuthenticated = false;
        user = null;
      }
    },
    logout: () => {
      isAuthenticated = false;
      user = null;
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  };
}

export const authState = createAuthStore();
