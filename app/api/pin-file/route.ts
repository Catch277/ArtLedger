import { NextResponse } from 'next/server';
import { apiErrorResponse } from '../_lib/apiErrorResponse';
import { MAX_IMAGE_BYTES, isAllowedImageType } from '@/lib/domain/config/upload';
import { pinataJwt } from '@/lib/infrastructure/config/env';
import { PinataIpfsPinner } from '@/lib/infrastructure/ipfs/PinataIpfsPinner';
import { PinArtworkFileUseCase } from '@/lib/usecases/PinArtworkFileUseCase';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Yêu cầu phải là multipart/form-data với trường file.' }, { status: 415 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Không đọc được tệp gửi lên.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Thiếu trường file trong yêu cầu.' }, { status: 400 });
  }
  if (!isAllowedImageType(file.type)) {
    return NextResponse.json({ error: 'Chỉ nhận ảnh PNG, JPG, WEBP hoặc GIF.' }, { status: 415 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'Ảnh vượt quá 4 MB. Chọn tệp nhỏ hơn.' }, { status: 413 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'Tệp rỗng. Chọn ảnh khác.' }, { status: 400 });
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pinner = new PinataIpfsPinner(pinataJwt());
    const result = await new PinArtworkFileUseCase(pinner).execute({
      bytes,
      filename: file.name.length > 0 ? file.name : 'artwork',
      contentType: file.type,
    });
    return NextResponse.json({ cid: result.cid, uri: result.uri }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'pin-file');
  }
}