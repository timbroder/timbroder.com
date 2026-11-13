/**
 * One story per language used in posts, plus the awkward cases.
 *
 * Code blocks are the one part of the design that does not have to match the
 * Gatsby site pixel for pixel, so this is where their look is reviewed.
 */
import CodeBlock from './CodeBlock.astro';

export default {
  component: CodeBlock,
};

export const Python = {
  args: {
    lang: 'python',
    code: `import gdata.blogger.service

def get_posts(blog_id, start=1, count=10):
    """Return a page of posts, newest first."""
    service = gdata.blogger.service.BloggerService()
    query = gdata.service.Query(feed='/feeds/%s/posts/default' % blog_id)
    query.start_index = start
    query.max_results = count
    return service.Get(query.ToUri()).entry`,
  },
};

export const Php = {
  args: {
    lang: 'php',
    code: `<?php
class Tim_Review_Block_Form extends Mage_Review_Block_Form
{
    protected function _construct()
    {
        parent::_construct();
        $this->setTemplate('review/form.phtml');
    }
}`,
  },
};

export const Swift = {
  args: {
    lang: 'swift',
    code: `let predicate = NSPredicate(format: "owner == %@ AND title == %@", owner, title)
let query = CKQuery(recordType: "Note", predicate: predicate)

database.perform(query, inZoneWith: nil) { records, error in
    guard let records = records else { return }
    print("Found \\(records.count) notes")
}`,
  },
};

export const Html = {
  args: {
    lang: 'html',
    code: `<div class="post">
  <h2><a href="/2019/09/small-wins/">Small Wins</a></h2>
  <p>Remember to value the little wins.</p>
</div>`,
  },
};

export const C = {
  args: {
    lang: 'c',
    code: `#include <stdio.h>

int main(void) {
    for (int i = 0; i < 3; i++) {
        printf("win %d\\n", i);
    }
    return 0;
}`,
  },
};

export const JavaScript = {
  args: {
    lang: 'javascript',
    code: `javascript:(function () {
  const links = document.querySelectorAll('a.issue-link');
  links.forEach((link) => window.open(link.href, '_blank'));
})();`,
  },
};

export const Xml = {
  args: {
    lang: 'xml',
    code: `<layout version="0.1.0">
  <default>
    <reference name="content">
      <block type="review/form" name="product.review.form" />
    </reference>
  </default>
</layout>`,
  },
};

export const Css = {
  args: {
    lang: 'css',
    code: `.post h2 {
  font-weight: 600;
  letter-spacing: -0.025em;
}`,
  },
};

export const Bash = {
  args: {
    lang: 'bash',
    code: `# Open the tabs I always need
alias work='cd ~/workspace && git status'
docker compose up -d && docker compose logs -f app`,
  },
};

export const Yaml = {
  args: {
    lang: 'yaml',
    code: `services:
  audiobookshelf:
    image: ghcr.io/advplyr/audiobookshelf:latest
    ports:
      - "13378:80"
    volumes:
      - ./audiobooks:/audiobooks`,
  },
};

export const Ruby = {
  args: {
    lang: 'ruby',
    code: `map.home '', :controller => 'projects', :action => 'show', :id => 'main'`,
  },
};

export const AppleScript = {
  args: {
    lang: 'applescript',
    code: `tell application "System Settings"
    activate
    reveal pane id "com.apple.Trackpad-Settings.extension"
end tell`,
  },
};

/** No language given, or one the highlighter does not know. */
export const PlainText = {
  args: {
    code: `iPhone audiobook app  <-->  Audiobookshelf
                                 ^
                                 |   audio time <-> text position
                                 v
Kobo (KOReader)       <-->  Storyteller`,
  },
};

/** A long line scrolls sideways inside the block; it does not wrap or widen the page. */
export const LongLine = {
  args: {
    lang: 'bash',
    code: `curl -s "https://example.com/api/v1/feeds/posts/default?alt=json&max-results=500&start-index=1&orderby=published&fields=entry(title,link,published)" | jq '.feed.entry[] | .title'`,
  },
};

/** Line numbers stay aligned past nine and past ninety-nine. */
export const ManyLines = {
  args: {
    lang: 'python',
    code: Array.from({ length: 120 }, (_, i) => `print("line ${i + 1}")`).join('\n'),
  },
};
