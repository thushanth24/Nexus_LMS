const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { Command } = require('commander');

const program = new Command();

program
  .requiredOption('-e, --email <email>', 'Admin email')
  .requiredOption('-n, --name <name>', 'Admin full name')
  .requiredOption('-p, --password <password>', 'Admin password')
  .parse(process.argv);

const options = program.opts();

async function createAdmin() {
  const prisma = new PrismaClient();
  
  try {
    // Check if admin with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: options.email },
    });

    if (existingUser) {
      console.error(`Error: User with email ${options.email} already exists`);
      process.exit(1);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(options.password, saltRounds);

    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        email: options.email,
        name: options.name,
        password: hashedPassword,
        role: 'ADMIN',
        subjects: ['admin'],
      },
    });

    console.log('Admin user created successfully:');
    console.log(`Email: ${admin.email}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Role: ${admin.role}`);
    console.log('ID:', admin.id);
    console.log('\nPlease keep these credentials secure!');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createAdmin();
