// tests/mocks/auth.mock.ts
import type { FastifyRequest } from "fastify";

export const requireAuth = async (
  req: FastifyRequest,
  reply: any,
): Promise<void> => {
  const authHeader = req.headers["authorization"];

  if (authHeader === "Bearer admin-token") {
    req.user = { userId: "1", role: "ADMIN" };
  } else if (authHeader === "Bearer user-token") {
    req.user = { userId: "2", role: "USER" };
  } else {
    reply
      .status(401)
      .send({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
  }
};

export const requireRole = (role: string) => {
  return async (req: FastifyRequest, reply: any): Promise<void> => {
    if (!req.user) {
      reply
        .status(401)
        .send({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
      return;
    }
    if (req.user.role !== role) {
      reply
        .status(403)
        .send({ error: { code: "FORBIDDEN", message: "Forbidden" } });
      return;
    }
  };
};
