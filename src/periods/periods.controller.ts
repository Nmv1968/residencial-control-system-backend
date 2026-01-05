import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto, UpdatePeriodDto } from './periods.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Periods')
@Controller('periods')
@ApiBearerAuth()
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new accounting period (Admin only)' })
  create(@Body() createPeriodDto: CreatePeriodDto) {
    return this.periodsService.create(createPeriodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all periods (Public)' })
  findAll() {
    return this.periodsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get period by ID (Public)' })
  findOne(@Param('id') id: string) {
    return this.periodsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update period status (e.g. Close) (Admin only)' })
  @ApiResponse({ status: 200, description: 'Period updated.' })
  update(@Param('id') id: string, @Body() updatePeriodDto: UpdatePeriodDto) {
    return this.periodsService.update(id, updatePeriodDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete period (Admin only)' })
  remove(@Param('id') id: string) {
    return this.periodsService.remove(id);
  }
}
