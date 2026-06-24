import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON payloads
  app.use(express.json());

  // In-memory runtime database for our preview app
  const urlStore = new Map<string, { originalUrl: string; createdAt: string }>();

  // Add a sample URL on boot for immediate visibility to the user
  urlStore.set("google", {
    originalUrl: "https://google.com",
    createdAt: new Date().toISOString()
  });
  urlStore.set("aistud", {
    originalUrl: "https://ai.studio/build",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  });

  // API Endpoint: Shorten a long URL
  app.post("/api/urls", (req, res) => {
    let { originalUrl } = req.body;
    if (!originalUrl) {
      return res.status(400).json({ error: "Original URL cannot be blank" });
    }

    originalUrl = originalUrl.trim();
    // Prefix protocols if missing
    if (!originalUrl.startsWith("http://") && !originalUrl.startsWith("https://")) {
      originalUrl = "https://" + originalUrl;
    }

    try {
      new URL(originalUrl);
    } catch (e) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Generate unique shortKey
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let shortKey = "";
    let attempts = 0;
    do {
      if (attempts > 10) {
        return res.status(500).json({ error: "Key generation namespace depleted" });
      }
      shortKey = "";
      for (let i = 0; i < 6; i++) {
        shortKey += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      attempts++;
    } while (urlStore.has(shortKey));

    const createdAt = new Date().toISOString();
    urlStore.set(shortKey, { originalUrl, createdAt });

    // Host app URL automatically injected by AI Studio
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const cleanAppUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
    const shortUrl = `${cleanAppUrl}/r/${shortKey}`;

    res.status(201).json({
      shortKey,
      originalUrl,
      shortUrl,
      createdAt
    });
  });

  // API Endpoint: Get all shortened URLs, sorted newest first
  app.get("/api/urls", (req, res) => {
    const list = Array.from(urlStore.entries()).map(([shortKey, value]) => {
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      const cleanAppUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
      const shortUrl = `${cleanAppUrl}/r/${shortKey}`;
      return {
        shortKey,
        originalUrl: value.originalUrl,
        shortUrl,
        createdAt: value.createdAt
      };
    });

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(list);
  });

  // Direct redirection endpoint: r/:shortKey
  app.get("/r/:shortKey", (req, res) => {
    const { shortKey } = req.params;
    const item = urlStore.get(shortKey);

    if (!item) {
      return res.status(404).send(`
        <!doctype html>
        <html>
          <head>
            <title>Link Not Found | URL Shortener</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background-color: #0f172a;
                color: #e2e8f0;
              }
              .box {
                text-align: center;
                max-width: 440px;
                padding: 3rem 2rem;
                background: #1e293b;
                border-radius: 1rem;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
                border: 1px solid #334155;
              }
              h1 {
                color: #f43f5e;
                font-size: 1.75rem;
                margin-top: 0;
                margin-bottom: 1rem;
              }
              p {
                color: #94a3b8;
                margin-bottom: 2rem;
                line-height: 1.6;
              }
              a {
                display: inline-block;
                background-color: #3b82f6;
                color: white;
                padding: 0.75rem 1.5rem;
                text-decoration: none;
                border-radius: 0.5rem;
                font-weight: 500;
                transition: background-color 0.2s;
              }
              a:hover {
                background-color: #2563eb;
              }
            </style>
          </head>
          <body>
            <div class="box">
              <h1>Link Not Found</h1>
              <p>The shortened identifier <strong>"${shortKey}"</strong> does not correspond to any active original URL mapped in our system.</p>
              <a href="/">Go Back to Dashboard</a>
            </div>
          </body>
        </html>
      `);
    }

    // Carry out HTTP 302 Found redirect
    res.redirect(302, item.originalUrl);
  });

  // Serve static UI assets or bind Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Binding Vite Development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to 0.0.0.0 and process on port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully operative under Port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical server boot failure:", error);
});
