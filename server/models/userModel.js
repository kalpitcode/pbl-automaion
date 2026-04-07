const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createUser = async (name, email, passwordHash, role = 'STUDENT') => {
    return await prisma.user.create({
        data: {
            name,
            email,
            password_hash: passwordHash,
            role,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true
        }
    });
};

const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email },
    });
};

const findUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true
        }
    });
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    prisma,
};
