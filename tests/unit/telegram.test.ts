import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { TelegramService, type TelegramUpdate } from '@/lib/telegram/telegram.service';
import { POST as webhookPost, GET as webhookGet } from '@/app/api/telegram/webhook/route';
import { GET as linkTokenGet } from '@/app/api/telegram/link-token/route';

describe('Track 3: Telegram Bot Assistant & Webhook Engine', () => {
  beforeEach(() => {
    TelegramService.clearOutgoingLog();
  });

  it('handles /start command with multilingual welcoming and command listing', async () => {
    const update: TelegramUpdate = {
      update_id: 1001,
      message: {
        message_id: 1,
        chat: { id: 991122, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: '/start',
      },
    };

    const result = await TelegramService.processUpdate(update);
    expect(result.handled).toBe(true);
    expect(result.replyText).toContain('BridgeMate Assistant on Telegram');
    expect(result.replyText).toContain('/ask');
    expect(result.replyText).toContain('/livehelp');

    const log = TelegramService.getOutgoingLog();
    expect(log.length).toBe(1);
    expect(log[0].chat_id).toBe(991122);
  });

  it('handles /ask command with grounded course curriculum citations', async () => {
    const update: TelegramUpdate = {
      update_id: 1002,
      message: {
        message_id: 2,
        chat: { id: 991122, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: '/ask በአዋጅ 568/2008 መሠረት ለፈተና ተጨማሪ ጊዜ መጠየቅ እችላለሁ?',
      },
    };

    const result = await TelegramService.processUpdate(update);
    expect(result.handled).toBe(true);
    expect(result.replyText).toContain('568/2008');
    expect(result.replyText).toContain('Citations');
  });

  it('handles /decode command identifying functional barriers in notices', async () => {
    const update: TelegramUpdate = {
      update_id: 1003,
      message: {
        message_id: 3,
        chat: { id: 991122, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: '/decode Junior Web Developer needed. Must have driver license and climb stairs to 4th floor.',
      },
    };

    const result = await TelegramService.processUpdate(update);
    expect(result.handled).toBe(true);
    expect(result.replyText).toContain('Barrier Decoder');
    expect(result.replyText).toContain('HIGH');
  });

  it('handles /livehelp command creating support session and providing instant room URL', async () => {
    const update: TelegramUpdate = {
      update_id: 1004,
      message: {
        message_id: 4,
        chat: { id: 991122, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: '/livehelp',
      },
    };

    const result = await TelegramService.processUpdate(update);
    expect(result.handled).toBe(true);
    expect(result.replyText).toContain('/support?sessionId=');
    expect(result.replyText).toContain('Queue Position');
  });

  it('handles /alerts command activating Telegram job subscriptions', async () => {
    const update: TelegramUpdate = {
      update_id: 1005,
      message: {
        message_id: 5,
        from: { id: 991122, first_name: 'Sara', username: 'sara_eth' },
        chat: { id: 991122, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: '/alerts',
      },
    };

    const result = await TelegramService.processUpdate(update);
    expect(result.handled).toBe(true);
    expect(result.replyText).toContain('Subscribed to Telegram Job & Content Alerts');
  });

  it('processes incoming updates via /api/telegram/webhook POST and GET route handlers', async () => {
    const getRes = await webhookGet();
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.botName).toBe('@BridgeMateAssistantBot');
    expect(getJson.supportedCommands).toBeInstanceOf(Array);

    const postReq = new NextRequest('http://localhost:3000/api/telegram/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        update_id: 2001,
        message: {
          message_id: 10,
          chat: { id: 778899, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          text: 'What are reasonable accommodations in Ethiopia?',
        },
      }),
    });

    const postRes = await webhookPost(postReq);
    expect(postRes.status).toBe(200);
    const postJson = await postRes.json();
    expect(postJson.ok).toBe(true);
    expect(postJson.handled).toBe(true);
  });

  it('handles /start link_<token> to link user account and personalize Telegram session', async () => {
    const { getRepository } = await import('@/lib/db');
    const repo = getRepository();

    const user = await repo.users.create({
      clerkId: 'clerk_test_linking_01',
      fullName: 'Abebe Bikila',
      email: 'abebe@test.et',
      disabilityType: 'visual_blind',
      primaryGoal: 'learn_digital_skills',
      preferredLanguage: 'en',
    });

    const token = await repo.users.createLinkingToken(user.id);
    expect(token).toMatch(/^link_/);

    const update: TelegramUpdate = {
      update_id: 3001,
      message: {
        message_id: 101,
        from: { id: 554433, first_name: 'Abebe', username: 'abebe_b' },
        chat: { id: 554433, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: `/start ${token}`,
      },
    };

    const linkResult = await TelegramService.processUpdate(update);
    expect(linkResult.handled).toBe(true);
    expect(linkResult.replyText).toContain('Account Successfully Linked');
    expect(linkResult.replyText).toContain('Abebe Bikila');

    // Verify user is now linked by chatId
    const linked = await repo.users.getByTelegramChatId('554433');
    expect(linked).not.toBeNull();
    expect(linked?.fullName).toBe('Abebe Bikila');

    // Test greeting as linked user
    const greetingUpdate: TelegramUpdate = {
      update_id: 3002,
      message: {
        message_id: 102,
        from: { id: 554433, first_name: 'Abebe' },
        chat: { id: 554433, type: 'private' },
        date: Math.floor(Date.now() / 1000),
        text: 'hi',
      },
    };

    const greetingResult = await TelegramService.processUpdate(greetingUpdate);
    expect(greetingResult.handled).toBe(true);
    expect(greetingResult.replyText).toContain('Abebe');
    expect(greetingResult.replyText).toContain('Welcome to BridgeMate');
  });

  it('generates a personalized deep link token via GET /api/telegram/link-token', async () => {
    const req = new NextRequest('http://localhost:3000/api/telegram/link-token');
    const res = await linkTokenGet(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.token).toMatch(/^link_/);
    expect(json.deepLink).toContain('https://t.me/');
    expect(json.deepLink).toContain('?start=link_');
  });
});
