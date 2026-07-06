/**
 * Migration: create `logs` table.
 * Fields:
 *  - id: serial primary key
 *  - timestamp: timestamptz default now
 *  - actor: varchar
 *  - action: varchar
 *  - payload: jsonb
 *  - prev_hash: varchar(64)
 *  - chain_hash: varchar(64)
 *
 * Indexes added on actor and timestamp for efficient export queries.
 */

exports.up = async function (knex) {
  await knex.schema.createTable('logs', (table) => {
    table.increments('id').primary();
    table.timestamp('timestamp', { useTz: true }).defaultTo(knex.fn.now());
    table.string('actor');
    table.string('action');
    table.jsonb('payload');
    table.string('prev_hash', 64);
    table.string('chain_hash', 64);

    table.index('actor');
    table.index('timestamp');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('logs');
};
