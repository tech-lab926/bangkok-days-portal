import 'dotenv/config'
import prisma from '../lib/prisma'
import { hashPassword } from '../lib/password'

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@sitebang.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123456'
  const name = process.env.ADMIN_NAME || 'Super Admin'

  const hashedPassword = await hashPassword(password)

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name,
      role: 'SUPER_ADMIN',
      active: true,
    },
  })

  console.log('✅ Admin user created:')
  console.log('Email:', admin.email)
  console.log('Password:', password)
  console.log('Role:', admin.role)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
