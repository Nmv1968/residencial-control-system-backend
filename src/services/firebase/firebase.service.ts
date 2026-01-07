import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService {
  private storage: admin.storage.Storage;

  constructor() {
    // Evitamos inicializarlo dos veces si el módulo se recarga
    if (!admin.apps.length) {
      const serviceAccount = require(path.resolve('firebase-key.json')); // Ruta a tu JSON

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'demoecommerce-45118223-6d7fd.firebasestorage.app', // ¡Búscalo en Firebase Console -> Storage!
      });
    }
    this.storage = admin.storage();
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucket = this.storage.bucket();

    // Generamos un nombre único para no sobrescribir (ej: timestamp-nombreoriginal)
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });

      stream.on('finish', async () => {
        // Opción A: Hacer el archivo público y obtener la URL
        await fileUpload.makePublic();

        // Esta es la URL pública que guardarás en tu Base de Datos
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      });

      stream.end(file.buffer);
    });
  }
}
