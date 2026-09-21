import { setupAuthRoutes } from "./auth.js";
import { setupProjectRoutes, setupAssetRoutes } from "./api.js";
import { setupProxyRoute } from "./proxy.js";

export function setupRoutes(app) {
  setupAuthRoutes(app);
  setupProjectRoutes(app);
  setupAssetRoutes(app);
  setupProxyRoute(app);
}
