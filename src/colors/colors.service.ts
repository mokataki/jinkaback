import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { PrismaService } from "../../prisma/prisma.service";
import slugify from '@sindresorhus/slugify'; // Import slugify

@Injectable()
export class ColorsService {
  constructor(private prisma: PrismaService) {}

  // پیدا کردن رنگ بر اساس نام
  async findOneByName(color: string) {
    return this.prisma.color.findUnique({
      where: { color },
    });
  }

  // پیدا کردن رنگ بر اساس slug
  async findOneBySlug(slug: string) {
    return this.prisma.color.findUnique({
      where: { slug },
    });
  }

  // ایجاد رنگ جدید
  async create(createColorDto: CreateColorDto) {
    try {
      // بررسی اینکه رنگ با نام مشابه وجود دارد یا نه
      const existingColor = await this.findOneByName(createColorDto.color);
      if (existingColor) {
        throw new BadRequestException(`رنگ '${createColorDto.color}' قبلاً وجود دارد!`);
      }

      // تولید slug از نام رنگ
      const slug = slugify(createColorDto.color);

      // ایجاد رنگ در پایگاه داده
      const color = await this.prisma.color.create({
        data: {
          ...createColorDto,
          slug, // اضافه کردن slug تولید شده
        },
      });

      return {
        message: 'رنگ با موفقیت ایجاد شد!',
        color,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // دریافت تمام رنگ‌ها
  async findAll() {
    return this.prisma.color.findMany({
      where: { isDeleted: false },
    });
  }

  // پیدا کردن رنگ بر اساس ID یا slug
  async findOne(identifier: string) {
    try {
      // بررسی اینکه آیا شناسه یک عدد معتبر (ID) است یا خیر
      const isId = !isNaN(Number(identifier));

      let color;
      if (isId) {
        // جستجو بر اساس ID
        color = await this.prisma.color.findUnique({
          where: { id: Number(identifier), isDeleted: false },
        });
      } else {
        // جستجو بر اساس slug
        color = await this.prisma.color.findUnique({
          where: { slug: identifier, isDeleted: false },
        });
      }

      if (!color) {
        throw new NotFoundException(`رنگ با شناسه '${identifier}' پیدا نشد یا حذف شده است!`);
      }

      return color;
    } catch (error) {
      this.handleError(error);
    }
  }

  // به‌روزرسانی رنگ موجود بر اساس ID یا slug
  async update(identifier: string, updateColorDto: UpdateColorDto) {
    try {
      const color = await this.findOne(identifier);
      if (!color) {
        throw new NotFoundException(`رنگ با شناسه '${identifier}' پیدا نشد!`);
      }

      // تولید slug از نام رنگ به‌روزرسانی شده
      const slug = slugify(updateColorDto.color || color.color); // استفاده از نام موجود در صورت عدم به‌روزرسانی رنگ

      const updatedColor = await this.prisma.color.update({
        where: { id: color.id },
        data: {
          ...updateColorDto,
          slug, // به‌روزرسانی با slug تولید شده
        },
      });

      return {
        message: 'رنگ با موفقیت به‌روزرسانی شد!',
        color: updatedColor,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // حذف نرم رنگ بر اساس ID یا slug
  async remove(identifier: string) {
    try {
      const color = await this.findOne(identifier);
      if (!color || color.isDeleted) {
        throw new NotFoundException(`رنگ با شناسه '${identifier}' پیدا نشد یا قبلاً حذف شده است!`);
      }

      const deletedColor = await this.prisma.color.update({
        where: { id: color.id },
        data: { isDeleted: true },
      });

      return {
        message: 'رنگ با موفقیت حذف شد!',
        color: deletedColor,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // مدیریت خطاها
  private handleError(error: any) {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error; // دوباره پرتاب کردن خطاهای شناخته‌شده
    }

    // برای خطاهای ناشناخته، خطا را در کنسول ثبت کرده و یک خطای عمومی پرتاب می‌کنیم
    console.error(error);
    throw new Error('یک خطای غیرمنتظره رخ داده است.');
  }
}
