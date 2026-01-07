// src/services/firebase.module.ts (o donde organices tus módulos)
import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService], // <--- ¡IMPORTANTE! Exportarlo para que otros lo usen
})
export class FirebaseModule {}
