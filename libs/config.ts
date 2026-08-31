import dotenv from 'dotenv';
dotenv.config();

interface Config {
    databaseUrl: string;
}

const config: Config = {
   databaseUrl: process.env.DATABASE_URL || ' ',
};  



export default config;