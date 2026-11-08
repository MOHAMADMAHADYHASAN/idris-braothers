import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export abstract class BaseRepository {
  /**
   * Return active transaction client if provided, otherwise standard singleton Prisma client
   */
  protected getDb(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }
}
