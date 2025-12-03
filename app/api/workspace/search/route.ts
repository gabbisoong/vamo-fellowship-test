import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ workspaces: [] });
    }

    // Search for workspaces by name (case-insensitive)
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query.toLowerCase(),
            },
          },
          {
            displayName: {
              contains: query,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
      take: 5, // Limit results
    });

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error('Error searching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to search workspaces' },
      { status: 500 }
    );
  }
}
