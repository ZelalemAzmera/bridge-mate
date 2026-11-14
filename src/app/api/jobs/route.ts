import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/db';
import { seedDatabase } from '@/lib/db/seed';
import { JobQuerySchema } from '@/lib/validators/jobs.schema';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const repo = getRepository();
    const url = new URL(req.url);

    const queryParams = {
      query: url.searchParams.get('query') || undefined,
      category: url.searchParams.get('category') || undefined,
      isRemote: url.searchParams.get('isRemote') || undefined,
      disabilityFriendly: url.searchParams.get('disabilityFriendly') || undefined,
      language: url.searchParams.get('language') || undefined,
      limit: url.searchParams.get('limit') || 50,
      offset: url.searchParams.get('offset') || 0,
    };

    const parsed = JobQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Auto-seed sample jobs if store is empty
    let jobs = await repo.jobs.list(parsed.data);
    if (jobs.length === 0) {
      await seedDatabase(repo);
      jobs = await repo.jobs.list(parsed.data);
    }

    // Apply disability-friendly filter if requested
    if (parsed.data.disabilityFriendly) {
      jobs = jobs.filter((j) => {
        const hasTags = (j.disabilityTags && j.disabilityTags.length > 0);
        const hasA11y = (j.parsedData?.accessibilityFeatures && j.parsedData.accessibilityFeatures.length > 0);
        return hasTags || hasA11y;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        total: jobs.length,
      },
    });
  } catch (error: any) {
    console.error('[Jobs API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job opportunities', message: error.message },
      { status: 500 }
    );
  }
}

