const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin.json');

const app = express();
const port = process.env.PORT || 3000;

// Inicializar Firebase Admin con las credenciales del archivo JSON
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(express.json());

app.post('/', async (req, res) => {

    // Extraer token y datos de la solicitud
    const token = req.body.token;
    const data = req.body.data;

    // Imprimir los datos recibidos desde Postman para verificar
    console.log('Datos recibidos:');
    console.log('Token:', token);
    console.log('Datos del mensaje:', data);

    // Verificar si el token está presente
    if (token && token.length > 0) {

        try {
            // Crear el mensaje que se enviará
            const message = {
                tokens: token, // Asegúrate de que "token" sea un array
                data: {
                    title: data.title,
                    body: data.body
                }
            };

            // Imprimir el mensaje antes de enviarlo para verificar la estructura
            console.log('Mensaje preparado para enviar:', message);

            // Enviar la notificación utilizando Firebase Admin SDK
            const response = await admin.messaging().sendEachForMulticast(message);

            // Imprimir la respuesta de Firebase para ver cuántas notificaciones fueron enviadas con éxito
            console.log('Respuesta de Firebase:', response);

            // Verificar la respuesta de Firebase para detectar errores detallados
            if (response.responses && response.responses.length > 0) {
                const firebaseError = response.responses[0].error;
                if (firebaseError) {
                    console.log('Error detallado de Firebase:', firebaseError);
                }
            }

            // Responder al cliente con un mensaje de éxito
            res.json({
                message: 'Notificación enviada con éxito',
                success: response.successCount
            });

        } catch (error) {
            // Imprimir cualquier error que ocurra durante el proceso
            console.error('Error al enviar las notificaciones:', error);
            res.status(500).json({
                error: 'Error al enviar las notificaciones',
                detail: error.message
            });
        }

    } else {
        // Si el token no es válido o está vacío
        console.log('Token no proporcionado o vacío');
        res.status(400).json({ error: 'Token no válido o vacío' });
    }
});

// Iniciar el servidor en el puerto especificado
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
