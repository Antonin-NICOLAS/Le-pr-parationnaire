import swaggerJsdoc from 'swagger-jsdoc'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
)
const { version } = pkg

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

export function generateSwaggerFile(
  outputPath: string = path.join(__dirname, 'swagger-output.json'),
) {
  const swaggerSpec = swaggerJsdoc(options)
  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2))
  console.log(`Documentation Swagger générée dans ${outputPath}`)
}
