import { NextResponse } from 'next/server';

export type ParsedJson = { ok: true; value: unknown } | { ok: false; response: NextResponse };

export async function parseJsonRequest(request: Request): Promise<ParsedJson> {
  try {
    const value: unknown = await request.json();
    return { ok: true, value };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 }),
    };
  }
}