import { Prisma } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { unitMasterRepository } from './unit-master.repository';
import { CreateUnitMasterInput, UpdateUnitMasterInput } from './unit-master.validation';

export class UnitMasterService {
  async createUnit(data: CreateUnitMasterInput) {
    const existing = await unitMasterRepository.findByName(data.name);
    if (existing) {
      throw new AppError(`Unit "${data.name}" already exists`, 409);
    }

    return await unitMasterRepository.create({
      name: data.name,
      banglaName: data.banglaName,
      category: data.category,
      isDefault: data.isDefault ?? false,
    });
  }

  async getUnits(query: { search?: string; category?: string }) {
    const where: Prisma.UnitMasterWhereInput = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { banglaName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const units = await unitMasterRepository.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return units;
  }

  async getUnitById(id: string) {
    const unit = await unitMasterRepository.findById(id);
    if (!unit) {
      throw new AppError('Unit not found', 404);
    }
    return unit;
  }

  async updateUnit(id: string, data: UpdateUnitMasterInput) {
    await this.getUnitById(id);

    if (data.name) {
      const existing = await unitMasterRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new AppError(`Unit "${data.name}" already exists`, 409);
      }
    }

    return await unitMasterRepository.update(id, data);
  }

  async deleteUnit(id: string) {
    await this.getUnitById(id);
    return await unitMasterRepository.delete(id);
  }
}

export const unitMasterService = new UnitMasterService();
