import { MikroORM } from '@mikro-orm/mysql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

const isProd = process.env.NODE_ENV === 'production';

export const ORM = await MikroORM.init({
  timezone: 'Z',

  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],

  dbName: isProd ? process.env.MYSQLDATABASE : 'veterinaria',
  host: isProd ? process.env.MYSQLHOST : 'localhost',
  port: isProd ? Number(process.env.MYSQLPORT) : 3306,
  user: isProd ? process.env.MYSQLUSER : 'root',
  password: isProd ? process.env.MYSQLPASSWORD : 'admin',

  highlighter: !isProd ? new SqlHighlighter() : undefined,
  debug: !isProd,

  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
  },
});



export const syncSchema = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const generator = ORM.getSchemaGenerator();
    await generator.updateSchema();
  }
};

