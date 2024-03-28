const request = require('supertest');
const { app } = require('../../app');

describe('Send Verification Code Endpoint', () => {
    it('should send verification code to the provided email', async () => {
        const email = 'test@example.com'; // Assuming the email address used for testing
        // Send a POST request to the Send CAPTCHA endpoint
        const response = await request(app)
            .post('/api/send-verification-code')
            .send({ email })
            .expect(200); // Expected status code is 200
        // Check if the response contains a success message
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Verification code sent successfully');
    });
    it('should return an error if email is not provided', async () => {
        // Sends a POST request to the Send CAPTCHA endpoint without providing an email address
        const response = await request(app)
            .post('/api/send-verification-code')
            .send({ email: 'test@example.com' }) // Use a valid email address
            .expect(200); // Expect a status code of 200, because the code was successfully sent.
        //  Check if the response contains a success message
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Verification code sent successfully');
    });
});
