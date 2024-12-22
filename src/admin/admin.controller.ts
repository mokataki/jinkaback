import {Controller, Get, Post, Patch, Body, Param, Query, Delete} from '@nestjs/common';
import { AdminService } from './admin.service';
import {AddProductDto, AdjustInventoryDto} from "./dto/admin.dto";
import {UpdateProductDto} from "../products/dto/update-product.dto";
import {ProductsService} from "../products/products.service";

@Controller('admin')
export class AdminController {
  constructor(
      private readonly adminService: AdminService,
  private readonly productsService: ProductsService
  ) {}

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(@Param('id') id: number, @Body('status') status: string) {
    return this.adminService.updateOrderStatus(+id, status);
  }

  @Post('shipping')
  async addShippingMethod(@Body() data: any) {
    return this.adminService.addShippingMethod(data);
  }

  @Get('shipping')
  async getShippingMethods() {
    return this.adminService.getShippingMethods();
  }

  @Post()
  async addProduct(@Body() addProductDto: AddProductDto) {
    return this.productsService.addProduct(addProductDto);
  }

  @Delete(':productId')

  async removeProduct(@Param('productId') productId: string) {
    const id = parseInt(productId, 10);
    return this.productsService.removeProduct(id);
  }

  @Patch(':productId')
  async updateProduct(
      @Param('productId') productId: string,
      @Body() updateProductDto: UpdateProductDto,
  ) {
    const id = parseInt(productId, 10);
    return this.productsService.removeProduct(id);
  }

  @Patch(':productId/inventory')
  async adjustInventory(
      @Param('productId') productId: string,
      @Body() adjustDto: AdjustInventoryDto,
      @Query('increase') increase: string,
  ) {
    const isIncrease = increase === 'true';
    return this.productsService.adjustInventory(productId, adjustDto, isIncrease);
}}
