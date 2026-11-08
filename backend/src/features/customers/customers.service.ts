import { Prisma, CustomerLedgerType } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../config/prisma';
import { customerRepository } from './customers.repository';
import { getPagination, buildPaginationMeta, PaginationParams } from '../../common/utils/pagination';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  ReceivePaymentInput,
  AdjustBalanceInput,
} from './customers.validation';

export class CustomerService {
  /**
   * Create a new customer with optional opening balance
   */
  async createCustomer(data: CreateCustomerInput) {
    if (data.phone) {
      const existing = await customerRepository.findByPhone(data.phone);
      if (existing) {
        throw new AppError(`Customer with phone number "${data.phone}" already exists`, 409);
      }
    }

    const openingDue = new Prisma.Decimal(data.openingDue || 0);

    return await prisma.$transaction(async (tx) => {
      const customer = await customerRepository.create(
        {
          name: data.name,
          phone: data.phone || null,
          address: data.address || null,
          customerType: data.customerType,
          currentDue: openingDue,
        },
        tx
      );

      // If there is an opening balance, record an initial ledger entry
      if (!openingDue.isZero()) {
        await customerRepository.createLedgerEntry(
          {
            customer: { connect: { id: customer.id } },
            entryType: CustomerLedgerType.OPENING_BALANCE,
            debit: openingDue.greaterThan(0) ? openingDue : new Prisma.Decimal(0),
            credit: openingDue.lessThan(0) ? openingDue.abs() : new Prisma.Decimal(0),
            balanceAfter: openingDue,
            note: openingDue.greaterThan(0) ? 'পূর্বের বকেয়া হিসাব শুরু' : 'পূর্বের অগ্রিম জমা হিসাব শুরু',
          },
          tx
        );
      }

      return customer;
    });
  }

  /**
   * Get customers list with search, due filtering, and pagination
   */
  async getCustomers(query: {
    search?: string;
    customerType?: string;
    dueFilter?: 'all' | 'dueOnly' | 'advanceOnly' | 'cleared';
  } & PaginationParams) {
    const { page, limit, skip } = getPagination(query);

    const where: Prisma.CustomerWhereInput = {
      isActive: true,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.customerType) {
      where.customerType = query.customerType as any;
    }

    if (query.dueFilter === 'dueOnly') {
      where.currentDue = { gt: 0 };
    } else if (query.dueFilter === 'advanceOnly') {
      where.currentDue = { lt: 0 };
    } else if (query.dueFilter === 'cleared') {
      where.currentDue = { equals: 0 };
    }

    const [total, customers] = await Promise.all([
      customerRepository.count(where),
      customerRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { currentDue: 'desc' }, // Top debtors first
      }),
    ]);

    return {
      customers,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get customer details by ID
   */
  async getCustomerById(id: string) {
    const customer = await customerRepository.findByIdWithDetails(id);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    return customer;
  }

  /**
   * Update customer profile
   */
  async updateCustomer(id: string, data: UpdateCustomerInput) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    if (data.phone && data.phone !== customer.phone) {
      const existing = await customerRepository.findByPhone(data.phone);
      if (existing) {
        throw new AppError(`Customer with phone number "${data.phone}" already exists`, 409);
      }
    }

    return await customerRepository.update(id, {
      ...(data.name && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.customerType && { customerType: data.customerType }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    });
  }

  /**
   * Cash collection / Payment received from customer (বাকি আদায় / জমা)
   */
  async receivePayment(customerId: string, data: ReceivePaymentInput) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const paymentAmount = new Prisma.Decimal(data.amount);

    return await prisma.$transaction(async (tx) => {
      // Deduct from current due (can become negative if paying advance)
      const updatedCustomer = await customerRepository.updateDue(
        customerId,
        paymentAmount.negated(),
        tx
      );

      const ledgerEntry = await customerRepository.createLedgerEntry(
        {
          customer: { connect: { id: customerId } },
          entryType: CustomerLedgerType.PAYMENT_RECEIVED,
          debit: new Prisma.Decimal(0),
          credit: paymentAmount,
          balanceAfter: updatedCustomer.currentDue,
          note: data.note || 'নগদ বকেয়া জমা গ্রহণ',
        },
        tx
      );

      return {
        customer: updatedCustomer,
        ledgerEntry,
      };
    });
  }

  /**
   * Customer balance manual adjustment (ছাড় / হিসাব সমন্বয়)
   */
  async adjustBalance(customerId: string, data: AdjustBalanceInput) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const delta = new Prisma.Decimal(data.amount);

    return await prisma.$transaction(async (tx) => {
      const updatedCustomer = await customerRepository.updateDue(customerId, delta, tx);

      const ledgerEntry = await customerRepository.createLedgerEntry(
        {
          customer: { connect: { id: customerId } },
          entryType: CustomerLedgerType.ADJUSTMENT,
          debit: delta.greaterThan(0) ? delta : new Prisma.Decimal(0),
          credit: delta.lessThan(0) ? delta.abs() : new Prisma.Decimal(0),
          balanceAfter: updatedCustomer.currentDue,
          note: `হিসাব সমন্বয়: ${data.reason}`,
        },
        tx
      );

      return {
        customer: updatedCustomer,
        ledgerEntry,
      };
    });
  }

  /**
   * Get complete statement history for a customer
   */
  async getCustomerLedger(customerId: string, query: PaginationParams) {
    await this.getCustomerById(customerId);

    const { page, limit, skip } = getPagination(query, 30);
    const where: Prisma.CustomerLedgerWhereInput = { customerId };

    const [total, entries] = await Promise.all([
      customerRepository.countLedgerEntries(where),
      customerRepository.findLedgerEntries({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      entries,
      meta: buildPaginationMeta(total, page, limit),
    };
  }
}

export const customerService = new CustomerService();
