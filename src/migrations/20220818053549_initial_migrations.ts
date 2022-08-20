import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  !(await knex.schema.hasTable('users')) &&
    (await knex.schema.createTable(
      'users',
      (table: Knex.CreateTableBuilder) => {
        table.increments('id').primary();
        table.string('email').unique().notNullable();
        table.string('hashedPassword').notNullable();
        table.string('firstName').notNullable();
        table.string('lastName').notNullable();
        table.timestamps(true, true, true);
      },
    ));

  !(await knex.schema.hasTable('accounts')) &&
    (await knex.schema.createTable(
      'accounts',
      (table: Knex.CreateTableBuilder) => {
        table.increments('id').primary();
        table.integer('userId').unsigned().notNullable();
        table.foreign('userId').references('id').inTable('users');
        table.decimal('balance', 2).defaultTo(0).notNullable();
        table.timestamps(true, true, true);
      },
    ));

  !(await knex.schema.hasTable('entries')) &&
    (await knex.schema.createTable(
      'entries',
      (table: Knex.CreateTableBuilder) => {
        table.increments('id').primary();
        table.integer('accountId').unsigned().notNullable();
        table.foreign('accountId').references('id').inTable('accounts');
        table.decimal('amount', 2).notNullable();
        table.timestamps(true, true, true);
      },
    ));

  !(await knex.schema.hasTable('transfers')) &&
    (await knex.schema.createTable(
      'transfers',
      (table: Knex.CreateTableBuilder) => {
        table.increments('id').primary();
        table.integer('fromAccountId').unsigned().notNullable();
        table.foreign('fromAccountId').references('id').inTable('accounts');
        table.integer('toAccountId').unsigned().notNullable();
        table.foreign('toAccountId').references('id').inTable('accounts');
        table.integer('senderId').unsigned().notNullable();
        table.foreign('senderId').references('id').inTable('users');
        table.integer('recipientId').unsigned().notNullable();
        table.foreign('recipientId').references('id').inTable('users');
        table.decimal('amount').unsigned().notNullable();
        table.timestamps(true, true, true);
      },
    ));
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transfers');
  await knex.schema.dropTableIfExists('entries');
  await knex.schema.dropTableIfExists('accounts');
  await knex.schema.dropTableIfExists('users');
}
