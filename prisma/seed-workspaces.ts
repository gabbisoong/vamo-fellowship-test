import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding workspaces...');

  const workspaces = [
    {
      name: 'vamo',
      displayName: 'Vamo',
      description: 'The official Vamo Fellowship workspace',
    },
    {
      name: 'acme-company',
      displayName: 'Acme Company',
      description: 'Acme Company Fellowship Program',
    },
    {
      name: 'startup-labs',
      displayName: 'Startup Labs',
      description: 'Innovation and entrepreneurship workspace',
    },
  ];

  for (const workspace of workspaces) {
    await prisma.workspace.upsert({
      where: { name: workspace.name },
      update: workspace,
      create: workspace,
    });
    console.log(`✓ Created/updated workspace: ${workspace.displayName}`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding workspaces:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
