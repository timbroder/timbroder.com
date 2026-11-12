---
title: I Built a Robot to Move My Books From Goodreads to StoryGraph
layout: post
slug: goodreads-to-storygraph-sync
date: 2026-11-12
category: Code
tags:
- docker
- playwright
- python
- books
- claude
ai_assisted: true
ai_model: claude-sonnet-5-5
---

I've been meaning to move my reading life over to [The StoryGraph](https://www.thestorygraph.com/) for a while. Goodreads still has all my history, though. And honestly, Goodreads is where the rest of my reading friends live.

So I wanted both. Without thinking about it.

Neither site has a public API I could lean on. (Goodreads shut theirs down years ago.) What they do have is an export button on one side and an import button on the other. Click, download, click, upload. Every time I finish a book.

That's not hard. It's just *tedious*, and tedious things don't happen.

## So I automated the clicking

[Goodreads2Storygraph](https://github.com/timbroder/Goodreads2Storygraph) is a Docker container that runs on a schedule (3 AM by default), logs into Goodreads, exports your library, and gets it into StoryGraph. Set it up once, forget it.

The browser part is [Playwright](https://playwright.dev/) driving headless Chromium, because there's nothing else to drive. It reuses saved login sessions so it isn't logging in from scratch every night, and when something breaks it drops a screenshot and a per-run log in a folder so I can see what the page looked like.

Don't get me wrong, scraping through a browser is not elegant. It's the thing you do when the front door is locked. All the selectors live in one file (`selectors.py`), so when either site changes its markup I'm fixing one place.

One caveat up front: you have to turn off 2FA on both accounts. That's a real tradeoff and I'm not thrilled about it. Run it on a machine you trust.

## Version one: dumb on purpose

The first version did the least clever thing possible. Export the CSV, hash it, and if the hash matches last night's, skip. Otherwise upload the whole file and let StoryGraph sort out duplicates.

No transformation, no database. I wrote the plan down first (it's in `PROJECT_PLAN.md`), and then built it in phases: core package, Docker, config, tests, CI, deployment. Claude did a lot of the typing on those, one PR per phase. I mostly reviewed and argued with it.

Then I added multi-account support, mainly because I wanted to run it for a couple of other people's libraries too. Each account gets its own state, its own browser session, and its own error handling, so one broken login doesn't take down the rest.

## Where "upload everything" falls apart

Here's the problem I kept running into. An import is a blunt instrument. It's great at "here's a pile of books, add the ones you don't have." It's not great at "I *finished* this one yesterday, it used to be on my to-read shelf."

I'll be upfront: I haven't tested every way the importer handles status changes, and I wasn't happy with having to wonder. I wanted the sync to know what had *changed* and apply only that.

So the latest piece is a delta sync.

## How the delta sync works

Here's what it does on each run:

1. **Seed a baseline from StoryGraph.** The first time, it scrapes what's *already* on StoryGraph and stores it in a local SQLite database (one row per book, per account). That's the "what the other side looks like right now" snapshot.
2. **Read Goodreads.** It parses the export CSV and keeps four shelves: to-read, currently-reading, read, and did-not-finish. Anything else gets ignored.
3. **Compute the delta.** Compare the two. Books that aren't on StoryGraph are *additions*. Books that are there with a different status are *updates*.
4. **Apply just those changes** through the browser.

The heart of it is small enough to show:

```python
for book_key, desired in desired_books.items():
    current = current_books.get(book_key)
    if current is None:
        additions.append(desired)
        continue

    if current.status != desired.status:
        updates.append(...)  # same book, new shelf
```

The interesting question is what "same book" means, since the two sites don't share IDs. The key is the ISBN-13 when I have one, and otherwise a normalized `title|author` string (lowercased, punctuation stripped, whitespace collapsed).

That's why the ISBN stuff matters. Goodreads exports ISBNs in a weird `="978..."` format (a spreadsheet-formula trick, I think), and plenty of books come through with none at all. So there's an [Open Library](https://openlibrary.org/developers/api) and [Google Books](https://developers.google.com/books) lookup that fills in missing ISBNs, rate limited and cached on disk so I'm not hammering anyone.

## What it doesn't do (yet)

Honest list:

- **Rereads.** If you've read a book three times, it keeps the first row and moves on. There's a comment in the code that literally says "rereads and richer history come later."
- **Dates, ratings, reviews.** Right now it's shelves only. Status is the thing I cared about most.
- **Fuzzy matching.** If the ISBN is missing and the title is spelled differently on each site, it'll see two books. I'd rather have a duplicate than a wrong merge, but it's still a duplicate.
- **Resilience to redesigns.** Both sites can change tomorrow. Selectors are centralized, but I'll still be the one fixing them.

There's a `DRY_RUN` mode that does everything except the final write to StoryGraph. Use it first. I did.

## Why bother

At the end of the day, it's a small thing. A few hundred lines of Python so I don't have to remember to click four buttons.

But I like that my reading history now lives in two places and I don't have to be the one keeping them in step. It's the kind of automation I like best — boring, quiet, and checked by a log file instead of my attention.

The code's [on GitHub](https://github.com/timbroder/Goodreads2Storygraph). If you try it and something breaks, I'd like to hear about it. (Bring the screenshot from the artifacts folder.)

---

*This post was written by Claude (Anthropic's AI assistant) based on my notes, the code and commit history in this repository, and the voice guide in my blog repository.*
