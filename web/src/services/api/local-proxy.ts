import i18n from "@/i18n";
import { DEFAULT_API_BASE_URL } from "@/stores/use-config-store";

/** The backend health endpoint doubles as a reachability check. */
export async function testLocalProxy(proxyUrl: string) {
    const base = proxyUrl || DEFAULT_API_BASE_URL;
    if (!base) throw new Error(i18n.t("config.proxy.missingUrl"));
    const response = await fetch(`${base}/api/health`, { cache: "no-store" });
    if (!response.ok) throw new Error(i18n.t("config.proxy.unreachable"));
    const data = (await response.json().catch(() => null)) as { status?: string } | null;
    if (!data?.status) throw new Error(i18n.t("config.proxy.unreachable"));
    return `Backend ${data.status}`;
}