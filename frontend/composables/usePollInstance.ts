import type { PollInstance } from "@/types/index";

const API_URL = import.meta.env.VITE_API_URL;

export function usePollInstance() {
  /**
   * Fetch details of a specific poll instance
   */
  const fetchPollInstance = async (
    pollInstanceId: string,
  ): Promise<PollInstance> => {
    const response = await fetch(`${API_URL}/mj/polls/${pollInstanceId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch poll instance: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data as PollInstance;
  };

  /**
   * Fetch the active session for the current MJ user
   */
  const fetchActiveSession = async () => {
    const response = await fetch(`${API_URL}/mj/active-session`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch active session: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  };

  return {
    fetchPollInstance,
    fetchActiveSession,
  };
}
