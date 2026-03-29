import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@assetra.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Password123';
  const fullName = process.env.SEED_ADMIN_NAME ?? 'Admin User';
  const organizationName = process.env.SEED_ORG_NAME ?? 'Assetra Demo';

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, organizationId: true }
  });

  if (existing) {
    console.log(`Seed user already exists for ${email}.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const organization = await prisma.organization.create({
    data: { name: organizationName }
  });

  await prisma.user.create({
    data: {
      email,
      fullName,
      passwordHash,
      role: Role.ADMIN,
      organizationId: organization.id
    }
  });

  console.log('Seeded admin user:');
  console.log(`  email: ${email}`);
  console.log(`  password: ${password}`);
  console.log(`  organization: ${organizationName}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
