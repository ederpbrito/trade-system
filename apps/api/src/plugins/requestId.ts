import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { randomUUID } from "node:crypto";

declare module "fastify" {
  interface FastifyRequest {
    requestId: string;
  }
}

const requestIdPlugin: FastifyPluginAsync = async (app) => {
  app.decorateRequest("requestId", "");

  app.addHook("onRequest", async (request) => {
    const incoming = request.headers["x-request-id"];
    const id =
      typeof incoming === "string" && incoming.length > 0 && incoming.length <= 128
        ? incoming
        : randomUUID();
    request.requestId = id;
    request.log = request.log.child({ requestId: id });
  });
};

export default fp(requestIdPlugin, { name: "request-id" });
