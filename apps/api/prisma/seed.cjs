const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
async function main() {
  const account = await prisma.account.upsert({
    where: { email: 'fixture@example.invalid' },
    create: { email: 'fixture@example.invalid', passwordHash: 'fixture-unusable', timeZone: 'UTC', usages: { create: [{ usage: 'student' }] } },
    update: {},
  });
  console.log(`Synthetic fixture account: ${account.id}`);
}
main().finally(() => prisma.$disconnect());
