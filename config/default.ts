export default {
  POSTGRESQL_TYPE: 'postgres',
  POSTGRESQL_HOST: 'localhost',
  POSTGRESQL_PORT: 5432,
  POSTGRESQL_DATABASE_NAME: 'postgres',
  POSTGRESQL_USERNAME: 'postgres',
  POSTGRESQL_PASSWORD: 'phuong',

  LOGGING: ['query', 'error', 'info', 'warn'],
  LOGGER: 'file',

  ACCESS_SECRET_KEY: 'coinmap-interview@2023',
  REFRESH_SECRET_KEY: '@coinmap-interview123',
  ACCESS_TOKEN_EXPIRESIN: '1d',
  REFRESH_TOKEN_EXPIRESIN: '30d',

  SALT: 10,
};
