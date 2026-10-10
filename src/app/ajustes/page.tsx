import { getNotificationSettings } from "@/lib/settings";
import Shell from "../Shell";
import TestNotifyButton from "../TestNotifyButton";
import NotificationForm from "./NotificationForm";

export const revalidate = 0;

export default async function SettingsPage() {
  const settings = await getNotificationSettings();
  const telegramConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  return (
    <Shell>
      <div className="inventory-heading"><div><p className="ed-kicker">A tu ritmo</p><h1 className="ed-title">Ajustes de avisos</h1><p className="inventory-subtitle">Elige cuándo quieres recibir los recordatorios en Telegram.</p></div></div>
      <div className="settings-layout">
        <NotificationForm initial={settings} />
        <aside className="telegram-status">
          <p className="ed-kicker">Conexión</p><h2>Telegram</h2>
          <p className={telegramConfigured ? "tone-success" : "tone-warning"}>{telegramConfigured ? "Configurado en el servidor" : "Pendiente de configurar"}</p>
          <p className="report-description">{telegramConfigured ? "Envía una prueba para comprobar que el bot puede escribir en tu chat." : "Añade TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID a las variables del servidor para recibir avisos."}</p>
          <TestNotifyButton />
          <p className="report-description">La prueba envía un mensaje al momento y no afecta a los recordatorios.</p>
        </aside>
      </div>
    </Shell>
  );
}
