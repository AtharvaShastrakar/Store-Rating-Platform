import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.rating.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedAdminPassword = await bcrypt.hash('AdminPass123!', 10);
  const hashedOwnerPassword = await bcrypt.hash('OwnerPass123!', 10);
  const hashedUserPassword = await bcrypt.hash('UserPass123!', 10);

  // 1. Create System Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Account',
      email: 'admin@storerating.com',
      password: hashedAdminPassword,
      address: '100 Admin Boulevard, Tech City, CA 94000',
      role: Role.ADMIN,
    },
  });
  console.log('Created Admin:', admin.email);

  // 2. Create Store Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Johnathan Alexander StoreOwner',
      email: 'johnathan.owner@techstore.com',
      password: hashedOwnerPassword,
      address: '456 Silicon Way, San Jose, CA 95134',
      role: Role.STORE_OWNER,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Sarah Elizabeth StoreOwner',
      email: 'sarah.owner@coffeeroasters.com',
      password: hashedOwnerPassword,
      address: '789 Artisan Alley, Seattle, WA 98101',
      role: Role.STORE_OWNER,
    },
  });
  console.log('Created Store Owners:', owner1.email, owner2.email);

  // 3. Create Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Christopher James User',
      email: 'christopher.user@gmail.com',
      password: hashedUserPassword,
      address: '123 Maple Street, Portland, OR 97201',
      role: Role.NORMAL_USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Emily Victoria Customer',
      email: 'emily.customer@yahoo.com',
      password: hashedUserPassword,
      address: '321 Oak Avenue, Austin, TX 78701',
      role: Role.NORMAL_USER,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Michael Raymond Shopper',
      email: 'michael.shopper@outlook.com',
      password: hashedUserPassword,
      address: '555 Pine Lane, Denver, CO 80202',
      role: Role.NORMAL_USER,
    },
  });
  console.log('Created Normal Users');

  // 4. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Tech World Superstore',
      email: 'contact@techworld.com',
      address: '101 Electronics Parkway, San Jose, CA 95134',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Artisan Coffee Roasters',
      email: 'hello@artisancoffee.com',
      address: '202 Espresso Drive, Seattle, WA 98101',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Urban Fashion Hub',
      email: 'info@urbanfashion.com',
      address: '303 Style Boulevard, New York, NY 10001',
      ownerId: owner1.id,
    },
  });

  const store4 = await prisma.store.create({
    data: {
      name: 'Green Leaf Organic Market',
      email: 'support@greenleaf.com',
      address: '404 Farmstead Road, Austin, TX 78702',
      ownerId: owner2.id,
    },
  });
  console.log('Created Stores');

  // 5. Create Ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, value: 5 },
      { userId: user1.id, storeId: store2.id, value: 4 },
      { userId: user2.id, storeId: store1.id, value: 4 },
      { userId: user2.id, storeId: store2.id, value: 5 },
      { userId: user2.id, storeId: store4.id, value: 5 },
      { userId: user3.id, storeId: store1.id, value: 3 },
      { userId: user3.id, storeId: store3.id, value: 4 },
    ],
  });
  console.log('Created Ratings');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
