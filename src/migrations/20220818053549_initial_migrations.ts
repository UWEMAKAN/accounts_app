import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  !(await knex.schema.hasTable('users')) &&
    (await knex.schema.createTable(
      'users',
      (table: Knex.CreateTableBuilder) => {
        table.increments('id').primary();
        table.string('email').unique().notNullable();
        table.string('passwordHash').notNullable();
        table.string('salt').notNullable();
        table.string('firstName').notNullable();
        table.string('lastName').notNullable();
      },
    ));

  !(await knex.schema.hasTable('accounts')) &&
    (await knex.schema.createTable(
      'accounts',
      (table: Knex.CreateTableBuilder) => {
        table.increments('id').primary();
        table.integer('userId').unsigned().notNullable().unique();
        table.foreign('userId').references('id').inTable('users');
        table.double('balance', 16, 2).defaultTo(0).notNullable();
      },
    ));

  !(await knex.schema.hasTable('entries')) &&
    (await knex.schema.createTable(
      'entries',
      (table: Knex.CreateTableBuilder) => {
        table.increments('id').primary();
        table.integer('accountId').unsigned().notNullable();
        table.foreign('accountId').references('id').inTable('accounts');
        table.double('amount', 16, 2).notNullable();
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
        table.double('amount', 16, 2).unsigned().notNullable();
      },
    ));
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transfers');
  await knex.schema.dropTableIfExists('entries');
  await knex.schema.dropTableIfExists('accounts');
  await knex.schema.dropTableIfExists('users');
}
