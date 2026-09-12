import 'dotenv/config'
import prisma from '../lib/prisma'

async function main() {
  const newUrl = 'https://maps.app.goo.gl/LDb1zUJcLc2aheyb9'

  const place = await prisma.place.findUnique({
    where: { slug: 'isao' },
    select: { id: true, slug: true, address: true, googleMapsUrl: true },
  })

  if (!place) {
    console.error('❌ Place not found: isao')
    process.exit(1)
  }

  console.log('📍 Current data:')
  console.log('  slug:', place.slug)
  console.log('  address:', place.address)
  console.log('  googleMapsUrl:', place.googleMapsUrl)

  const updated = await prisma.place.update({
    where: { slug: 'isao' },
    data: { googleMapsUrl: newUrl },
    select: { slug: true, googleMapsUrl: true },
  })

  console.log('\n✅ Updated googleMapsUrl:')
  console.log('  slug:', updated.slug)
  console.log('  googleMapsUrl:', updated.googleMapsUrl)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
