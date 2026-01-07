import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { FirebaseModule } from 'src/services/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [UploadController],
})
export class UploadModule {}
