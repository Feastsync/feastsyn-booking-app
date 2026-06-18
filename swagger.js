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
            {
                url: 'https://feastsyn-booking-app.onrender.com',
                description: 'The hosted route'
            },
            {
                url: 'http://localhost:4900',
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
        './docs/vendor.yaml',
        './docs/pricing.yaml', 
        './docs/booking.yaml',
        './docs/payment.yaml',
        './docs/kyc.yaml',
        './docs/notification.yaml',
        './docs/message.yaml',
        './docs/review.yaml',
        './docs/dispute.yaml',
        './docs/contact.yaml',
        './docs/calendar.yaml',
        './docs/vendorSetting.yaml' 
        // './docs/admin.yaml'
    ]
    
} 
module.exports = swagger(options)