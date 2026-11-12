import { describe, expect, it } from 'vitest';
import {
  classifyPath,
  listRoot,
  pageNumber,
  toPath,
  withTrailingSlash,
} from '../lib/urls.ts';

describe('classifyPath', () => {
  it.each([
    ['/', 'home'],
    ['/page/2/', 'home'],
    ['/tag/android/', 'tag'],
    ['/tag/android/page/2/', 'tag'],
    ['/category/code/', 'category'],
    ['/category/code/page/18/', 'category'],
    ['/2019/09/small-wins/', 'post'],
    ['/2015/07/we-need-more-bad-ideas-|-manton-reece/', 'post'],
    ['/about/', 'about'],
    ['/404.html', 'notfound'],
    ['/projects/', 'page'],
    ['/podcasts-i-listen-to/', 'page'],
  ])('%s is a %s page', (path, type) => {
    expect(classifyPath(path)).toBe(type);
  });
});

describe('list helpers', () => {
  it('reads the page number', () => {
    expect(pageNumber('/')).toBe(1);
    expect(pageNumber('/page/3/')).toBe(3);
    expect(pageNumber('/tag/android/page/2/')).toBe(2);
  });

  it('finds the first page of a list', () => {
    expect(listRoot('/page/3/')).toBe('/');
    expect(listRoot('/tag/android/page/2/')).toBe('/tag/android/');
    expect(listRoot('/category/code/')).toBe('/category/code/');
  });
});

describe('toPath', () => {
  it('strips the origin and decodes', () => {
    expect(toPath('https://timbroder.com/2015/07/a-%7C-b/')).toBe(
      '/2015/07/a-|-b/',
    );
    expect(toPath('https://timbroder.com/2015/08/aren%E2%80%99t/')).toBe(
      '/2015/08/aren’t/',
    );
  });

  it('leaves a plain path alone', () => {
    expect(toPath('/about/')).toBe('/about/');
  });
});

describe('withTrailingSlash', () => {
  it('adds a slash only when missing', () => {
    expect(withTrailingSlash('/2019/09/small-wins')).toBe('/2019/09/small-wins/');
    expect(withTrailingSlash('/about/')).toBe('/about/');
  });
});
