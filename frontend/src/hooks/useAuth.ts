import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, clearToken, getToken, setToken, unwrap } from "../services/api";

export interface AuthCreator {
  id: string;
  username: string;
  displayName: string;
  email: string;
  lightningAddress?: string;
}

export interface AuthResult {
  token: string;
  creator: AuthCreator;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  displayName: string;
  bio?: string;
  mobileMoneyNetwork: "MTN" | "MPS";
  mobileMoneyNumber: string;
}

export function useCurrentCreator() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => unwrap<AuthCreator>(api.get("/auth/me")),
    enabled: Boolean(getToken()),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => unwrap<AuthResult>(api.post("/auth/login", input)),
    onSuccess: (result) => {
      setToken(result.token);
      queryClient.setQueryData(["me"], result.creator);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => unwrap<AuthResult>(api.post("/auth/register", input)),
    onSuccess: (result) => {
      setToken(result.token);
      queryClient.setQueryData(["me"], result.creator);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    clearToken();
    queryClient.setQueryData(["me"], null);
    queryClient.clear();
  };
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
