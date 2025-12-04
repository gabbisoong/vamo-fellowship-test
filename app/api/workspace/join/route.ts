import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId } = await request.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: workspaceId,
        },
      },
    });

    if (existingMembership) {
      // Already a member, just update user's current workspace
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          hasJoinedWorkspace: true,
          currentWorkspaceId: workspaceId,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Already a member of this workspace',
      });
    }

    // Add user to workspace
    await prisma.workspaceMember.create({
      data: {
        userId: session.user.id,
        workspaceId: workspaceId,
        role: 'member',
      },
    });

    // Update user's workspace status
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hasJoinedWorkspace: true,
        currentWorkspaceId: workspaceId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully joined workspace',
    });
  } catch (error) {
    console.error('Error joining workspace:', error);
    return NextResponse.json(
      { error: 'Failed to join workspace' },
      { status: 500 }
    );
  }
}
