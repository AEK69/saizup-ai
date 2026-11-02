import { createHash } from 'node:crypto';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

const fontDirectory = path.join(process.cwd(), 'public', 'user-fonts');
const MAX_FONT_BYTES = 10 * 1024 * 1024;
const FONT_FORMATS: Record<string, string> = {
  woff2: 'woff2',
  woff: 'woff',
  ttf: 'truetype',
  otf: 'opentype',
};

function safeFamilyName(value: string) {
  return value.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 48) || 'Uploaded Font';
}

function safeFileSlug(value: string) {
  return safeFamilyName(value).toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-') || 'uploaded-font';
}

function hasValidSignature(bytes: Buffer, extension: string) {
  if (extension === 'woff') return bytes.toString('ascii', 0, 4) === 'wOFF';
  if (extension === 'woff2') return bytes.toString('ascii', 0, 4) === 'wOF2';
  if (extension === 'otf') return bytes.toString('ascii', 0, 4) === 'OTTO';
  return extension === 'ttf' && bytes.length >= 4 && bytes[0] === 0 && bytes[1] === 1 && bytes[2] === 0 && bytes[3] === 0;
}

export async function GET() {
  try {
    const entries = await readdir(fontDirectory, { withFileTypes: true });
    const fonts = entries
      .filter((entry) => entry.isFile())
      .flatMap((entry) => {
        const extension = path.extname(entry.name).slice(1).toLowerCase();
        const slug = path.basename(entry.name, path.extname(entry.name)).replace(/-[a-f0-9]{16}$/, '');
        const family = safeFamilyName(slug.replace(/-/g, ' '));
        return FONT_FORMATS[extension]
          ? [{ family, url: `/user-fonts/${entry.name}`, format: FONT_FORMATS[extension] }]
          : [];
      });
    return NextResponse.json({ fonts });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return NextResponse.json({ fonts: [] });
    console.error('Could not list uploaded fonts', error);
    return NextResponse.json({ error: 'ອ່ານລາຍການຟອນບໍ່ສຳເລັດ' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('font');
    if (!(file instanceof File)) return NextResponse.json({ error: 'ກະລຸນາເລືອກໄຟລ໌ຟອນ' }, { status: 400 });
    if (file.size < 4 || file.size > MAX_FONT_BYTES) {
      return NextResponse.json({ error: 'ຟອນຕ້ອງມີຂະໜາດບໍ່ເກີນ 10 MB' }, { status: 413 });
    }

    const extension = path.extname(file.name).slice(1).toLowerCase();
    if (!FONT_FORMATS[extension]) {
      return NextResponse.json({ error: 'ຮອງຮັບສະເພາະ WOFF2, WOFF, TTF ແລະ OTF' }, { status: 415 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (!hasValidSignature(bytes, extension)) {
      return NextResponse.json({ error: 'ໄຟລ໌ບໍ່ແມ່ນຟອນຮູບແບບທີ່ເລືອກ' }, { status: 415 });
    }

    await mkdir(fontDirectory, { recursive: true });
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const slug = safeFileSlug(file.name);
    const existing = await readdir(fontDirectory);
    if (existing.some((name) => name.startsWith(`${slug}-`) || name.includes(`-${hash}.`))) {
      return NextResponse.json({ error: 'ຟອນນີ້ມີຢູ່ໃນເວັບແລ້ວ ບໍ່ສາມາດອັບໂຫຼດຊ້ຳໄດ້' }, { status: 409 });
    }

    const storedName = `${slug}-${hash}.${extension}`;
    await writeFile(path.join(fontDirectory, storedName), bytes, { flag: 'wx' });
    return NextResponse.json({
      font: {
        family: safeFamilyName(file.name),
        url: `/user-fonts/${storedName}`,
        format: FONT_FORMATS[extension],
      },
    }, { status: 201 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      return NextResponse.json({ error: 'ຟອນນີ້ມີຢູ່ໃນເວັບແລ້ວ' }, { status: 409 });
    }
    console.error('Could not save uploaded font', error);
    return NextResponse.json({ error: 'ບັນທຶກຟອນບໍ່ສຳເລັດ' }, { status: 500 });
  }
}
