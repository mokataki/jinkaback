import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from "../../prisma/prisma.service";
import slugify from '@sindresorhus/slugify'; // Import slugify

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  // ایجاد برند جدید
  async create(createBrandDto: CreateBrandDto) {
    try {
      const existingBrand = await this.findOneByName(createBrandDto.brandName);
      if (existingBrand) {
        throw new BadRequestException(`برندی با نام '${createBrandDto.brandName}' قبلاً وجود دارد!`);
      }

      const slug = slugify(createBrandDto.brandName);

      const brand = await this.prisma.brand.create({
        data: {
          ...createBrandDto,
          slug, // اضافه کردن slug تولید شده
        },
      });

      return {
        message: 'برند با موفقیت ایجاد شد!',
        brand,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // به‌روزرسانی برند موجود
  async update(identifier: string, updateBrandDto: UpdateBrandDto) {
    try {
      // بررسی اینکه شناسه عددی است یا slug
      const isId = !isNaN(Number(identifier));
      let brandExisting;

      if (isId) {
        brandExisting = await this.findOne(Number(identifier)); // جستجو بر اساس ID
      } else {
        brandExisting = await this.findOneBySlug(identifier); // جستجو بر اساس slug
      }

      if (!brandExisting) {
        throw new NotFoundException(`برندی با شناسه '${identifier}' پیدا نشد!`);
      }

      const slug = slugify(updateBrandDto.brandName || brandExisting.brandName);

      const updatedBrand = await this.prisma.brand.update({
        where: { id: brandExisting.id },
        data: {
          ...updateBrandDto,
          slug, // به‌روزرسانی با slug جدید
        },
      });

      return {
        message: 'برند با موفقیت به‌روزرسانی شد!',
        brand: updatedBrand,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // پیدا کردن برند بر اساس نام
  async findOneByName(brandName: string) {
    try {
      return await this.prisma.brand.findUnique({
        where: { brandName },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  // پیدا کردن برند بر اساس slug
  async findOneBySlug(slug: string) {
    try {
      return await this.prisma.brand.findUnique({
        where: { slug },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  // پیدا کردن تمام برندها
  async findAll() {
    try {
      return await this.prisma.brand.findMany();
    } catch (error) {
      this.handleError(error);
    }
  }

  // پیدا کردن برند بر اساس ID
  async findOne(id: number) {
    try {
      const brand = await this.prisma.brand.findUnique({
        where: { id },
      });

      if (!brand) {
        throw new NotFoundException(`برند با ID ${id} وجود ندارد!`);
      }

      return brand;
    } catch (error) {
      this.handleError(error);
    }
  }

  // حذف برند بر اساس ID
  async remove(identifier: string) {
    try {
      const isId = !isNaN(Number(identifier));
      let brandExisting;

      if (isId) {
        brandExisting = await this.findOne(Number(identifier)); // جستجو بر اساس ID
      } else {
        brandExisting = await this.findOneBySlug(identifier); // جستجو بر اساس slug
      }

      if (!brandExisting) {
        throw new NotFoundException(`برندی با شناسه '${identifier}' پیدا نشد!`);
      }

      const brand = await this.prisma.brand.delete({
        where: { id: brandExisting.id },
      });

      return {
        message: 'برند با موفقیت حذف شد!',
        brand,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // پیدا کردن برند با هر شناسه (ID یا slug)
  async findBrandByIdentifier(identifier: string) {
    try {
      const isId = !isNaN(Number(identifier));
      let brand;

      if (isId) {
        brand = await this.findOne(Number(identifier)); // جستجو بر اساس ID
      } else {
        brand = await this.findOneBySlug(identifier); // جستجو بر اساس slug
      }

      if (!brand) {
        throw new NotFoundException(`برندی با شناسه '${identifier}' پیدا نشد!`);
      }

      return brand;
    } catch (error) {
      this.handleError(error);
    }
  }

  // مدیریت خطاها
  private handleError(error: any) {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;  // دوباره پرتاب کردن خطاهای شناخته‌شده
    }

    if (error.code === 'P2002') { // کد خطای منحصر به فرد در Prisma
      throw new BadRequestException('برندی با این نام قبلاً وجود دارد!');
    }

    // برای خطاهای ناشناخته، خطا را در کنسول ثبت کرده و یک خطای عمومی پرتاب می‌کنیم
    console.error(error);
    throw new Error('یک خطای غیرمنتظره رخ داده است.');
  }
}
