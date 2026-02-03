import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Register a payment' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List all payments' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('unit/:unitId')
  @ApiOperation({ summary: 'Get payments by unit (public)' })
  findAllByUnit(@Param('unitId') unitId: string) {
    return this.paymentsService.findAllByUnit(unitId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by id (public)' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
