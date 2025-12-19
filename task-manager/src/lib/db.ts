import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const database = process.env.MYSQL_DATABASE;
const port = Number(process.env.MYSQL_PORT ?? 3306);

// TODO: Remover console.log
console.log("DB_ENV_CHECK", {
  hasDatabaseUrl: Boolean(databaseUrl),
  hasHost: Boolean(host),
  hasUser: Boolean(user),
  hasPassword: Boolean(password),
  hasDatabase: Boolean(database),
  port,
});

const pool = databaseUrl
  ? mysql.createPool(databaseUrl)
  : mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

if (!databaseUrl && (!host || !user || !database)) {
  throw new Error(
    "Missing MySQL env vars. Define MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE (and MYSQL_PASSWORD if needed)."
  );
}

export default pool;
