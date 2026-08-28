import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "../services/api";

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}

export function useCreator(username: string | undefined) {
  return useQuery({
    queryKey: ["creator", username],
    queryFn: () => unwrap<Creator>(api.get(`/creators/${username}`)),
    enabled: Boolean(username),
    retry: false,
  });
}
