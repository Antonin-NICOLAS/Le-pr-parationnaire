import fs from 'fs'
import swaggerSpec from './swagger.config.js'

const generateSwaggerFile = () => {
  fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2))
  console.log('Fichier Swagger généré avec succès')
}

export default generateSwaggerFile
