
'use server';

import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { error: 'Invalid credentials' };
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            return { error: 'Invalid credentials' };
        }

        // Generate JWT
        const token = await signToken({ userId: user.id, username: user.username });

        // Set Cookie
        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Something went wrong' };
    }

    redirect('/dashboard');
}

export async function signupAction(formData: FormData) {
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!username || !email || !password) {
        return { error: 'All fields are required' };
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return { error: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hashedPassword,
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` // Auto-generate avatar
            }
        });

        const token = await signToken({ userId: newUser.id, username: newUser.username });

        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
            path: '/',
        });

    } catch (error) {
        console.error('Signup error:', error);
        return { error: 'Failed to create account' };
    }

    redirect('/dashboard');
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    redirect('/login');
}
