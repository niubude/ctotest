import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.repository.deleteMany()

  await prisma.repository.createMany({
    data: [
      {
        name: 'Main Project',
        url: 'svn://example.com/main',
        description: 'Main project repository with core features',
      },
      {
        name: 'Legacy System',
        url: 'svn://example.com/legacy',
        description: 'Legacy codebase for maintenance',
      },
      {
        name: 'Experimental Features',
        url: 'svn://example.com/experimental',
        description: 'Repository for testing new features',
      },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
