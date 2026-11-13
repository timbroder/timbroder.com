/**
 * How a post written in Contentful looks. Its rich text is turned into the
 * same HTML as markdown, so these should look like any other post.
 */
import RichTextExample from './examples/RichTextExample.astro';

export default {
  component: RichTextExample,
};

/** A picture with a caption, two code blocks (the second without line numbers), a list and a table. */
export const PictureAndCode = {
  args: { slug: 'sample-contentful-picture-and-code' },
};

/** Words only: styles, links, a list and a quote. */
export const Text = {
  args: { slug: 'sample-contentful-post' },
};
