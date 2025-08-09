import swaggerJsdoc from 'swagger-jsdoc'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { version } from '../package.json'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Le Préparationnaire API',
      version,
      description: "Documentation complète de l'API du Préparationnaire",
      contact: {
        name: 'Support',
        email: 'contact@lepreparationnaire.com',
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://api.lepreparationnaire.com'
            : 'http://localhost:8000',
        description: `${process.env.NODE_ENV || 'development'} server`,
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sessionId',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, './schemas/*.ts'),
    path.join(__dirname, './responses/*.ts'),
    path.join(__dirname, './routes/*.ts'),
  ],
}

export default swaggerJsdoc(options)
