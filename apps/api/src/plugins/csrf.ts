import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { sendError } from "../shared/errors.js";

const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Path sem query e sem slash final (excepto raiz). Alinha com o cliente HTTP. */
function normalizedPathname(url: string): string {
  const pathOnly = url.split("?")[0] ?? "";
  const trimmed = pathOnly.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

const csrfPlugin: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.url.startsWith("/api/v1")) return;
    if (!mutationMethods.has(request.method)) return;
    if (normalizedPathname(request.url) === "/api/v1/auth/login") return;

    const header = request.headers["x-csrf-token"];
    const sessionToken = request.session.get("csrfToken") as string | undefined;
    if (typeof header !== "string" || !sessionToken || header !== sessionToken) {
      return sendError(
        reply,
        403,
        "CSRF_INVALID",
        "Token CSRF em falta ou inválido. Obtenha um token em GET /api/v1/auth/csrf.",
        request.requestId,
      );
    }
  });
};

export default fp(csrfPlugin, { name: "csrf-protection" });
