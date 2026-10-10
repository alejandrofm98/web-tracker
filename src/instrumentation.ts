export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { default: cron } = await import("node-cron");
    const { checkExpirations } = await import("@/lib/check");
    const { getNotificationSettings } = await import("@/lib/settings");
    const { isNotificationTime } = await import("@/lib/notification-settings");
    cron.schedule("* * * * *", async () => {
      try {
        const now = new Date();
        const settings = await getNotificationSettings();
        if (!isNotificationTime(settings, now)) return;
        const r = await checkExpirations(now, settings);
        console.log("cron diario", JSON.stringify(r));
      } catch (e) {
        console.error("cron diario error", e);
      }
    }, { timezone: "Europe/Madrid", noOverlap: true });
    console.log("Avisos registrados: horario configurable en Ajustes (Europe/Madrid)");
  }
}
