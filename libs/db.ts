import pg from 'pg';
import config from './config';

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.databaseUrl,
})



export default pool;