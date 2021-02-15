import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AlterTypeTitleFieldIntoCategory1613346343415
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'categories',
      'title',
      new TableColumn({
        name: 'title',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'categories',
      'title',
      new TableColumn({
        name: 'title',
        type: 'uuid',
        isNullable: false,
      }),
    );
  }
}
