import { decodeJwt } from "$lib/utils/jwt";
import type { User } from "$lib/features/auth/types";
import { authService } from "$lib/features/auth/services/auth.service";

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
    init: async () => {
      if (typeof localStorage === "undefined") {
        return;
      }

      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Primero decodificamos localmente para una respuesta rápida en UI
          const payload = decodeJwt(token);
          if (payload) {
            isAuthenticated = true;
            user = {
              userId: payload.sub as string,
              email: payload.email as string,
              role: (payload.role as string) || "user",
            };

            // Luego verificamos con el servidor para obtener los datos completos (name, profileImage, etc)
            const result = await authService.verifyToken(token);
            if (result.success && result.data && result.data.valid) {
              const userData = result.data.user;
              user = {
                ...userData,
                userId: userData.id || userData.userId || "",
              };
            } else {
              isAuthenticated = false;
              user = null;
              localStorage.removeItem("token");
            }
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
