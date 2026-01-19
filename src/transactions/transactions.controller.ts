import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a transaction (Payment or Charge)' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created and balance updated.',
  })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all transactions' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.transactionsService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by id' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Post(':id/reverse')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Reverse a transaction' })
  reverse(@Param('id') id: string) {
    return this.transactionsService.reverse(id);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get monthly dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns collected, spent, and units in debt.',
  })
  getDashboard() {
    return this.transactionsService.getDashboardSummary();
  }

  @Get('statement')
  @ApiOperation({ summary: 'Get account statement for a unit by year' })
  getAccountStatement(@Body() body: { unitId: string; year: number }) {
    return this.transactionsService.getAccountStatement(body.unitId, body.year);
  }
}
