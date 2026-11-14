import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notification.service';
import { SubscribeAlertSchema } from '@/lib/validators/jobs.schema';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = SubscribeAlertSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid subscription data',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await NotificationService.subscribe(parsed.data);

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: result.subscription.id,
        phoneNumber: result.subscription.phoneNumber,
        channel: result.subscription.channel,
        categories: result.subscription.jobCategories,
        messageDelivered: result.sendResult.success,
        provider: result.sendResult.provider,
      },
    });
  } catch (error: any) {
    console.error('[Jobs Alert Subscribe API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to alerts', message: error.message },
      { status: 500 }
    );
  }
}

