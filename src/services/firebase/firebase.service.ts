import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private storage: admin.storage.Storage;

  constructor() {
    const adminConfig: admin.ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    };
    // Evitamos inicializarlo dos veces si el módulo se recarga
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(adminConfig),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
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
