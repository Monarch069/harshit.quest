const STATIC_CACHE = "public, max-age=86400, stale-while-revalidate=604800";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (url.protocol === "http:") {
      url.protocol = "https:";
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

    return new Response(response.body, {
      status,
      statusText: response.statusText,
      headers
    });
  }
};
