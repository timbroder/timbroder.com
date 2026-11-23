import { describe, expect, it } from 'vitest';
import { hasWords } from '../../src/lib/search-index.ts';

describe('whether a post has words of its own', () => {
  it('is true for text, however little', () => {
    expect(hasWords('<p>Great short read.</p>')).toBe(true);
    expect(hasWords('<p><img src="/images/a.png" alt=""></p><p>Ha</p>')).toBe(true);
    expect(hasWords('<pre><code>npm test</code></pre>')).toBe(true);
    expect(hasWords('<p>2019</p>')).toBe(true);
    expect(hasWords('<p>Ça</p>')).toBe(true);
  });

  it('is false for a post that is only a picture, a video or nothing', () => {
    expect(hasWords('')).toBe(false);
    expect(hasWords('<p><img src="/images/2014/04/140324.jpg" alt="140324"></p>')).toBe(false);
    expect(hasWords('<p><a href="http://www.youtube.com/watch?v=1"><img src="/images/remote/0.jpg" alt=""></a></p>')).toBe(false);
    expect(hasWords('<iframe src="https://www.youtube.com/embed/1">Your browser has no frames.</iframe>')).toBe(false);
    expect(hasWords('<p> </p>\n<p>—</p>')).toBe(false);
  });

  it('does not count code that runs or styles as words', () => {
    expect(hasWords('<script>var words = "these are not for readers";</script>')).toBe(false);
    expect(hasWords('<style>p { color: red }</style><p><img src="/a.png" alt="A picture"></p>')).toBe(false);
  });
});
