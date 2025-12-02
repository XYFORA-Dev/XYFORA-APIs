import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {

    const spec = createSwaggerSpec({
        apiFolder: "src/app/api",
        definition: {
            openapi: "3.0.0",
            info: {
                title: "XYFORA APIs",
                version: "1.0.0",
                description: "REST API documentation for XYFORA web application.",
                contact: {
                    name: "XYFORA",
                    email: "info@xyfora.se",
                },
            },
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
            security: [{ BearerAuth: [] }],
            tags: [
                {
                    name: "Auth",
                    description: "Endpoints for user authentication, registration, and session management."
                },
                {
                    name: "Products",
                    description: "Endpoints for creating, retrieving, and managing products."
                }
            ]
        },
    });

    return spec;

};