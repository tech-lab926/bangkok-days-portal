import 'dotenv/config'
import prisma from '../lib/prisma'
import { hashPassword } from '../lib/password'

async function main() {
  const email = 'testuser@bangkokdays.com'
  const password = 'Test1234!'
  const fullName = 'テストユーザー'
  const nickname = 'test-profile'

  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, emailVerified: true, active: true },
    create: {
      email,
      password: hashedPassword,
      fullName,
      nickname,
      emailVerified: true,
      active: true,
    },
  })

  console.log('✅ Test user created:')
  console.log('   Email   :', user.email)
  console.log('   Password:', password)
  console.log('   Name    :', user.fullName)
  console.log('   Nickname:', user.nickname)
  console.log('   ID      :', user.id)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
