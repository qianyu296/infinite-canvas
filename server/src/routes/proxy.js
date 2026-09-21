export function setupProxyRoute(app) {
  app.all("/api/proxy/*", async (req, res) => {
    try {
      const targetUrl = decodeURIComponent(req.params[0] || "");
      if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
        return res.status(400).json({ error: "Invalid target URL" });
      }

      const url = new URL(targetUrl);
      const fetchOptions = {
        method: req.method,
        headers: {},
        redirect: "follow",
      };

      if (req.method !== "GET" && req.method !== "HEAD") {
        fetchOptions.body = JSON.stringify(req.body);
        fetchOptions.headers["content-type"] = "application/json";
      }

      for (const [key, value] of Object.entries(req.headers)) {
        if (key === "host" || key === "connection" || key === "content-length") continue;
        fetchOptions.headers[key] = value;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      fetchOptions.signal = controller.signal;

      const response = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeout);

      const contentType = response.headers.get("content-type") || "application/json";
      res.set("content-type", contentType);

      const body = await response.arrayBuffer();
      res.status(response.status).send(Buffer.from(body));
    } catch (error) {
      res.status(502).json({ error: error.message });
    }
  });
}
