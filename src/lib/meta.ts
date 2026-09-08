/**
 * Integração Meta — Pixel + API de Conversões (CAPI)
 *
 * Eventos configurados:
 *  - PageView  → disparado automaticamente pelo código base do Pixel (index.html)
 *  - Lead      → disparado SOMENTE quando a pessoa clica para entrar no grupo
 *                do WhatsApp (botões de CTA)
 *
 * Observação: o Pixel usa o mesmo ID do conjunto de dados (dataset) da CAPI,
 * então os dois canais são deduplicados pelo `event_id` compartilhado.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export const META_PIXEL_ID = "2994094277589682";

/**
 * ID do conjunto de dados (dataset) da API de Conversões.
 * Normalmente é o mesmo ID do Pixel — altere apenas se usar um dataset separado.
 */
const CAPI_DATASET_ID = META_PIXEL_ID;

/** Versão atual da Graph API usada pela API de Conversões */
const GRAPH_API_VERSION = "v25.0";

/**
 * Token da API de Conversões (Events Manager → Configurações → Conversions API
 * → "Gerar token de acesso").
 *
 * Se preferir manter o token fora do código, defina a variável de ambiente
 * VITE_META_CAPI_TOKEN no build — ela tem prioridade sobre o valor abaixo.
 */
const CAPI_TOKEN_FALLBACK =
  "EAALnWSJcgOcBSd4VSZBLwfkZCvuVoYrXLDYO6ZCCdxW55B7s0ivcBODl4lrZCs01BMvTTd6BJF7Q888BwgX8m0q4e6uxTAkIxuAwJjGBEU4HQyjgiQjUWGqCVgzPk9yZAg1uEwPRSZBj7uO64er6nPLSaJpk9Ka0Ay1aiJ1jJZCOh9ZADYp4qxubyXzub7oMLZAwT1AZDZD";

const CAPI_ACCESS_TOKEN =
  (
    import.meta as unknown as {
      env?: Record<string, string | undefined>;
    }
  ).env?.VITE_META_CAPI_TOKEN ?? CAPI_TOKEN_FALLBACK;

/** Parâmetros enviados junto com o evento Lead */
const LEAD_PARAMS = {
  content_name: "Grupo VIP PROMO PERFUMES",
  content_category: "grupo_whatsapp",
} as const;

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

function getFbp() {
  return getCookie("_fbp");
}

function getFbc() {
  return getCookie("_fbc");
}

function uuid(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Envia o mesmo evento para a API de Conversões (server-side style), usando o
 * mesmo `event_id` do Pixel para que o Meta faça a deduplicação.
 */
function sendConversionsApiEvent(eventId: string) {
  if (!CAPI_ACCESS_TOKEN) return; // token não configurado: segue só com o Pixel

  const userData: Record<string, string> = {
    client_user_agent: navigator.userAgent,
  };

  const fbp = getFbp();
  if (fbp) userData.fbp = fbp;

  const fbc = getFbc();
  if (fbc) userData.fbc = fbc;

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: window.location.href,
        action_source: "website",
        user_data: userData,
        custom_data: { ...LEAD_PARAMS },
      },
    ],
  };

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${CAPI_DATASET_ID}/events?access_token=${encodeURIComponent(CAPI_ACCESS_TOKEN)}`;
  const body = JSON.stringify(payload);

  try {
    // sendBeacon: não sofre bloqueio de CORS e continua mesmo se a página
    // for substituída pelo app do WhatsApp
    if (typeof navigator.sendBeacon === "function") {
      const sent = navigator.sendBeacon(
        url,
        new Blob([body], { type: "text/plain" }),
      );
      if (sent) return;
    }

    void fetch(url, {
      method: "POST",
      body,
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain" },
    });
  } catch {
    /* falhas de rede não devem impedir o redirecionamento */
  }
}

let lastLeadEventId: string | null = null;
let lastLeadAt = 0;
const DEDUPE_WINDOW_MS = 5 * 60 * 1000;

/**
 * Dispara o evento Lead (Pixel + API de Conversões).
 * Chamado exclusivamente no clique dos botões de entrada no grupo.
 */
export function trackWhatsAppLead() {
  const now = Date.now();

  // Reaproveita o event_id por alguns minutos para o Meta deduplicar cliques repetidos
  let eventId = lastLeadEventId;
  if (!eventId || now - lastLeadAt > DEDUPE_WINDOW_MS) {
    eventId = uuid();
    lastLeadEventId = eventId;
  }
  lastLeadAt = now;

  // Pixel (browser)
  if (typeof window.fbq === "function") {
    window.fbq("track", "Lead", { ...LEAD_PARAMS }, { eventID: eventId });
  }

  // API de Conversões (mesmo event_id => deduplicação)
  sendConversionsApiEvent(eventId);
}
