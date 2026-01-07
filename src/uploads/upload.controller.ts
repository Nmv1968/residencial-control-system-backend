import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FirebaseService } from 'src/services/firebase/firebase.service';

// Helper for file filter (Mantenemos tu filtro, está perfecto)
const fileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
    return callback(
      new BadRequestException(
        'Only image (jpg, png) or pdf files are allowed!',
      ),
      false,
    );
  }
  callback(null, true);
};

@ApiTags('uploads')
@Controller('upload')
export class UploadController {
  // Inyectamos el servicio de Firebase
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Upload a file to Firebase Storage' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      example: { url: 'https://storage.googleapis.com/tu-bucket/imagen.png' },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  // CAMBIO CLAVE AQUÍ:
  @UseInterceptors(
    FileInterceptor('file', {
      // Al quitar 'storage', Multer usa memoryStorage por defecto.
      // Esto nos da acceso a file.buffer
      fileFilter: fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // Opcional: Limite de 5MB por seguridad
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is not provided');
    }

    // Llamamos al servicio que sube el buffer a la nube
    const url = await this.firebaseService.uploadFile(file);

    // Retornamos la URL absoluta de internet
    return { url: url };
  }
}
