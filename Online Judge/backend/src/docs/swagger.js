export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Online Judge API",
    version: "1.0.0",
    description: "API documentation for the Online Judge Platform"
  },
  servers: [
    { url: "http://localhost:8000" }
  ],
  paths: {
    "/api/v1/problems": {
      get: {
        summary: "Get all problems",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "difficulty", in: "query", schema: { type: "string" } },
          { name: "tags", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Successful response" }
        }
      }
    }
  }
};
