export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { default: cron } = await import("node-cron");
    const { checkExpirations } = await import("@/lib/check");
    cron.schedule("0 9 * * *", async () => {
      try {
        const r = await checkExpirations();
        console.log("cron diario", JSON.stringify(r));
      } catch (e) {
        console.error("cron diario error", e);
      }
    });
    console.log("cron diario registrado (09:00)");
  }
}
