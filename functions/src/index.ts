import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

admin.initializeApp();

export const helloWorld = functions.https.onRequest((request, response) => {
  const apiKey = process.env.API_KEY || 'no definida';
  functions.logger.info("Hello logs!", {structuredData: true, apiKeyUsed: apiKey});
  response.send(`Hola mundo desde Firebase! Tu API_KEY es: ${apiKey}`);
});
