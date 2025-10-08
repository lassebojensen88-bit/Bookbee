import pg from 'pg';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  console.log('Raw PG connect test (masked):', url.replace(/(:\/\/[^:]+:)([^@]+)(@.*)/, '$1****$3'));
  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 8000, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const res = await client.query('SELECT now() as now');
    console.log('PG now():', res.rows[0]);
  } catch (e) {
    console.error('PG connection failed:', e);
    process.exit(2);
  } finally {
    await client.end();
  }
  console.log('SUCCESS raw pg');
}

main();
