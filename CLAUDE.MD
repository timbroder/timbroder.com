# Tim Broder's Writing Voice Guide

This document captures the writing voice and style of Tim Broder based on analysis of blog posts from 2007-2026. Use this guide when writing blog posts or content in Tim's voice.

## Core Voice Characteristics

### Tone
- **Direct and conversational** - Write like you're explaining something to a friend over coffee
- **Personal and authentic** - Don't be afraid to share struggles, uncertainties, or learning moments
- **Humble and self-aware** - Acknowledge when things aren't perfect or when you're still figuring things out
- **Practical over theoretical** - Focus on "here's what I did" and "here's what works" rather than abstract concepts

### Personality Traits That Come Through
- Curious and always learning
- Values community and giving credit to others
- Appreciates rituals and thoughtful processes
- Balances technical depth with accessibility
- Self-deprecating humor without being negative
- Honest about both successes and imperfections

## Writing Style Guidelines

### Sentence Structure
- **Mix short and long sentences** - Use variety for rhythm
- **Sentence fragments are OK** - "For me it was comics, computers, books. Now, add a liiiitle bit of coffee into that."
- **Conversational transitions** - "Don't get me wrong...", "But, as I've written about previously...", "Here's what I do:"
- **Em-dashes for asides** - Use them liberally for parenthetical thoughts

### Paragraph Structure
- **Keep paragraphs short** - 1-3 sentences is common
- **Lots of white space** - Makes content scannable
- **Use line breaks for emphasis** - Single-line paragraphs for impact

### Technical Content
- **Code blocks with context** - Show the code, but explain why it matters
- **Accessible explanations** - Don't assume everyone knows everything
- **Link to documentation** - Help readers learn more
- **Problem → Solution structure** - Start with the problem you faced, then show how you solved it

### Linking Style
- **Link liberally** - To tools, other blogs, documentation, Twitter handles
- **Give credit generously** - Reference people by name and link to their work
- **Conversational link text** - "Great 2 part series by [@jesse_squires](link)" rather than "Click here"

### Personal vs Technical Balance
- **Mix both freely** - Technical posts can have personal context
- **Share the "why"** - Why does this matter? Why did you choose this approach?
- **Include rituals and process** - The journey matters as much as the destination

## Content Patterns

### Opening Strategies
1. **The Problem Hook** - "Mac OS has not handled natural scrolling... gracefully"
2. **The Personal Context** - "I've been meaning to write about what I do for coffee for a while"
3. **The Link + Commentary** - "Great short read. Remember to value the little wins"
4. **The Direct Statement** - "As part of taking a new position at..."

### Common Structures
1. **Problem → Investigation → Solution** (Technical posts)
2. **Inspiration → Personal Take → Practical Application** (Reflection posts)
3. **Question → Multi-layered Answer** (Advice posts)
4. **Link → Why It Matters → Key Quotes** (Link posts)

### Closing Strategies
- Practical takeaway or call to action
- Acknowledgment of nuance ("It doesn't matter. ENJOY your coffee")
- Summary of key points
- Sometimes no formal conclusion - just end when you're done

## Language and Word Choice

### Preferred Phrases
- "Don't get me wrong..."
- "Here's what I do:"
- "At the end of the day..."
- "For me it's..."
- "I've been meaning to..."
- "After some debugging with..."

### Emphasis Techniques
- **Bold for key points** - Sparingly
- *Italics for emphasis* - When you'd stress a word while speaking
- Repeated letters for emphasis - "liiiitle bit", "darned"
- ALL CAPS - Rarely, only for strong emphasis

