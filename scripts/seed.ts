import prisma from '../lib/prisma'
import { hashPassword } from '../lib/password'

async function main() {
  console.log('Seeding database...')

  // ─── Admin Users ───
  const adminPassword = await hashPassword('admin123456')
  const editorPassword = await hashPassword('editor123456')

  await prisma.adminUser.upsert({
    where: { email: 'admin@bangkokdays.com' },
    update: {},
    create: {
      email: 'admin@bangkokdays.com',
      password: adminPassword,
      name: '管理者',
      role: 'SUPER_ADMIN',
      active: true,
    },
  })

  await prisma.adminUser.upsert({
    where: { email: 'editor@bangkokdays.com' },
    update: {},
    create: {
      email: 'editor@bangkokdays.com',
      password: editorPassword,
      name: '編集者',
      role: 'EDITOR',
      active: true,
    },
  })

  console.log('Admin users created')

  // ─── Areas ───
  const sukhumvit = await prisma.area.create({
    data: {
      slug: 'sukhumvit',
      displayOrder: 0,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: 'スクンビット' },
          { locale: 'en', name: 'Sukhumvit' },
          { locale: 'th', name: 'สุขุมวิท' },
        ],
      },
    },
  })

  const silom = await prisma.area.create({
    data: {
      slug: 'silom',
      displayOrder: 1,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: 'シーロム' },
          { locale: 'en', name: 'Silom' },
          { locale: 'th', name: 'สีลม' },
        ],
      },
    },
  })

  const thonglor = await prisma.area.create({
    data: {
      slug: 'thonglor',
      displayOrder: 2,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: 'トンロー' },
          { locale: 'en', name: 'Thonglor' },
          { locale: 'th', name: 'ทองหล่อ' },
        ],
      },
    },
  })

  const sathorn = await prisma.area.create({
    data: {
      slug: 'sathorn',
      displayOrder: 3,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: 'サトーン' },
          { locale: 'en', name: 'Sathorn' },
          { locale: 'th', name: 'สาทร' },
        ],
      },
    },
  })

  console.log('Areas created')

  // ─── Categories ───
  const restaurant = await prisma.category.create({
    data: {
      slug: 'restaurant',
      displayOrder: 0,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: 'レストラン' },
          { locale: 'en', name: 'Restaurant' },
          { locale: 'th', name: 'ร้านอาหาร' },
        ],
      },
    },
  })

  const cafe = await prisma.category.create({
    data: {
      slug: 'cafe',
      displayOrder: 1,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: 'カフェ' },
          { locale: 'en', name: 'Cafe' },
          { locale: 'th', name: 'คาเฟ่' },
        ],
      },
    },
  })

  const izakaya = await prisma.category.create({
    data: {
      slug: 'izakaya',
      displayOrder: 2,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: '居酒屋' },
          { locale: 'en', name: 'Izakaya' },
          { locale: 'th', name: 'อิซากายะ' },
        ],
      },
    },
  })

  const bar = await prisma.category.create({
    data: {
      slug: 'bar',
      displayOrder: 3,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: 'バー' },
          { locale: 'en', name: 'Bar' },
          { locale: 'th', name: 'บาร์' },
        ],
      },
    },
  })

  const massage = await prisma.category.create({
    data: {
      slug: 'massage',
      displayOrder: 4,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: 'マッサージ' },
          { locale: 'en', name: 'Massage' },
          { locale: 'th', name: 'นวด' },
        ],
      },
    },
  })

  const karaoke = await prisma.category.create({
    data: {
      slug: 'karaoke',
      displayOrder: 5,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: 'カラオケ' },
          { locale: 'en', name: 'Karaoke' },
          { locale: 'th', name: 'คาราโอเกะ' },
        ],
      },
    },
  })

  console.log('Categories created')

  // ─── Scenes ───
  const dateScene = await prisma.scene.create({
    data: {
      displayOrder: 0,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: 'デート' },
          { locale: 'en', name: 'Date' },
        ],
      },
    },
  })

  const businessScene = await prisma.scene.create({
    data: {
      displayOrder: 1,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: '接待' },
          { locale: 'en', name: 'Business' },
        ],
      },
    },
  })

  const familyScene = await prisma.scene.create({
    data: {
      displayOrder: 2,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: '家族' },
          { locale: 'en', name: 'Family' },
        ],
      },
    },
  })

  const friendsScene = await prisma.scene.create({
    data: {
      displayOrder: 3,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: '友人との食事' },
          { locale: 'en', name: 'With Friends' },
        ],
      },
    },
  })

  const soloScene = await prisma.scene.create({
    data: {
      displayOrder: 4,
      enabled: true,
      translations: {
        create: [
          { locale: 'ja', name: 'おひとりさま' },
          { locale: 'en', name: 'Solo' },
        ],
      },
    },
  })

  console.log('Scenes created')

  // ─── Tags ───
  const tagJapanese = await prisma.tag.create({
    data: {
      slug: 'japanese-food',
      translations: {
        create: [
          { locale: 'ja', name: '日本料理' },
          { locale: 'en', name: 'Japanese Food' },
          { locale: 'th', name: 'อาหารญี่ปุ่น' },
        ],
      },
    },
  })

  const tagWifi = await prisma.tag.create({
    data: {
      slug: 'free-wifi',
      translations: {
        create: [
          { locale: 'ja', name: '無料WiFi' },
          { locale: 'en', name: 'Free WiFi' },
          { locale: 'th', name: 'WiFi ฟรี' },
        ],
      },
    },
  })

  const tagPrivateRoom = await prisma.tag.create({
    data: {
      slug: 'private-room',
      translations: {
        create: [
          { locale: 'ja', name: '個室あり' },
          { locale: 'en', name: 'Private Room' },
          { locale: 'th', name: 'ห้องส่วนตัว' },
        ],
      },
    },
  })

  const tagParking = await prisma.tag.create({
    data: {
      slug: 'parking',
      translations: {
        create: [
          { locale: 'ja', name: '駐車場あり' },
          { locale: 'en', name: 'Parking' },
          { locale: 'th', name: 'ที่จอดรถ' },
        ],
      },
    },
  })

  const tagJapaneseStaff = await prisma.tag.create({
    data: {
      slug: 'japanese-staff',
      translations: {
        create: [
          { locale: 'ja', name: '日本語スタッフ' },
          { locale: 'en', name: 'Japanese Staff' },
          { locale: 'th', name: 'พนักงานญี่ปุ่น' },
        ],
      },
    },
  })

  const tagDelivery = await prisma.tag.create({
    data: {
      slug: 'delivery',
      translations: {
        create: [
          { locale: 'ja', name: 'デリバリー対応' },
          { locale: 'en', name: 'Delivery' },
          { locale: 'th', name: 'จัดส่ง' },
        ],
      },
    },
  })

  console.log('Tags created')

  // ─── Pricing Plans ───
  const basicPlan = await prisma.pricingPlan.create({
    data: {
      name: 'ベーシック',
      monthlyPrice: 5000,
      description: '基本掲載プラン。店舗情報の掲載が可能です。',
      enabled: true,
    },
  })

  const standardPlan = await prisma.pricingPlan.create({
    data: {
      name: 'スタンダード',
      monthlyPrice: 10000,
      description: '写真掲載数無制限、スポットライト表示対応。',
      enabled: true,
    },
  })

  const premiumPlan = await prisma.pricingPlan.create({
    data: {
      name: 'プレミアム',
      monthlyPrice: 20000,
      description: '全機能利用可能。特集ページ掲載、優先表示対応。',
      enabled: true,
    },
  })

  console.log('Pricing plans created')

  // ─── Owners ───
  const ownerA = await prisma.owner.create({
    data: {
      companyName: 'サンプル株式会社',
      contactName: '山田太郎',
      phone: '+66-2-123-4567',
      email: 'yamada@sample.co.th',
      memo: '2024年1月より契約開始',
      active: true,
      planId: premiumPlan.id,
    },
  })

  const ownerB = await prisma.owner.create({
    data: {
      companyName: 'バンコクフーズ株式会社',
      contactName: '佐藤花子',
      phone: '+66-2-234-5678',
      email: 'sato@bkkfoods.co.th',
      active: true,
      planId: standardPlan.id,
    },
  })

  const ownerC = await prisma.owner.create({
    data: {
      companyName: 'タイ日本食品商事',
      contactName: '鈴木一郎',
      phone: '+66-2-345-6789',
      email: 'suzuki@thaijp-foods.com',
      memo: '月末締め翌月払い希望',
      active: true,
      planId: basicPlan.id,
    },
  })

  const ownerD = await prisma.owner.create({
    data: {
      companyName: 'ナイトエンタメ株式会社',
      contactName: '田中健二',
      phone: '+66-2-456-7890',
      email: 'tanaka@night-ent.co.th',
      active: true,
      planId: standardPlan.id,
    },
  })

  console.log('Owners created')

  // ─── Places (NORMAL) ───
  const place1 = await prisma.place.create({
    data: {
      slug: 'sakura-japanese-restaurant',
      type: 'NORMAL',
      isVisible: true,
      areaId: sukhumvit.id,
      ownerId: ownerA.id,
      phone: '+66-2-123-4567',
      address: '123 Sukhumvit Soi 33, Bangkok 10110',
      openingHours: '月〜土 11:00-14:00 / 17:00-23:00\n日曜定休',
      nearestStation: 'BTS プロンポン駅 徒歩5分',
      regularHoliday: '日曜日',
      languages: ['ja', 'en', 'th'],
      website: 'https://sakura-bkk.example.com',
      snsInstagram: 'https://instagram.com/sakura_bkk',
      snsLine: '@sakura-bkk',
      showSpotlight: true,
      viewCount: 1520,
      translations: {
        create: [
          {
            locale: 'ja',
            name: 'さくら日本料理店',
            description: 'バンコクのスクンビットで本格的な日本料理を提供。新鮮な刺身、寿司、天ぷらなど、熟練の料理人が腕を振るいます。個室完備で接待にも最適です。',
          },
          {
            locale: 'en',
            name: 'Sakura Japanese Restaurant',
            description: 'Authentic Japanese cuisine in Sukhumvit, Bangkok. Fresh sashimi, sushi, tempura and more by skilled chefs. Private rooms available for business dining.',
          },
          {
            locale: 'th',
            name: 'ร้านอาหารญี่ปุ่นซากุระ',
            description: 'อาหารญี่ปุ่นแท้ในสุขุมวิท กรุงเทพฯ ซาชิมิสด ซูชิ เทมปุระ และอื่นๆ',
          },
        ],
      },
      categories: {
        create: [{ categoryId: restaurant.id }],
      },
      scenes: {
        create: [{ sceneId: businessScene.id }, { sceneId: dateScene.id }],
      },
      tags: {
        create: [
          { tagId: tagJapanese.id },
          { tagId: tagPrivateRoom.id },
          { tagId: tagJapaneseStaff.id },
          { tagId: tagWifi.id },
        ],
      },
      images: {
        create: [
          { url: '/images/seed/sakura-main.jpg', alt: 'さくら日本料理店 外観', isMain: true, order: 0 },
          { url: '/images/seed/sakura-interior.jpg', alt: '店内の様子', isMain: false, order: 1 },
          { url: '/images/seed/sakura-sushi.jpg', alt: '寿司盛り合わせ', isMain: false, order: 2 },
        ],
      },
    },
  })

  const place2 = await prisma.place.create({
    data: {
      slug: 'bangkok-cafe-thonglor',
      type: 'NORMAL',
      isVisible: true,
      areaId: thonglor.id,
      ownerId: ownerB.id,
      phone: '+66-2-234-5678',
      address: '456 Thonglor Soi 13, Bangkok 10110',
      openingHours: '毎日 8:00-20:00',
      nearestStation: 'BTS トンロー駅 徒歩8分',
      languages: ['ja', 'en', 'th'],
      website: 'https://bkkcafe.example.com',
      snsInstagram: 'https://instagram.com/bkkcafe_thonglor',
      snsFacebook: 'https://facebook.com/bkkcafe',
      showSpotlight: true,
      viewCount: 890,
      translations: {
        create: [
          {
            locale: 'ja',
            name: 'バンコクカフェ トンロー店',
            description: 'トンローの落ち着いた雰囲気のカフェ。自家焙煎コーヒーと手作りスイーツが自慢。Wi-Fi完備でリモートワークにも最適です。',
          },
          {
            locale: 'en',
            name: 'Bangkok Cafe Thonglor',
            description: 'A cozy cafe in Thonglor. Home-roasted coffee and handmade sweets. Free WiFi available for remote work.',
          },
        ],
      },
      categories: {
        create: [{ categoryId: cafe.id }],
      },
      scenes: {
        create: [{ sceneId: soloScene.id }, { sceneId: friendsScene.id }],
      },
      tags: {
        create: [{ tagId: tagWifi.id }, { tagId: tagDelivery.id }],
      },
      images: {
        create: [
          { url: '/images/seed/cafe-main.jpg', alt: 'カフェ外観', isMain: true, order: 0 },
          { url: '/images/seed/cafe-coffee.jpg', alt: 'ラテアート', isMain: false, order: 1 },
        ],
      },
    },
  })

  const place3 = await prisma.place.create({
    data: {
      slug: 'torimaru-izakaya',
      type: 'NORMAL',
      isVisible: true,
      areaId: silom.id,
      ownerId: ownerC.id,
      phone: '+66-2-345-6789',
      address: '789 Silom Soi 6, Bangkok 10500',
      openingHours: '月〜土 17:00-24:00',
      nearestStation: 'BTS サラデーン駅 徒歩3分',
      regularHoliday: '日曜日',
      languages: ['ja', 'th'],
      snsX: 'https://x.com/torimaru_bkk',
      viewCount: 430,
      translations: {
        create: [
          {
            locale: 'ja',
            name: '鳥丸居酒屋',
            description: 'シーロムの本格焼き鳥居酒屋。厳選した鶏肉を備長炭で丁寧に焼き上げます。日本酒・焼酎も豊富に取り揃えております。',
          },
          {
            locale: 'en',
            name: 'Torimaru Izakaya',
            description: 'Authentic yakitori izakaya in Silom. Premium chicken grilled over binchotan charcoal. Wide selection of sake and shochu.',
          },
        ],
      },
      categories: {
        create: [{ categoryId: izakaya.id }, { categoryId: restaurant.id }],
      },
      scenes: {
        create: [{ sceneId: friendsScene.id }, { sceneId: soloScene.id }],
      },
      tags: {
        create: [{ tagId: tagJapanese.id }, { tagId: tagJapaneseStaff.id }],
      },
      images: {
        create: [
          { url: '/images/seed/izakaya-main.jpg', alt: '鳥丸居酒屋 外観', isMain: true, order: 0 },
        ],
      },
    },
  })

  const place4 = await prisma.place.create({
    data: {
      slug: 'thai-healing-massage',
      type: 'NORMAL',
      isVisible: true,
      areaId: sukhumvit.id,
      ownerId: ownerB.id,
      phone: '+66-2-567-8901',
      address: '55 Sukhumvit Soi 24, Bangkok 10110',
      openingHours: '毎日 10:00-22:00',
      nearestStation: 'BTS プロンポン駅 徒歩7分',
      languages: ['ja', 'en', 'th'],
      viewCount: 310,
      translations: {
        create: [
          {
            locale: 'ja',
            name: 'タイヒーリングマッサージ',
            description: '日本人オーナーが厳選したセラピストによる本格タイマッサージ。清潔な個室で極上のリラクゼーションをお楽しみください。',
          },
          {
            locale: 'en',
            name: 'Thai Healing Massage',
            description: 'Authentic Thai massage with therapists selected by a Japanese owner. Enjoy premium relaxation in clean private rooms.',
          },
        ],
      },
      categories: {
        create: [{ categoryId: massage.id }],
      },
      scenes: {
        create: [{ sceneId: soloScene.id }],
      },
      tags: {
        create: [{ tagId: tagJapaneseStaff.id }, { tagId: tagParking.id }],
      },
    },
  })

  // Draft place (not visible)
  const place5 = await prisma.place.create({
    data: {
      slug: 'sathorn-sushi-bar',
      type: 'NORMAL',
      isVisible: false,
      areaId: sathorn.id,
      ownerId: ownerA.id,
      phone: '+66-2-678-9012',
      address: '321 Sathorn Soi 12, Bangkok 10120',
      languages: ['ja', 'en'],
      translations: {
        create: [
          {
            locale: 'ja',
            name: 'サトーン鮨バー',
            description: '近日オープン予定の寿司バー。カウンター席で職人の技をお楽しみいただけます。',
          },
          {
            locale: 'en',
            name: 'Sathorn Sushi Bar',
            description: 'Coming soon. Enjoy sushi craftsmanship at the counter.',
          },
        ],
      },
      categories: {
        create: [{ categoryId: restaurant.id }],
      },
    },
  })

  console.log('Normal places created (5)')

  // ─── Places (NIGHT) ───
  const nightPlace1 = await prisma.place.create({
    data: {
      slug: 'club-luna',
      type: 'NIGHT',
      isVisible: true,
      areaId: thonglor.id,
      ownerId: ownerD.id,
      phone: '+66-2-789-0123',
      address: '99 Thonglor Soi 10, Bangkok 10110',
      openingHours: '毎日 21:00-02:00',
      nearestStation: 'BTS トンロー駅 徒歩5分',
      languages: ['ja', 'en', 'th'],
      snsInstagram: 'https://instagram.com/club_luna_bkk',
      snsTiktok: 'https://tiktok.com/@clubluna_bkk',
      showNightNavi: true,
      viewCount: 2100,
      translations: {
        create: [
          {
            locale: 'ja',
            name: 'クラブ ルナ',
            description: 'トンローの人気ナイトクラブ。最新のサウンドシステムと豪華なVIPルーム完備。日本人スタッフ常駐で安心。',
          },
          {
            locale: 'en',
            name: 'Club Luna',
            description: 'Popular nightclub in Thonglor. State-of-the-art sound system and luxurious VIP rooms. Japanese staff available.',
          },
        ],
      },
      categories: {
        create: [{ categoryId: bar.id }],
      },
      scenes: {
        create: [{ sceneId: friendsScene.id }],
      },
      tags: {
        create: [{ tagId: tagJapaneseStaff.id }, { tagId: tagPrivateRoom.id }],
      },
      images: {
        create: [
          { url: '/images/seed/club-luna-main.jpg', alt: 'クラブルナ 店内', isMain: true, order: 0 },
        ],
      },
    },
  })

  const nightPlace2 = await prisma.place.create({
    data: {
      slug: 'karaoke-ichiban',
      type: 'NIGHT',
      isVisible: true,
      areaId: sukhumvit.id,
      ownerId: ownerD.id,
      phone: '+66-2-890-1234',
      address: '88 Sukhumvit Soi 33/1, Bangkok 10110',
      openingHours: '毎日 18:00-02:00',
      nearestStation: 'BTS プロンポン駅 徒歩3分',
      languages: ['ja', 'th'],
      snsLine: '@karaoke-ichiban',
      showNightNavi: true,
      viewCount: 750,
      translations: {
        create: [
          {
            locale: 'ja',
            name: 'カラオケ一番',
            description: 'スクンビットの日本式カラオケ。最新のDAM機器導入。飲み放題コースあり。',
          },
          {
            locale: 'en',
            name: 'Karaoke Ichiban',
            description: 'Japanese-style karaoke in Sukhumvit. Latest DAM equipment. All-you-can-drink courses available.',
          },
        ],
      },
      categories: {
        create: [{ categoryId: karaoke.id }, { categoryId: bar.id }],
      },
      scenes: {
        create: [{ sceneId: friendsScene.id }, { sceneId: businessScene.id }],
      },
      tags: {
        create: [{ tagId: tagJapaneseStaff.id }, { tagId: tagPrivateRoom.id }, { tagId: tagWifi.id }],
      },
    },
  })

  console.log('Night places created (2)')

  // ─── Monthly Billings + Store Billings ───
  // January 2025 - PAID
  await prisma.monthlyBilling.create({
    data: {
      ownerId: ownerA.id,
      year: 2025,
      month: 1,
      totalAmount: 40000,
      status: 'PAID',
      stores: {
        create: [
          { placeId: place1.id, planId: premiumPlan.id, amount: 20000, active: true },
          { placeId: place5.id, planId: premiumPlan.id, amount: 20000, active: true, note: '準備中だが契約済み' },
        ],
      },
    },
  })

  await prisma.monthlyBilling.create({
    data: {
      ownerId: ownerB.id,
      year: 2025,
      month: 1,
      totalAmount: 20000,
      status: 'PAID',
      stores: {
        create: [
          { placeId: place2.id, planId: standardPlan.id, amount: 10000, active: true },
          { placeId: place4.id, planId: standardPlan.id, amount: 10000, active: true },
        ],
      },
    },
  })

  await prisma.monthlyBilling.create({
    data: {
      ownerId: ownerC.id,
      year: 2025,
      month: 1,
      totalAmount: 5000,
      status: 'PAID',
      stores: {
        create: [
          { placeId: place3.id, planId: basicPlan.id, amount: 5000, active: true },
        ],
      },
    },
  })

  await prisma.monthlyBilling.create({
    data: {
      ownerId: ownerD.id,
      year: 2025,
      month: 1,
      totalAmount: 20000,
      status: 'PAID',
      stores: {
        create: [
          { placeId: nightPlace1.id, planId: standardPlan.id, amount: 10000, active: true },
          { placeId: nightPlace2.id, planId: standardPlan.id, amount: 10000, active: true },
        ],
      },
    },
  })

  // February 2025 - INVOICED
  await prisma.monthlyBilling.create({
    data: {
      ownerId: ownerA.id,
      year: 2025,
      month: 2,
      totalAmount: 40000,
      status: 'INVOICED',
      stores: {
        create: [
          { placeId: place1.id, planId: premiumPlan.id, amount: 20000, active: true },
          { placeId: place5.id, planId: premiumPlan.id, amount: 20000, active: true },
        ],
      },
    },
  })

  await prisma.monthlyBilling.create({
    data: {
      ownerId: ownerB.id,
      year: 2025,
      month: 2,
      totalAmount: 20000,
      status: 'INVOICED',
      stores: {
        create: [
          { placeId: place2.id, planId: standardPlan.id, amount: 10000, active: true },
          { placeId: place4.id, planId: standardPlan.id, amount: 10000, active: true },
        ],
      },
    },
  })

  // March 2025 - UNPAID
  await prisma.monthlyBilling.create({
    data: {
      ownerId: ownerA.id,
      year: 2025,
      month: 3,
      totalAmount: 40000,
      status: 'UNPAID',
      stores: {
        create: [
          { placeId: place1.id, planId: premiumPlan.id, amount: 20000, active: true },
          { placeId: place5.id, planId: premiumPlan.id, amount: 20000, active: true },
        ],
      },
    },
  })

  await prisma.monthlyBilling.create({
    data: {
      ownerId: ownerC.id,
      year: 2025,
      month: 3,
      totalAmount: 5000,
      status: 'UNPAID',
      stores: {
        create: [
          { placeId: place3.id, planId: basicPlan.id, amount: 5000, active: true },
        ],
      },
    },
  })

  await prisma.monthlyBilling.create({
    data: {
      ownerId: ownerD.id,
      year: 2025,
      month: 3,
      totalAmount: 20000,
      status: 'UNPAID',
      stores: {
        create: [
          { placeId: nightPlace1.id, planId: standardPlan.id, amount: 10000, active: true },
          { placeId: nightPlace2.id, planId: standardPlan.id, amount: 10000, active: true },
        ],
      },
    },
  })

  console.log('Billings created (3 months)')

  // ─── Articles ───
  await prisma.article.create({
    data: {
      slug: 'welcome-to-bangkok',
      type: 'GUIDE',
      published: true,
      featured: true,
      viewCount: 3200,
      publishedAt: new Date('2025-01-10'),
      translations: {
        create: [
          {
            locale: 'ja',
            title: 'バンコクへようこそ',
            content: 'バンコクでの生活を始めるためのガイドです。住居探し、ビザ、交通手段、おすすめエリアなど、知っておくべき情報をまとめました。\n\n## 住居探し\nスクンビットエリアは日本人が多く住むエリアです。\n\n## 交通手段\nBTSとMRTが便利です。',
            excerpt: 'バンコク生活ガイド',
            coverUrl: '/images/seed/article-bangkok-guide.jpg',
          },
          {
            locale: 'en',
            title: 'Welcome to Bangkok',
            content: 'A guide to starting your life in Bangkok. Housing, visa, transportation, recommended areas and more.\n\n## Housing\nSukhumvit area is popular among Japanese residents.\n\n## Transportation\nBTS and MRT are convenient.',
            excerpt: 'Bangkok living guide',
            coverUrl: '/images/seed/article-bangkok-guide.jpg',
          },
        ],
      },
      tags: { create: [{ tagId: tagJapaneseStaff.id }] },
    },
  })

  await prisma.article.create({
    data: {
      slug: 'best-japanese-restaurants-2025',
      type: 'GUIDE',
      published: true,
      featured: false,
      viewCount: 1800,
      publishedAt: new Date('2025-02-01'),
      translations: {
        create: [
          {
            locale: 'ja',
            title: '2025年バンコクのおすすめ日本料理店10選',
            content: 'バンコクで人気の日本料理店をご紹介します。スクンビット、シーロム、トンローエリアから厳選した10店舗をピックアップしました。\n\n### 1. さくら日本料理店\nスクンビットの名店。新鮮な刺身が評判。\n\n### 2. 鳥丸居酒屋\nシーロムの焼き鳥居酒屋。備長炭焼きが絶品。',
            excerpt: 'おすすめ日本料理店まとめ',
          },
          {
            locale: 'en',
            title: 'Top 10 Japanese Restaurants in Bangkok 2025',
            content: 'Introducing popular Japanese restaurants in Bangkok. 10 carefully selected restaurants from Sukhumvit, Silom, and Thonglor areas.',
            excerpt: 'Best Japanese restaurants roundup',
          },
        ],
      },
      tags: { create: [{ tagId: tagJapanese.id }, { tagId: tagJapaneseStaff.id }] },
    },
  })

  await prisma.article.create({
    data: {
      slug: 'new-bts-extension-2025',
      type: 'NEWS',
      published: true,
      featured: false,
      viewCount: 560,
      publishedAt: new Date('2025-03-01'),
      translations: {
        create: [
          {
            locale: 'ja',
            title: 'BTS新路線延伸のお知らせ',
            content: '2025年後半にBTSスクンビット線の延伸が予定されています。新駅周辺の店舗情報も随時更新していきます。',
            excerpt: 'BTS延伸情報',
          },
          {
            locale: 'en',
            title: 'BTS New Line Extension Notice',
            content: 'BTS Sukhumvit line extension is planned for late 2025. We will update store information around new stations.',
            excerpt: 'BTS extension info',
          },
        ],
      },
    },
  })

  // Draft article
  await prisma.article.create({
    data: {
      slug: 'cafe-guide-draft',
      type: 'GUIDE',
      published: false,
      featured: false,
      viewCount: 0,
      translations: {
        create: [
          {
            locale: 'ja',
            title: 'バンコクカフェガイド（下書き）',
            content: 'バンコクのおすすめカフェをまとめます。執筆中...',
            excerpt: 'カフェガイド',
          },
        ],
      },
      tags: { create: [{ tagId: tagWifi.id }] },
    },
  })

  console.log('Articles created (4)')

  // ─── Community Posts + Replies ───
  await prisma.communityPost.create({
    data: {
      title: 'スクンビットでおすすめのランチスポットを教えてください',
      content: '来月からバンコクに赴任することになりました。スクンビットエリアでおすすめのランチが食べられるお店を教えていただけると助かります。予算は200〜300バーツくらいで考えています。',
      locale: 'ja',
      replies: {
        create: [
          { content: 'ソイ33のさくら日本料理店がおすすめです！ランチセットが250バーツで、ボリュームもあってコスパ最高です。' },
          { content: 'プロンポン駅周辺にはたくさん日本食レストランがありますよ。フジスーパー近くのエリアを歩いてみてください。' },
          { content: 'トンローのバンコクカフェもランチメニューがあって良いですよ。カレーが美味しいです。' },
        ],
      },
    },
  })

  await prisma.communityPost.create({
    data: {
      title: 'バンコクでの病院選びについて',
      content: 'バンコクで日本語対応の病院を探しています。保険が使えるところがあれば教えてください。',
      locale: 'ja',
      replies: {
        create: [
          { content: 'バムルンラード病院に日本語通訳がいますよ。海外旅行保険も使えます。' },
          { content: 'サミティベート病院もおすすめです。日本人専用窓口があります。' },
        ],
      },
    },
  })

  await prisma.communityPost.create({
    data: {
      title: '週末のゴルフ仲間を募集しています',
      content: '毎週土曜日の朝にゴルフに行っています。一緒にラウンドしていただける方を探しています。レベルは問いません。気軽にご連絡ください！',
      locale: 'ja',
      replies: {
        create: [
          { content: '興味があります！ハンデ30くらいの初心者ですが大丈夫でしょうか？' },
        ],
      },
    },
  })

  // Hidden post
  await prisma.communityPost.create({
    data: {
      title: 'テスト投稿（非表示）',
      content: 'これはテスト投稿です。管理画面から非表示に設定されています。',
      locale: 'ja',
      hidden: true,
    },
  })

  console.log('Community posts created (4)')

  // ─── Inquiries ───
  await prisma.inquiry.create({
    data: {
      type: 'STORE_LISTING',
      status: 'PENDING',
      name: '高橋誠',
      email: 'takahashi@newstore.com',
      phone: '+66-89-123-4567',
      storeName: '新宿ラーメン バンコク店',
      subject: '店舗掲載のお願い',
      message: '来月バンコクのプロンポンにラーメン店をオープンする予定です。バンコクデイズへの掲載を希望しております。掲載料金やプランについてご相談させていただけますでしょうか。',
    },
  })

  await prisma.inquiry.create({
    data: {
      type: 'STORE_LISTING',
      status: 'PENDING',
      name: '渡辺美咲',
      email: 'watanabe@beauty-salon.co.th',
      storeName: 'ビューティーサロン MISAKI',
      subject: '掲載についての問い合わせ',
      message: 'シーロムで美容サロンを経営しています。日本人のお客様向けに掲載を検討しております。ナイトカテゴリではなく通常の掲載を希望します。',
    },
  })

  await prisma.inquiry.create({
    data: {
      type: 'STORE_LISTING',
      status: 'IN_PROGRESS',
      name: '伊藤隆',
      email: 'ito@sushi-ito.com',
      phone: '+66-81-234-5678',
      storeName: '鮨 伊藤',
      subject: '掲載プランの変更について',
      message: '現在ベーシックプランで掲載していますが、スタンダードプランへの変更を検討しています。手続き方法を教えてください。',
    },
  })

  await prisma.inquiry.create({
    data: {
      type: 'GENERAL',
      status: 'COMPLETED',
      name: '中村和也',
      email: 'nakamura@example.com',
      subject: 'サイトの広告掲載について',
      message: 'バンコクデイズのバナー広告について詳細を教えていただけますか？',
    },
  })

  await prisma.inquiry.create({
    data: {
      type: 'GENERAL',
      status: 'PENDING',
      name: '木村由美',
      email: 'kimura@travel.co.jp',
      subject: '記事掲載の依頼',
      message: '旅行会社です。バンコクの日本食特集記事でバンコクデイズさんとのコラボレーションを検討しています。',
    },
  })

  console.log('Inquiries created (5)')

  // ─── Featured Pages ───
  await prisma.featuredPage.create({
    data: {
      title: 'スクンビットの人気レストランTOP5',
      url: '/featured/sukhumvit-top5',
      displayOrder: 0,
      enabled: true,
    },
  })

  await prisma.featuredPage.create({
    data: {
      title: '接待におすすめの個室レストラン',
      url: '/featured/private-room-restaurants',
      displayOrder: 1,
      enabled: true,
    },
  })

  await prisma.featuredPage.create({
    data: {
      title: 'バンコクのナイトスポット特集',
      url: '/featured/night-spots',
      displayOrder: 2,
      enabled: true,
    },
  })

  await prisma.featuredPage.create({
    data: {
      title: '週末に行きたいカフェ特集',
      url: '/featured/weekend-cafes',
      displayOrder: 3,
      enabled: false,
    },
  })

  console.log('Featured pages created (4)')

  // ─── Global Settings ───
  await prisma.globalSettings.create({
    data: { key: 'billing_closing_day', value: '25' },
  })

  await prisma.globalSettings.create({
    data: { key: 'site_name', value: 'バンコクデイズ' },
  })

  await prisma.globalSettings.create({
    data: { key: 'support_email', value: 'support@bangkokdays.com' },
  })

  console.log('Global settings created (3)')

  // ─── Media ───
  await prisma.media.createMany({
    data: [
      { url: '/images/seed/sakura-main.jpg', filename: 'sakura-main.jpg', mimeType: 'image/jpeg', size: 245000 },
      { url: '/images/seed/sakura-interior.jpg', filename: 'sakura-interior.jpg', mimeType: 'image/jpeg', size: 312000 },
      { url: '/images/seed/sakura-sushi.jpg', filename: 'sakura-sushi.jpg', mimeType: 'image/jpeg', size: 198000 },
      { url: '/images/seed/cafe-main.jpg', filename: 'cafe-main.jpg', mimeType: 'image/jpeg', size: 275000 },
      { url: '/images/seed/cafe-coffee.jpg', filename: 'cafe-coffee.jpg', mimeType: 'image/jpeg', size: 156000 },
      { url: '/images/seed/izakaya-main.jpg', filename: 'izakaya-main.jpg', mimeType: 'image/jpeg', size: 220000 },
      { url: '/images/seed/club-luna-main.jpg', filename: 'club-luna-main.jpg', mimeType: 'image/jpeg', size: 340000 },
      { url: '/images/seed/article-bangkok-guide.jpg', filename: 'article-bangkok-guide.jpg', mimeType: 'image/jpeg', size: 410000 },
    ],
  })

  console.log('Media created (8)')

  // ─── Summary ───
  console.log('')
  console.log('========================================')
  console.log('  Seeding completed!')
  console.log('========================================')
  console.log('')
  console.log('Admin users:')
  console.log('  admin@bangkokdays.com / admin123456 (SUPER_ADMIN)')
  console.log('  editor@bangkokdays.com / editor123456 (EDITOR)')
  console.log('')
  console.log('Tables seeded:')
  console.log('  AdminUser:          2')
  console.log('  Area:               4  (+ 12 translations)')
  console.log('  Category:           6  (+ 18 translations)')
  console.log('  Scene:              5  (+ 10 translations)')
  console.log('  Tag:                6  (+ 18 translations)')
  console.log('  PricingPlan:        3')
  console.log('  Owner:              4')
  console.log('  Place (NORMAL):     5  (4 visible, 1 draft)')
  console.log('  Place (NIGHT):      2')
  console.log('  PlaceTranslation:  19')
  console.log('  PlaceImage:         7')
  console.log('  PlaceCategory:      9')
  console.log('  PlaceScene:        10')
  console.log('  PlaceTag:          15')
  console.log('  MonthlyBilling:     9')
  console.log('  StoreBilling:      16')
  console.log('  Article:            4  (3 published, 1 draft)')
  console.log('  ArticleTranslation: 7')
  console.log('  CommunityPost:      4  (3 visible, 1 hidden)')
  console.log('  CommunityReply:     6')
  console.log('  Inquiry:            5  (3 PENDING, 1 IN_PROGRESS, 1 COMPLETED)')
  console.log('  FeaturedPage:       4  (3 enabled, 1 disabled)')
  console.log('  GlobalSettings:     3')
  console.log('  Media:              8')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
