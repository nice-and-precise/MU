'use server';

import { prisma } from '@/lib/prisma';
import { Asset, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getAssets() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return { success: true, data: assets };
  } catch (error) {
    console.error('Error fetching assets:', error);
    return { success: false, error: 'Failed to fetch assets' };
  }
}

export async function createAsset(data: Prisma.AssetCreateInput) {
  try {
    const asset = await prisma.asset.create({
      data,
    });
    revalidatePath('/dashboard/assets');
    return { success: true, data: asset };
  } catch (error) {
    console.error('Error creating asset:', error);
    return { success: false, error: 'Failed to create asset' };
  }
}

export async function updateAsset(id: string, data: Prisma.AssetUpdateInput) {
  try {
    const asset = await prisma.asset.update({
      where: { id },
      data,
    });
    revalidatePath('/dashboard/assets');
    return { success: true, data: asset };
  } catch (error) {
    console.error('Error updating asset:', error);
    return { success: false, error: 'Failed to update asset' };
  }
}

export async function deleteAsset(id: string) {
  try {
    await prisma.asset.delete({
      where: { id },
    });
    revalidatePath('/dashboard/assets');
    return { success: true };
  } catch (error) {
    console.error('Error deleting asset:', error);
    return { success: false, error: 'Failed to delete asset' };
  }
}
