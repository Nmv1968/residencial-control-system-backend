import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HousingService } from './housing.service';
import { CreateHousingDto, UpdateHousingDto } from './housing.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Housing')
@Controller('housing')
@ApiBearerAuth()
export class HousingController {
  constructor(private readonly housingService: HousingService) {}

  @Post()
  @ApiOperation({ summary: 'Create new housing (Admin only)' })
  create(@Body() createHousingDto: CreateHousingDto) {
    return this.housingService.create(createHousingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all housing units (Public)' })
  findAll() {
    return this.housingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get housing by ID (Public)' })
  findOne(@Param('id') id: string) {
    return this.housingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update housing (Admin only)' })
  update(@Param('id') id: string, @Body() updateHousingDto: UpdateHousingDto) {
    return this.housingService.update(id, updateHousingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete housing (Admin only)' })
  remove(@Param('id') id: string) {
    return this.housingService.remove(id);
  }
}
