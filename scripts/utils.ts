export async function withRetry<T>(fn: () => Promise<T>, retries = 8, delay = 6000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      const msg = e?.message ?? "";
      const code = e?.code ?? e?.meta?.code ?? "";
      const isRetryable =
        code === "ETIMEDOUT" ||
        msg.includes("ETIMEDOUT") ||
        msg.includes("terminated") ||
        msg.includes("Connection") ||
        msg.includes("timeout");
      if (i < retries - 1 && isRetryable) {
        console.log(`DB not ready, retrying in ${delay / 1000}s... (${i + 1}/${retries})`);
        await new Promise((r) => setTimeout(r, delay));
      } else throw e;
    }
  }
  throw new Error("Max retries reached");
}
