import { getRepository, getCustomRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type == 'outcome' && total < value) {
      throw new AppError('Você não tem saldo suficiente', 400);
    }

    let categoryIfExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryIfExists) {
      categoryIfExists = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryIfExists);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryIfExists,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
