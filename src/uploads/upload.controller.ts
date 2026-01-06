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
import { diskStorage } from 'multer';
import { extname } from 'path';

// Helper for file filter
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
  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Upload a file (image/pdf)' })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: { example: { url: '/uploads/file.png' } },
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: fileFilter,
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is not provided');
    }
    // Return relative path or full URL.
    // Assuming static serve on root or /uploads.
    // I will return the path relative to the static root.
    return { url: `/uploads/${file.filename}` };
  }
}
