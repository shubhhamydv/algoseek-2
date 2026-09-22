export const OLLAMA_OFFLINE_MESSAGE = "Ollama is offline. Start Ollama and install the configured models before using AI features.";

export function canRunAiMutation(status: { available: boolean } | undefined, loading: boolean) {
  return !loading && status?.available === true;
}
