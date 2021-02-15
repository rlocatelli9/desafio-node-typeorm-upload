import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

import returnCategoryMatched from '../utils/returnCategoryMatched';

interface CSVTransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRespository = getRepository(Category);

    const readerStream = fs.createReadStream(filePath);

    const parsers = csvParse({
      from_line: 2,
    });
    const parseCSV = readerStream.pipe(parsers);

    const transactionsBookinsert: Array<CSVTransactionDTO> = [];
    const categoriesBookinsert: Array<string> = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categoriesBookinsert.push(category);
      transactionsBookinsert.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existentCategories = await categoriesRespository.find({
      where: {
        type: In(categoriesBookinsert),
      },
    });

    const ExistentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const newCategoriesNotExists = categoriesBookinsert
      .filter(title => !ExistentCategoriesTitles.includes(title))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRespository.create(
      newCategoriesNotExists.map(title => ({
        title,
      })),
    );

    await categoriesRespository.save(newCategories);

    const allCategories = [...existentCategories, ...newCategories];

    const importedTransactions = transactionsRepository.create(
      transactionsBookinsert.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: returnCategoryMatched(allCategories, transaction.category),
        //   category: allCategories.find(
        //     category => category.title === transaction.category,
        //   ),
      })),
    );

    await transactionsRepository.save(importedTransactions);

    await fs.promises.unlink(filePath);

    return importedTransactions;
  }
}

export default ImportTransactionsService;
