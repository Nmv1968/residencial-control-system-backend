import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('payments')
@Controller('payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a payment' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all payments' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('unit/:unitId')
  @ApiOperation({ summary: 'Get payments by unit' })
  findAllByUnit(@Param('unitId') unitId: string) {
    return this.paymentsService.findAllByUnit(unitId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by id' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
