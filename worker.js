const STATIC_CACHE = "public, max-age=86400, stale-while-revalidate=604800";
// Headers from ssg 1.0's generated worker (docs/deploy.md#headers); X-SSG-Version stays off.
const PAGE_CACHE = "public, max-age=300";
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // One hop to the canonical origin, whether the visitor came in on www, http, or both.
    if (url.protocol === "http:" || url.hostname === "www.harshit.quest") {
      url.protocol = "https:";
      url.hostname = "harshit.quest";

      // Directory pages get their trailing slash in the same hop.
      if (!path.endsWith("/") && (await env.ASSETS.fetch(new URL(`${path}/index.html`, url))).ok)
        url.pathname = `${path}/`;

      return Response.redirect(url.toString(), 301);
    }

    if (!path.endsWith("/")) {
      const exact = await env.ASSETS.fetch(request);

      if (exact.status !== 404) {
        const headers = new Headers(exact.headers);
        headers.set("Cache-Control", STATIC_CACHE);

        return new Response(exact.body, {
          status: exact.status,
          statusText: exact.statusText,
          headers
        });
      }

      // ssg publishes foo.md as foo/index.*, so /foo is a directory: canonicalize to /foo/.
      const index = await env.ASSETS.fetch(new URL(`${path}/index.html`, url));

      if (index.ok) {
        url.pathname = `${path}/`;
        return Response.redirect(url.toString(), 301);
      }
    }

    const accept = request.headers.get("Accept") ?? "";

    let extension = ".txt";

    if (accept.includes("text/html")) {
      extension = ".html";
    } else if (accept.includes("text/markdown")) {
      extension = ".md";
    }

    const assetUrl = new URL(request.url);
    assetUrl.pathname = path.endsWith("/")
      ? `${path}index${extension}`
      : `/404/index${extension}`;

    let response = await env.ASSETS.fetch(new Request(assetUrl, request));
    let status = response.status;

    if (status === 404) {
      assetUrl.pathname = `/404/index${extension}`;
      response = await env.ASSETS.fetch(new Request(assetUrl, request));
    }

    if (assetUrl.pathname.startsWith("/404/")) status = 404;

    const headers = new Headers(response.headers);
    headers.set("Vary", "Accept");
    headers.set("Content-Type", TYPES[extension]);
    headers.set("X-SSG-Format", extension.slice(1));

    if (status === 200) {
      headers.set("Cache-Control", PAGE_CACHE);

      if (extension === ".html")
        headers.set("Link", `<${path}index.md>; rel="alternate"; type="text/markdown"`);
    }

    return new Response(response.body, {
      status,
      statusText: response.statusText,
      headers
    });
  }
};
