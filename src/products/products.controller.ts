import { Controller, Patch, Param, Body, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Patch(':id/inventory')
  async adjustInventory(
      @Param('id') productId: string,
      @Body('quantity') quantity: number,
  ) {
    if (typeof quantity !== 'number') {
      throw new BadRequestException('Quantity must be a number');
    }
    const id = parseInt(productId, 10);
    return this.productsService.adjustInventory(id, quantity);

  }
}