### Casual Elements
- Contractions everywhere (I've, don't, that's)
- Parenthetical asides (Granted, that's good coffee)
- Informal language mixed with technical terms
- References to specific tools, people, and communities

## Content Categories

### Technical Posts
- Start with the problem or context
- Show your solution with code
- Explain why it works or what you learned
- Link to related resources
- Keep it practical and reproducible

### Personal Reflections
- Share authentic experiences
- Connect to broader themes (rituals, balance, growth)
- Keep it concise - 2-4 paragraphs is often enough
- End with a clear takeaway

### Link Posts
- Quote the best parts
- Add your perspective on why it matters
- Keep it brief - let the linked content do the heavy lifting
- Credit the author prominently

### Leadership/Professional Development
- Can be more structured and formal, but still personal
- Use numbered lists for clarity
- Share both principles and practical examples
- Reference real experiences, not abstract theory

## What NOT to Do

❌ **Avoid overly formal academic language** - "One might consider" → "I think"
❌ **Avoid marketing speak** - No "leverage", "synergy", or "paradigm shift"
❌ **Avoid explaining obvious things** - Trust your reader's intelligence
❌ **Avoid being preachy** - Share what works for you, not universal truths
❌ **Avoid hiding uncertainty** - If you're not sure, say so
❌ **Avoid walls of text** - Break it up
❌ **Avoid generic advice** - Make it specific and personal

## Example Voice Transformations

### ❌ Too Formal
"One should consider implementing a systematic approach to tracking incremental progress markers throughout the development lifecycle."

### ✅ Tim's Voice
"Remember to value the little wins. Not just the big ones."

---

### ❌ Too Generic
"Coffee preparation can be an important part of your morning routine and there are many methods to choose from."

### ✅ Tim's Voice
"Some of what I do with coffee is for the taste. Some of it is the ritual of preparing it and the comfort that it brings. Some of it is feeling included in a club, even if that club exists only online in the form of twitter, slack, and blog posts."

---

### ❌ Too Technical (No Context)
"Use the inverted AeroPress method with a 2-minute steep time."

### ✅ Tim's Voice
"I use an AeroPress and LOVE it. Even if you use coffee grinds from the supermarket, the Aeropress make brewing so darned easy. Both brewing and cleaning."

## Checklist for Writing in Tim's Voice

Before publishing, ask yourself:

- [ ] Does this sound like something I'd say to a friend?
- [ ] Have I linked to relevant tools, people, or resources?
- [ ] Is there enough white space and paragraph breaks?
- [ ] Am I being honest about limitations or uncertainties?
- [ ] Have I given credit where it's due?
- [ ] Does the opening hook the reader immediately?
- [ ] Is the technical content balanced with context?
- [ ] Would I actually use these words in conversation?
- [ ] Have I added proper attribution for AI-generated content?

## Attribution for AI-Generated Content

**IMPORTANT:** All AI-generated blog posts must include clear attribution to maintain transparency with readers.

### Attribution Format

Add this note at the **end of the post** (after the main content, before any closing links):

```markdown
---

*This post was written by Claude (Anthropic's AI assistant) based on [my experiences/my notes/my outline/etc.] and the voice guide in this repository.*
```

### Alternative Formats

**For posts with significant human input:**
```markdown
---

*This post was co-written with Claude, Anthropic's AI assistant, using the voice guide in this repository.*
```

**For link posts or short reflections:**
```markdown
---

*Written by Claude using Tim's voice guide.*
```

### Front Matter Addition (Optional)

You can also add an `ai_assisted` field to the front matter for filtering or display purposes:

```yaml
---
title: Your Post Title
layout: post
date: YYYY-MM-DD
ai_assisted: true
ai_model: claude-sonnet-4-5
---
```

### Why Attribution Matters

- **Transparency** - Readers deserve to know when content is AI-generated
- **Trust** - Honest attribution builds credibility
- **Evolving practice** - As AI tools become more common, clear attribution sets a good example
- **Learning** - Helps readers understand what AI can and cannot do well

## Blog Post Front Matter Template

```yaml
---
title: [Your Title Here]
layout: post
slug: [url-friendly-slug]
date: YYYY-MM-DD
category: [Code, Life, Leadership, etc.]
tags:
- tag1
- tag2
---
```

---

*Last Updated: 2026-01-16*
*Based on analysis of 25+ blog posts from timbroder.com (2007-2026)*
