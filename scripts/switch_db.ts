import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const target = (process.argv[2] || '').toLowerCase().trim();

if (target !== 'mysql' && target !== 'postgres' && target !== 'postgresql') {
  console.error('Usage: npx tsx scripts/switch_db.ts [mysql|postgres]');
  process.exit(1);
}

const isMysql = target === 'mysql';
const envPath = path.join(process.cwd(), '.env');
const schemaActive = path.join(process.cwd(), 'prisma', 'schema.prisma');
const schemaMysql = path.join(process.cwd(), 'prisma', 'schema.mysql.prisma');
const schemaPostgres = path.join(process.cwd(), 'prisma', 'schema.postgresql.prisma');

console.log(`\n🔄 Switching active database engine to: ${isMysql ? 'MySQL (Hostinger)' : 'PostgreSQL'}...`);

// 1. Copy the appropriate schema file
if (isMysql) {
  if (!fs.existsSync(schemaMysql)) {
    throw new Error(`Missing ${schemaMysql}`);
  }
  fs.copyFileSync(schemaMysql, schemaActive);
  console.log('✅ Active schema set to prisma/schema.mysql.prisma');
} else {
  if (!fs.existsSync(schemaPostgres)) {
    throw new Error(`Missing ${schemaPostgres}`);
  }
  fs.copyFileSync(schemaPostgres, schemaActive);
  console.log('✅ Active schema set to prisma/schema.postgresql.prisma');
}

// 2. Update .env
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Ensure backup keys exist
  const currentDbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
  const currentPooledMatch = envContent.match(/^DATABASE_URL_POOLED=(.+)$/m);
  const currentMysqlMatch = envContent.match(/^MYSQL_DATABASE_URL=(.+)$/m);
  const currentPgMatch = envContent.match(/^POSTGRES_DATABASE_URL=(.+)$/m);
  const currentPgPooledMatch = envContent.match(/^POSTGRES_DATABASE_URL_POOLED=(.+)$/m);

  let pgUrl = currentPgMatch ? currentPgMatch[1].trim() : (currentDbUrlMatch && currentDbUrlMatch[1].startsWith('postgres') ? currentDbUrlMatch[1].trim() : '');
  let pgPooledUrl = currentPgPooledMatch ? currentPgPooledMatch[1].trim() : (currentPooledMatch ? currentPooledMatch[1].trim() : '');
  let mysqlUrl = currentMysqlMatch ? currentMysqlMatch[1].trim() : 'mysql://u898063716_sahil:iamastudentofruetECE23@srv787.hstgr.io:3306/u898063716_AF_18nov26';

  // Construct updated .env
  const lines = envContent.split('\n');
  const filteredLines = lines.filter(l => 
    !l.startsWith('DATABASE_URL=') &&
    !l.startsWith('DATABASE_URL_POOLED=') &&
    !l.startsWith('POSTGRES_DATABASE_URL=') &&
    !l.startsWith('POSTGRES_DATABASE_URL_POOLED=') &&
    !l.startsWith('MYSQL_DATABASE_URL=')
  );

  const newDbConfig = [
    `# Database Configuration (Active: ${isMysql ? 'MySQL' : 'PostgreSQL'})`,
    `DATABASE_URL=${isMysql ? mysqlUrl : pgUrl}`,
    isMysql ? '# DATABASE_URL_POOLED is disabled for MySQL' : `DATABASE_URL_POOLED=${pgPooledUrl}`,
    `POSTGRES_DATABASE_URL=${pgUrl}`,
    `POSTGRES_DATABASE_URL_POOLED=${pgPooledUrl}`,
    `MYSQL_DATABASE_URL=${mysqlUrl}`,
    '',
  ];

  const updatedEnv = [...newDbConfig, ...filteredLines].join('\n');
  fs.writeFileSync(envPath, updatedEnv, 'utf8');
  console.log('✅ Updated .env connection strings (PostgreSQL configuration securely preserved).');
}

// 3. Generate Prisma Client
console.log('📦 Re-generating Prisma Client for ' + (isMysql ? 'MySQL' : 'PostgreSQL') + '...');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log(`\n🎉 Successfully switched active database to: ${isMysql ? 'MySQL (Hostinger)' : 'PostgreSQL'}!\n`);
