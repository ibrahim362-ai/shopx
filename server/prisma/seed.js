const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: 'admin' }
  });

  let admin;
  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    admin = existingAdmin;
  } else {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator',
        email: 'admin@luxebeauty.com',
        status: 'ACTIVE'
      }
    });

    console.log('✅ Created admin user:', {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email
    });
  }

  // Create luxury beauty categories
  const categories = [
    {
      name: 'Perfumes',
      slug: 'perfumes',
      description: 'Luxury fragrances and eau de parfums from the world\'s finest perfume houses',
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop',
      status: 'ACTIVE',
      displayOrder: 1,
      seoTitle: 'Luxury Perfumes & Fragrances - LuxeBeauty',
      seoDescription: 'Discover our exquisite collection of luxury perfumes and fragrances from top brands like Chanel, Dior, and Tom Ford.'
    },
    {
      name: 'Cosmetics',
      slug: 'cosmetics',
      description: 'Premium makeup and cosmetics for a flawless, radiant look',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop',
      status: 'ACTIVE',
      displayOrder: 2,
      seoTitle: 'Luxury Cosmetics & Makeup - LuxeBeauty',
      seoDescription: 'Shop premium cosmetics and makeup from luxury brands. Foundation, lipstick, eyeshadow and more.'
    },
    {
      name: 'Skincare',
      slug: 'skincare',
      description: 'Advanced skincare solutions for healthy, glowing skin',
      image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&h=500&fit=crop',
      status: 'ACTIVE',
      displayOrder: 3,
      seoTitle: 'Luxury Skincare Products - LuxeBeauty',
      seoDescription: 'Premium skincare products for anti-aging, hydration, and radiant skin from top luxury brands.'
    },
    {
      name: 'Gift Sets',
      slug: 'gift-sets',
      description: 'Beautifully curated gift sets perfect for any occasion',
      image: 'https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=500&h=500&fit=crop',
      status: 'ACTIVE',
      displayOrder: 4,
      seoTitle: 'Luxury Beauty Gift Sets - LuxeBeauty',
      seoDescription: 'Elegant beauty gift sets featuring luxury perfumes, cosmetics, and skincare products.'
    }
  ];

  console.log('🏷️ Creating categories...');
  const createdCategories = {};
  
  for (const categoryData of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categoryData.slug }
    });

    if (existingCategory) {
      console.log(`✅ Category "${categoryData.name}" already exists`);
      createdCategories[categoryData.slug] = existingCategory;
    } else {
      const category = await prisma.category.create({
        data: categoryData
      });
      console.log(`✅ Created category: ${category.name}`);
      createdCategories[categoryData.slug] = category;
    }
  }

  // Create luxury beauty products
  const products = [
    {
      name: "Chanel No. 5 Eau de Parfum",
      slug: "chanel-no-5-eau-de-parfum",
      shortDescription: "The world's most iconic fragrance. A timeless floral aldehyde.",
      description: "Chanel No. 5 Eau de Parfum is a legendary fragrance that has captivated women for over a century. This timeless composition features aldehydes, ylang-ylang, rose, lily of the valley, and iris, creating an unforgettable scent that embodies elegance and sophistication. The parfum concentration offers the richest, most luxurious interpretation of this iconic fragrance.",
      price: 150.00,
      discountPrice: 135.00,
      stock: 25,
      lowStockAlert: 5,
      sku: "CHANEL-NO5-EDP-100ML",
      brand: "Chanel",
      weight: 0.15,
      categorySlug: "perfumes",
      tags: ["luxury", "floral", "aldehyde", "iconic", "chanel", "bestseller"],
      status: "ACTIVE",
      featured: true,
      mainImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop",
        "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500&h=500&fit=crop"
      ],
      seoTitle: "Chanel No. 5 Eau de Parfum - Iconic Luxury Fragrance",
      seoDescription: "Shop the legendary Chanel No. 5 Eau de Parfum. The world's most famous fragrance with timeless floral aldehyde composition.",
      metaKeywords: "chanel no 5, luxury perfume, iconic fragrance, eau de parfum"
    },
    {
      name: "Dior Sauvage Eau de Toilette",
      slug: "dior-sauvage-eau-de-toilette",
      shortDescription: "A radically fresh composition. Calabrian bergamot and ambroxan.",
      description: "Dior Sauvage Eau de Toilette is inspired by wide-open spaces and blue skies. This fresh and noble fragrance features Calabrian bergamot, Sichuan pepper, lavender, star anise, nutmeg, and ambroxan. It's a composition that radiates freshness while maintaining an air of mystery and sophistication.",
      price: 120.00,
      stock: 18,
      lowStockAlert: 3,
      sku: "DIOR-SAUVAGE-EDT-100ML",
      brand: "Dior",
      weight: 0.12,
      categorySlug: "perfumes",
      tags: ["fresh", "bergamot", "ambroxan", "masculine", "dior", "new"],
      status: "ACTIVE",
      featured: true,
      mainImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&h=500&fit=crop",
        "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500&h=500&fit=crop"
      ],
      seoTitle: "Dior Sauvage Eau de Toilette - Fresh Luxury Fragrance",
      seoDescription: "Experience Dior Sauvage EDT with Calabrian bergamot and ambroxan. A radically fresh and sophisticated fragrance.",
      metaKeywords: "dior sauvage, fresh fragrance, bergamot, luxury cologne"
    },
    {
      name: "Tom Ford Black Orchid",
      slug: "tom-ford-black-orchid",
      shortDescription: "A luxurious and sensual fragrance of rich dark accords.",
      description: "Tom Ford Black Orchid is a luxurious and sensual fragrance that captures the rich, dark facets of the orchid flower mixed with black truffle, ylang-ylang, bergamot, and effervescent citrus. The base features patchouli, vanilla, incense, and sandalwood, creating an opulent and mysterious scent.",
      price: 180.00,
      discountPrice: 162.00,
      stock: 12,
      lowStockAlert: 2,
      sku: "TF-BLACK-ORCHID-EDP-100ML",
      brand: "Tom Ford",
      weight: 0.18,
      categorySlug: "perfumes",
      tags: ["luxury", "sensual", "orchid", "dark", "tom ford", "limited"],
      status: "ACTIVE",
      featured: true,
      mainImage: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500&h=500&fit=crop",
        "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop"
      ],
      seoTitle: "Tom Ford Black Orchid - Luxury Sensual Fragrance",
      seoDescription: "Indulge in Tom Ford Black Orchid, a luxurious fragrance with rich dark accords of orchid, truffle, and patchouli.",
      metaKeywords: "tom ford black orchid, luxury perfume, sensual fragrance, dark orchid"
    },
    {
      name: "Charlotte Tilbury Magic Foundation",
      slug: "charlotte-tilbury-magic-foundation",
      shortDescription: "Full coverage foundation with a natural, radiant finish.",
      description: "Charlotte Tilbury Magic Foundation provides full coverage with a natural, radiant finish that lasts all day. This award-winning foundation features light-reflecting particles and skincare ingredients that blur imperfections while nourishing your skin. Available in a wide range of shades to match every skin tone.",
      price: 44.00,
      stock: 35,
      lowStockAlert: 8,
      sku: "CT-MAGIC-FOUNDATION-30ML",
      brand: "Charlotte Tilbury",
      weight: 0.05,
      categorySlug: "cosmetics",
      tags: ["foundation", "full coverage", "radiant", "charlotte tilbury", "trending"],
      status: "ACTIVE",
      featured: false,
      mainImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop",
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop"
      ],
      seoTitle: "Charlotte Tilbury Magic Foundation - Full Coverage Makeup",
      seoDescription: "Get flawless skin with Charlotte Tilbury Magic Foundation. Full coverage with a natural, radiant finish.",
      metaKeywords: "charlotte tilbury foundation, magic foundation, full coverage makeup"
    },
    {
      name: "La Mer Crème de la Mer",
      slug: "la-mer-creme-de-la-mer",
      shortDescription: "The legendary moisturizing cream that transforms skin.",
      description: "La Mer Crème de la Mer is the legendary moisturizing cream that transforms skin with the healing power of the sea. This luxurious cream features the Miracle Broth™, a nutrient-rich elixir that helps renew skin's appearance and texture. Perfect for dry, damaged, or aging skin seeking intensive hydration and repair.",
      price: 190.00,
      stock: 8,
      lowStockAlert: 2,
      sku: "LAMER-CREME-60ML",
      brand: "La Mer",
      weight: 0.08,
      categorySlug: "skincare",
      tags: ["luxury", "moisturizer", "anti-aging", "la mer", "miracle broth"],
      status: "ACTIVE",
      featured: true,
      mainImage: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&h=500&fit=crop",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop"
      ],
      seoTitle: "La Mer Crème de la Mer - Luxury Anti-Aging Moisturizer",
      seoDescription: "Transform your skin with La Mer Crème de la Mer, the legendary moisturizing cream with Miracle Broth™.",
      metaKeywords: "la mer creme, luxury moisturizer, anti-aging cream, miracle broth"
    },
    {
      name: "Yves Saint Laurent Rouge Pur Couture",
      slug: "ysl-rouge-pur-couture",
      shortDescription: "The ultimate luxury lipstick with intense color payoff.",
      description: "Yves Saint Laurent Rouge Pur Couture is the ultimate luxury lipstick that delivers intense color and a creamy, comfortable texture. This iconic lipstick features a unique square bullet design and provides full coverage with a satin finish. Available in a range of sophisticated shades inspired by YSL's couture heritage.",
      price: 38.00,
      discountPrice: 34.20,
      stock: 42,
      lowStockAlert: 10,
      sku: "YSL-ROUGE-PUR-COUTURE",
      brand: "Yves Saint Laurent",
      weight: 0.02,
      categorySlug: "cosmetics",
      tags: ["lipstick", "luxury", "ysl", "rouge", "bestseller", "couture"],
      status: "ACTIVE",
      featured: true,
      mainImage: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop"
      ],
      seoTitle: "YSL Rouge Pur Couture - Luxury Lipstick Collection",
      seoDescription: "Discover YSL Rouge Pur Couture luxury lipstick with intense color and creamy texture. The ultimate couture lipstick.",
      metaKeywords: "ysl lipstick, rouge pur couture, luxury lipstick, yves saint laurent"
    }
  ];

  console.log('💄 Creating luxury beauty products...');
  
  for (const productData of products) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug: productData.slug }
    });

    if (existingProduct) {
      console.log(`✅ Product "${productData.name}" already exists`);
      continue;
    }

    const category = createdCategories[productData.categorySlug];
    if (!category) {
      console.log(`❌ Category not found for product: ${productData.name}`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        shortDescription: productData.shortDescription,
        description: productData.description,
        price: productData.price,
        discountPrice: productData.discountPrice || null,
        stock: productData.stock,
        lowStockAlert: productData.lowStockAlert,
        sku: productData.sku,
        brand: productData.brand,
        weight: productData.weight,
        categoryId: category.id,
        tags: JSON.stringify(productData.tags),
        status: productData.status,
        featured: productData.featured,
        mainImage: productData.mainImage,
        images: JSON.stringify(productData.images),
        seoTitle: productData.seoTitle,
        seoDescription: productData.seoDescription,
        metaKeywords: productData.metaKeywords,
        viewCount: Math.floor(Math.random() * 1000) + 100, // Random view count for demo
        salesCount: Math.floor(Math.random() * 50) + 10, // Random sales count for demo
      }
    });

    console.log(`✅ Created product: ${product.name}`);

    // Log initial inventory
    if (productData.stock > 0) {
      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          type: 'PURCHASE',
          quantity: productData.stock,
          reason: 'Initial stock - Database seed',
          adminId: admin.id,
        }
      });
    }
  }

  // Create site settings
  const existingSettings = await prisma.settings.findFirst();
  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        siteName: 'LuxeBeauty',
        contactInfo: JSON.stringify({
          email: 'hello@luxebeauty.com',
          phone: '+1 (555) LUXE-BEAUTY',
          address: '123 Beauty Boulevard, Luxury District, LD 12345'
        }),
        socialLinks: JSON.stringify({
          facebook: 'https://facebook.com/luxebeauty',
          instagram: 'https://instagram.com/luxebeauty',
          twitter: 'https://twitter.com/luxebeauty'
        })
      }
    });
    console.log('✅ Created site settings');
  }

  console.log('🎉 Database seeded successfully!');
  console.log('📝 Default admin credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('');
  console.log('🛍️ Created luxury beauty products:');
  console.log('   • 3 Premium Perfumes (Chanel, Dior, Tom Ford)');
  console.log('   • 2 Luxury Cosmetics (Charlotte Tilbury, YSL)');
  console.log('   • 1 Premium Skincare (La Mer)');
  console.log('');
  console.log('🏷️ Created categories:');
  console.log('   • Perfumes');
  console.log('   • Cosmetics');
  console.log('   • Skincare');
  console.log('   • Gift Sets');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });