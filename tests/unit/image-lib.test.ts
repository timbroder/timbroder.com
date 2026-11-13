/** The helpers the image and content scripts share (scripts/images/lib.ts). */
import { describe, expect, it } from 'vitest';
import {
  imageRefs,
  inspectImage,
  isRemote,
  judge,
  localName,
  maskCode,
  setImageAddress,
  STAND_INS,
} from '../../scripts/images/lib.ts';

describe('maskCode', () => {
  it('blanks fenced and inline code and keeps everything else in place', () => {
    const source = 'a `![x](y)` b\n```\n![in](code)\n```\nc';
    const masked = maskCode(source);
    expect(masked).toHaveLength(source.length);
    expect(masked).not.toContain('![');
    expect(masked.startsWith('a ')).toBe(true);
    expect(masked.endsWith('\nc')).toBe(true);
  });

  it('knows an indented fence, and that "```ls -la```" on one line is not a fence', () => {
    expect(maskCode('1. Step\n\t```\n\t![x](y)\n\t```\nafter ![a](b)')).toContain('after ![a](b)');
    const oneLine = '```ls -la```\n![shown](/images/a.png)\n```\ncode\n```';
    expect(maskCode(oneLine)).toContain('![shown](/images/a.png)');
  });
});

describe('imageRefs', () => {
  it('finds markdown images with where their address is', () => {
    const source = 'Text ![A chart](https://x.test/a.png "Title") and ![](/images/b.png).';
    const refs = imageRefs(source);
    expect(refs.map((ref) => [ref.alt, ref.url])).toEqual([
      ['A chart', 'https://x.test/a.png'],
      ['', '/images/b.png'],
    ]);
    for (const ref of refs) expect(source.slice(ref.start, ref.end)).toBe(ref.url);
  });

  it('handles brackets in an address and skips images inside code', () => {
    expect(imageRefs('![](https://x.test/a_(1).png) `![no](code)`').map((ref) => ref.url)).toEqual([
      'https://x.test/a_(1).png',
    ]);
  });

  it('follows an image written with a named address', () => {
    const source = 'An icon ![icon350x350][3] here.\n\n[3]: https://x.test/icon.png\n';
    const [ref] = imageRefs(source);
    expect(ref).toMatchObject({ alt: 'icon350x350', url: 'https://x.test/icon.png' });
    expect(source.slice(ref.start, ref.end)).toBe('https://x.test/icon.png');
  });

  it('tells remote addresses from local ones', () => {
    expect(isRemote('https://x.test/a.png')).toBe(true);
    expect(isRemote('//x.test/a.png')).toBe(true);
    expect(isRemote('/images/a.png')).toBe(false);
  });
});

describe('setImageAddress', () => {
  const source = 'One ![a](/images/missing-image.svg) two ![b](/images/kept.png) three ![c](/images/missing-image.svg).';

  it('points the image at that position at another address, and no other', () => {
    expect(setImageAddress(source, 3, '/images/missing-image.svg', '/images/remote/post/c.png')).toBe(
      'One ![a](/images/missing-image.svg) two ![b](/images/kept.png) three ![c](/images/remote/post/c.png).',
    );
  });

  it('refuses when the image there is not the one expected, or there is none', () => {
    expect(() => setImageAddress(source, 2, '/images/missing-image.svg', '/x.png')).toThrow(
      'Image 2 is /images/kept.png, not /images/missing-image.svg',
    );
    expect(() => setImageAddress(source, 4, '/images/missing-image.svg', '/x.png')).toThrow(
      'There is no image 4',
    );
  });
});

describe('localName', () => {
  it("keeps the file's own name, with the extension its content calls for", () => {
    expect(
      localName('https://lh4.google.com/someone/abc/def/s400/blogger_down1.jpg?imgdl=1', 'png'),
    ).toBe('blogger_down1.png');
    expect(localName('//x.test/a/veruca%20salt.jpg', 'jpg')).toBe('veruca-salt.jpg');
    expect(localName('https://x.test/pub?key=1&output=image', 'png')).toBe('pub.png');
  });
});

describe('inspectImage and judge', () => {
  const png = (width: number, height: number) => {
    const data = Buffer.alloc(33);
    data.writeUInt32BE(0x89504e47, 0);
    data.writeUInt32BE(0x0d0a1a0a, 4);
    data.writeUInt32BE(width, 16);
    data.writeUInt32BE(height, 20);
    return data;
  };
  const gif = (width: number, height: number) => {
    const data = Buffer.alloc(16);
    data.write('GIF89a', 0, 'latin1');
    data.writeUInt16LE(width, 6);
    data.writeUInt16LE(height, 8);
    return data;
  };

  it('reads the type and size of an image', () => {
    expect(inspectImage(png(376, 340))).toEqual({ type: 'png', width: 376, height: 340 });
    expect(inspectImage(gif(16, 16))).toEqual({ type: 'gif', width: 16, height: 16 });
  });

  it('turns down an error page saved as a picture', () => {
    const page = Buffer.from('<html><head><title>404 Not Found</title></head></html>');
    expect(inspectImage(page)).toBeNull();
    expect(judge(page)).toMatchObject({ ok: false, reason: 'not an image' });
  });

  it('turns down a tracking pixel', () => {
    expect(judge(gif(1, 1))).toMatchObject({ ok: false, reason: 'tracking pixel (1x1)' });
  });

  it("turns down a host's stand-in picture, recognised by its content", () => {
    const standIn = png(200, 200);
    const hash = judge(standIn).sha1;
    expect(judge(standIn, { ...STAND_INS, [hash]: 'a stand-in' })).toMatchObject({
      ok: false,
      reason: 'stand-in: a stand-in',
    });
    expect(judge(standIn).ok).toBe(true);
  });
});
