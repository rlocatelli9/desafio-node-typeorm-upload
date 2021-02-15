import Category from '../models/Category';

export default function returnCategoryMatched(
  allCategories: Array<Category>,
  categoryToMatch: string,
): Category | undefined {
  const existsCategory = allCategories.find(
    category => category.title === categoryToMatch,
  );

  return existsCategory;
}
