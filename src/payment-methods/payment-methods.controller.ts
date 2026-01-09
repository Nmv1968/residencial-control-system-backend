import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/create-payment-method.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('payment-methods')
@Controller('payment-methods')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class PaymentMethodsController {
  constructor(private readonly service: PaymentMethodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment method' })
  create(@Body() createDto: CreatePaymentMethodDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List active payment methods' })
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment method' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePaymentMethodDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate payment method' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
