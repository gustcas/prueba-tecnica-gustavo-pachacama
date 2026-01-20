import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Gestion Seguros',
            version: '1.0.0'
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                LoginRequest: {
                    type: 'object',
                    properties: {
                        identifier: { type: 'string' },
                        password: { type: 'string' }
                    },
                    required: ['identifier', 'password']
                },
                UserCreate: {
                    type: 'object',
                    properties: {
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        identification: { type: 'string' },
                        password: { type: 'string' },
                        roleId: { type: 'string', format: 'uuid' }
                    },
                    required: ['firstName', 'lastName', 'identification', 'password', 'roleId']
                },
                ClientCreate: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', enum: ['individual', 'company'] },
                        identificationType: { type: 'string', enum: ['cedula', 'pasaporte'] },
                        identification: { type: 'string' },
                        email: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        companyName: { type: 'string' },
                        companySize: { type: 'string', enum: ['pymes', 'large'] },
                        phone: { type: 'string' },
                        address: { type: 'string' }
                    }
                },
                InsuranceTypeCreate: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        segment: { type: 'string' },
                        minAmount: { type: 'number' },
                        maxAmount: { type: 'number' }
                    },
                    required: ['name', 'segment', 'minAmount', 'maxAmount']
                },
                ClientInsuranceCreate: {
                    type: 'object',
                    properties: {
                        clientId: { type: 'string', format: 'uuid' },
                        insuranceTypeId: { type: 'string', format: 'uuid' },
                        amount: { type: 'number' }
                    },
                    required: ['clientId', 'insuranceTypeId', 'amount']
                }
            }
        },
        security: [{ bearerAuth: [] }],
        paths: {
            '/api/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Login',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
                    },
                    responses: { '200': { description: 'OK' }, '400': { description: 'Bad Request' } }
                }
            },
            '/api/auth/logout': {
                post: {
                    tags: ['Auth'],
                    summary: 'Logout',
                    responses: { '200': { description: 'OK' }, '400': { description: 'Bad Request' } }
                }
            },
            '/api/auth/me/summary': {
                get: {
                    tags: ['Auth'],
                    summary: 'Resumen de sesion',
                    responses: { '200': { description: 'OK' } }
                }
            },
            '/api/users': {
                get: { tags: ['Users'], summary: 'Listar usuarios', responses: { '200': { description: 'OK' } } },
                post: {
                    tags: ['Users'],
                    summary: 'Crear usuario',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/UserCreate' } } }
                    },
                    responses: { '201': { description: 'Created' }, '400': { description: 'Bad Request' } }
                }
            },
            '/api/clients': {
                get: { tags: ['Clients'], summary: 'Listar clientes', responses: { '200': { description: 'OK' } } },
                post: {
                    tags: ['Clients'],
                    summary: 'Crear cliente',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/ClientCreate' } } }
                    },
                    responses: { '201': { description: 'Created' }, '400': { description: 'Bad Request' } }
                }
            },
            '/api/insurance-types': {
                get: { tags: ['InsuranceTypes'], summary: 'Listar tipos', responses: { '200': { description: 'OK' } } },
                post: {
                    tags: ['InsuranceTypes'],
                    summary: 'Crear tipo',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/InsuranceTypeCreate' } } }
                    },
                    responses: { '201': { description: 'Created' }, '400': { description: 'Bad Request' } }
                }
            },
            '/api/client-insurances': {
                get: { tags: ['ClientInsurances'], summary: 'Listar polizas', responses: { '200': { description: 'OK' } } },
                post: {
                    tags: ['ClientInsurances'],
                    summary: 'Asignar poliza',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/ClientInsuranceCreate' } } }
                    },
                    responses: { '201': { description: 'Created' }, '400': { description: 'Bad Request' } }
                }
            },
            '/api/services': {
                get: { tags: ['Services'], summary: 'Listar servicios', responses: { '200': { description: 'OK' } } },
                post: { tags: ['Services'], summary: 'Crear servicio', responses: { '201': { description: 'Created' } } }
            },
            '/api/dashboard/metrics': {
                get: { tags: ['Dashboard'], summary: 'Metricas', responses: { '200': { description: 'OK' } } }
            }
        }
    },
    apis: []
});
