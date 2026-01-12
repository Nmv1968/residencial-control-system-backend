import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { CreateContactInfoDto } from './dto/create-contact-info.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('contact-info')
@Controller('contact-info')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class ContactInfoController {
  constructor(private readonly service: ContactInfoService) {}

  @Get()
  @ApiOperation({ summary: 'Get contact information' })
  getContactInfo() {
    return this.service.getContactInfo();
  }

  @Post()
  @ApiOperation({ summary: 'Update contact information' })
  updateContactInfo(@Body() createDto: CreateContactInfoDto) {
    return this.service.updateContactInfo(createDto);
  }
}
