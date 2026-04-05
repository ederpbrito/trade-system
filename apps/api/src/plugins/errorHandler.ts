import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { ZodError } from "zod";
import { sendError } from "../shared/errors.js";

const errorHandlerPlugin: FastifyPluginAsync = async (app) => {
  app.setErrorHandler((err, request, reply) => {
    const requestId = request.requestId;

    if (err instanceof ZodError) {
      return sendError(
        reply,
        400,
        "VALIDATION_ERROR",
        err.issues.map((e) => e.message).join("; "),
        requestId,
      );
    }

    const e = err as Error & { statusCode?: number };
    const statusCode =
      typeof e.statusCode === "number" ? e.statusCode : 500;

    if (statusCode < 500) {
      return sendError(
        reply,
        statusCode,
        "REQUEST_ERROR",
        e.message || "Pedido inválido.",
        requestId,
      );
    }

    request.log.error({ err: e, requestId }, e.message);
    return sendError(reply, 500, "INTERNAL_ERROR", "Erro interno do servidor.", requestId);
  });
};

export default fp(errorHandlerPlugin, { name: "error-handler" });
