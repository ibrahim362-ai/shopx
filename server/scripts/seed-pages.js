const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPageContent() {
  console.log('🌱 Seeding page content...');

  const defaultContent = [
    // Home Page Content
    {
      page: 'home',
      section: 'hero',
      title: 'Discover Luxury Beauty',
      subtitle: 'Premium cosmetics & skincare',
      description: 'Indulge in the finest selection of luxury beauty products, carefully curated for the discerning connoisseur.',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=600&fit=crop',
      displayOrder: 1
    },
    {
      page: 'home',
      section: 'features',
      title: 'Why Choose Us',
      subtitle: 'Excellence in every detail',
      data: JSON.stringify([
        {
          icon: 'Crown',
          title: 'Luxury Brands',
          description: 'Exclusive collection from world-renowned luxury brands'
        },
        {
          icon: 'Shield',
          title: 'Authenticity Guaranteed',
          description: '100% authentic products with certificates of authenticity'
        },
        {
          icon: 'Truck',
          title: 'Premium Delivery',
          description: 'White-glove delivery service with elegant packaging'
        }
      ]),
      displayOrder: 2
    },
    // About Page Content
    {
      page: 'about',
      section: 'hero',
      title: 'Our Story',
      subtitle: 'Crafting beauty experiences since 2020',
      description: 'Founded with a passion for luxury beauty, we curate the finest cosmetics and skincare products from around the world.',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=600&fit=crop',
      displayOrder: 1
    },
    {
      page: 'about',
      section: 'mission',
      title: 'Our Mission',
      description: 'To make luxury beauty accessible while maintaining the highest standards of quality and authenticity.',
      displayOrder: 2
    },
    {
      page: 'about',
      section: 'team',
      title: 'Meet Our Team',
      subtitle: 'Beauty experts at your service',
      data: JSON.stringify([
        {
          name: 'Isabella Laurent',
          role: 'Founder & Beauty Director',
          image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
          description: 'Former Chanel beauty consultant with 15 years in luxury cosmetics'
        },
        {
          name: 'Sophia Chen',
          role: 'Head of Fragrance Curation',
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
          description: 'Certified perfumer and fragrance expert from Grasse, France'
        }
      ]),
      displayOrder: 3
    },
    // Contact Page Content
    {
      page: 'contact',
      section: 'hero',
      title: 'Get in Touch',
      subtitle: 'We\'re here to help',
      description: 'Have questions about our products or need beauty advice? Our expert consultants are ready to assist you.',
      displayOrder: 1
    },
    {
      page: 'contact',
      section: 'info',
      title: 'Contact Information',
      data: JSON.stringify([
        {
          icon: 'Mail',
          title: 'Email Us',
          details: 'hello@luxebeauty.com',
          description: 'Beauty consultations & product inquiries'
        },
        {
          icon: 'Phone',
          title: 'Call Us',
          details: '+1 (555) LUXE-BEAUTY',
          description: 'Mon-Fri: 9am-7pm, Sat: 10am-5pm'
        },
        {
          icon: 'MapPin',
          title: 'Visit Our Boutique',
          details: '123 Beauty Boulevard',
          description: 'Luxury District, LD 12345'
        }
      ]),
      displayOrder: 2
    }
  ];

  try {
    // Create default content if it doesn't exist
    for (const content of defaultContent) {
      await prisma.pageContent.upsert({
        where: {
          page_section: {
            page: content.page,
            section: content.section
          }
        },
        update: {},
        create: content
      });
      console.log(`✅ Created/Updated ${content.page}/${content.section}`);
    }

    console.log('🎉 Page content seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding page content:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedPageContent()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });