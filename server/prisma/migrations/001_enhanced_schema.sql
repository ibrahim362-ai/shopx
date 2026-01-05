-- Enhanced Category and Product Schema Migration

-- Add new columns to categories table
ALTER TABLE categories 
ADD COLUMN slug VARCHAR(191) UNIQUE,
ADD COLUMN image VARCHAR(500),
ADD COLUMN parentId INT,
ADD COLUMN status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
ADD COLUMN seoTitle VARCHAR(60),
ADD COLUMN seoDescription VARCHAR(160);

-- Add foreign key constraint for parent category
ALTER TABLE categories 
ADD CONSTRAINT categories_parentId_fkey 
FOREIGN KEY (parentId) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN slug VARCHAR(191) UNIQUE,
ADD COLUMN shortDescription TEXT,
ADD COLUMN discountPrice DECIMAL(10,2),
ADD COLUMN sku VARCHAR(100) UNIQUE,
ADD COLUMN brand VARCHAR(100),
ADD COLUMN tags TEXT,
ADD COLUMN featured BOOLEAN DEFAULT FALSE,
ADD COLUMN mainImage VARCHAR(500),
ADD COLUMN seoTitle VARCHAR(60),
ADD COLUMN seoDescription VARCHAR(160);

-- Update status enum for products
ALTER TABLE products 
MODIFY COLUMN status ENUM('DRAFT', 'ACTIVE', 'INACTIVE') DEFAULT 'DRAFT';

-- Generate slugs for existing categories
UPDATE categories 
SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '&', 'and'), '--', '-'))
WHERE slug IS NULL;

-- Generate slugs for existing products  
UPDATE products 
SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '&', 'and'), '--', '-'))
WHERE slug IS NULL;

-- Set shortDescription from description for existing products
UPDATE products 
SET shortDescription = LEFT(description, 200)
WHERE shortDescription IS NULL;

-- Create indexes for better performance
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_status ON categories(status);
CREATE INDEX idx_categories_parent ON categories(parentId);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_brand ON products(brand);