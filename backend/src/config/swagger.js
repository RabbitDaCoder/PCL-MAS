// Generates the OpenAPI spec from JSDoc comments on route files (see interfaces/http/routes/*.js).
const swaggerJsdoc = require("swagger-jsdoc");
const env = require("./env");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "PCL-MAS Backend API",
      version: "1.0.0",
      description:
        "REST API for the PCL-MAS platform (students, lecturers, classes, materials, AI orchestration). All responses use a standard { success, data|message, error } envelope.",
    },
    servers: [{ url: `http://localhost:${env.port}/api/v1` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            message: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            error: {
              type: "object",
              properties: { code: { type: "string" } },
            },
          },
        },
      },
    },
  },
  apis: ["./src/interfaces/http/routes/*.js"],
});

module.exports = swaggerSpec;
