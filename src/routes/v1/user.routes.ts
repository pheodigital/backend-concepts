// src/routes/v1/user.routes.ts
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { requireRole } from "../../common/middleware/role.middleware";
import { validate } from "../../common/middleware/validator.middleware";
import { CommonErrorResponses } from "../../common/swagger/error.swager";
import {
  UserSchema,
  UsersArraySchema,
  getUserParamsJsonSchema,
} from "../../common/swagger/user.schema";
import { UserController } from "../../controllers/v1/user.controller";
import { getUserParamsSchema } from "../../validators/user.validator";

// Define the param type for type safety
interface UserIdParams {
  Params: {
    id: string;
  };
}

export async function userRoutesV1(app: FastifyInstance) {
  // Encapsulate routes under a plugin scope so hooks do not bleed globally.
  app.register(async (instance) => {
    // Auth for all user routes
    instance.addHook("preHandler", requireAuth);

    // GET /users - Admin only (no params, no typing needed)
    instance.get(
      "/users",
      {
        preHandler: [requireRole("ADMIN")],
        schema: {
          description: "Get all users (Admin only)",
          tags: ["Users"],
          summary: "Get all user",
          security: [{ bearerAuth: [] }],
          response: {
            200: UsersArraySchema,
            ...CommonErrorResponses,
          },
        },
      },
      UserController.getAllUsers,
    );

    // GET /users/:id - Fixed with explicit typing
    instance.get<UserIdParams>(
      "/users/:id",
      {
        preHandler: [validate(getUserParamsSchema, "params")],
        schema: {
          description: "Get a single user by ID",
          tags: ["Users"],
          summary: "Get user by id",
          security: [{ bearerAuth: [] }],
          params: getUserParamsJsonSchema,
          response: {
            200: UserSchema,
            ...CommonErrorResponses,
          },
        },
      },
      UserController.getUserById,
    );
  });
}
