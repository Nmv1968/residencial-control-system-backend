import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto, UpdateMovementDto } from './movements.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Movements')
@Controller('movements')
@ApiBearerAuth()
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  @ApiOperation({
    summary: 'Register new movement (Charge/Credit) (Admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Movement registered and balance updated.',
  })
  @ApiResponse({ status: 400, description: 'Period closed or invalid data.' })
  create(@Body() createMovementDto: CreateMovementDto) {
    return this.movementsService.create(createMovementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get movements with filters (Public)' })
  @ApiQuery({
    name: 'housing',
    required: false,
    description: 'Filter by Housing ID',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Filter by Period ID',
  })
  findAll(
    @Query('housing') housing?: string,
    @Query('period') period?: string,
  ) {
    const query: any = {};
    if (housing) query.housing = housing;
    if (period) query.period = period;
    return this.movementsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movement by ID (Public)' })
  findOne(@Param('id') id: string) {
    return this.movementsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update movement details (Concept/Observation only) (Admin only)',
  })
  update(
    @Param('id') id: string,
    @Body() updateMovementDto: UpdateMovementDto,
  ) {
    return this.movementsService.update(id, updateMovementDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete movement (Restricted/Admin only) - Prefer Reversal',
  })
  remove(@Param('id') id: string) {
    return this.movementsService.remove(id);
  }
}
