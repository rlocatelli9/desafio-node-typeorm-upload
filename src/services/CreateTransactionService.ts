import { getCustomRepository } from 'typeorm';
import { response } from 'express';
// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
// import Category from '../models/Category';

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
    // const categoryRepository = getRepository(Category);

    // const categoryIsExists = await categoryRepository.findOne({
    //   where: { type: category },
    // });

    // let categoryReturned: Category;
    // if (!categoryIsExists) {
    //   categoryReturned = categoryRepository.create({
    //     title: category,
    //   });
    //   await categoryRepository.save(categoryReturned);
    // }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
