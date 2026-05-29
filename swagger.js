const swagger = require('swagger-jsdoc');

const options = {
    definition: {
        openapi:'3.0.0',
        info: {
            title: 'Feastsync',
            version: '1.0.0',
            description: 'swagger documentation'
        },
        servers: [
            // {
            //     url: 'https://splita-z88o.onrender.com',
            //     description: 'The hosted route'
            // },
            {
                url: 'http://localhost:2500',
                description: 'localhost route'
            }
        ],
        components: {
        securitySchemes: { 
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    }
},
    
    apis: [
        './docs/user.yaml',
        './docs/group.yaml'
    ]
    
}
module.exports = swagger(options)