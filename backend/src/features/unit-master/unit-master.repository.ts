import { Prisma, UnitMaster } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BaseRepository } from '../../common/repositories/base.repository';

export class UnitMasterRepository extends BaseRepository {

  async create(data: Prisma.UnitMasterCreateInput, tx?: Prisma.TransactionClient): Promise<UnitMaster> {
    return await this.getDb(tx).unitMaster.create({ data });
  }

  async findById(id: string, tx?: Prisma.TransactionClient): Promise<UnitMaster | null> {
    return await this.getDb(tx).unitMaster.findUnique({ where: { id } });
  }

  async findByName(name: string, tx?: Prisma.TransactionClient): Promise<UnitMaster | null> {
    return await this.getDb(tx).unitMaster.findUnique({ where: { name } });
  }

  async findMany(params: {
    where?: Prisma.UnitMasterWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.UnitMasterOrderByWithRelationInput;
  }): Promise<UnitMaster[]> {
    return await prisma.unitMaster.findMany(params);
  }

  async count(where?: Prisma.UnitMasterWhereInput): Promise<number> {
    return await prisma.unitMaster.count({ where });
  }

  async update(id: string, data: Prisma.UnitMasterUpdateInput, tx?: Prisma.TransactionClient): Promise<UnitMaster> {
    return await this.getDb(tx).unitMaster.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tx?: Prisma.TransactionClient): Promise<UnitMaster> {
    return await this.getDb(tx).unitMaster.delete({ where: { id } });
  }
}

export const unitMasterRepository = new UnitMasterRepository();
