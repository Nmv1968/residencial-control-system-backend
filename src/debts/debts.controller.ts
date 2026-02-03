import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('debts')
@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a single debt manually' })
  create(@Body() createDebtDto: CreateDebtDto) {
    return this.debtsService.create(createDebtDto);
  }

  @Post('generate-bulk')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Generate debts in bulk' })
  generateBulk(@Body() body: any) {
    // Define DTO strictly if needed
    return this.debtsService.generateBulk(body);
  }

  @Get('unit/:unitId')
  @ApiOperation({ summary: 'Get debts by unit (public)' })
  findAllByUnit(@Param('unitId') unitId: string) {
    return this.debtsService.findAllByUnit(unitId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all debts' })
  findAll() {
    return this.debtsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debt by id (public)' })
  findOne(@Param('id') id: string) {
    return this.debtsService.findOne(id);
  }
}
