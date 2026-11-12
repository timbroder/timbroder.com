---
title: Reading on My Kobo, Listening on My Phone, Never Losing My Place
layout: post
slug: kobo-audiobook-sync
date: 2026-11-11
category: Code
ai_assisted: true
tags:
- homelab
- kobo
- audiobooks
- audiobookshelf
- storyteller
- koreader
- docker
---

I read on a Kobo. I also listen to audiobooks on my phone. What I've wanted for a long time is for those to be the *same* book.

Switching formats mid-book is miserable. You finish a chapter on the Kobo, switch to the audiobook, and then spend five minutes scrubbing around trying to find the sentence you stopped on.

Amazon solved this ages ago with Whispersync. But I don't read on a Kindle, and my books and audiobooks live on my own server.

So I built my own. Put the Kobo down, pick up the phone, hit play, and the audio starts where I stopped reading. And the other way around.

Here's how it works.

## The short version

There are two separate problems hiding in here:

1. **Processing.** Something has to figure out which second of the audiobook matches which sentence of the epub. This happens once per book.
2. **Syncing.** Something has to watch my position on every device and translate it between "page in a book" and "timestamp in an audio file." This happens all the time.

Three containers do the real work, with a fourth in a supporting role:

```
iPhone audiobook app  <-->  Audiobookshelf
                                 ^
                                 |   audio time <-> text position
                                 v
                            BookBridge  <--  Storyteller
                                 ^           (word-level alignment)
                                 |
                     built-in KOReader sync server
                         ^                 ^
                         |                 |
                  Kobo (KOReader)    iPhone (Readest)
```

## The containers

Everything on my home server runs as a [Docker](https://www.docker.com) container out of one Compose file. These are the ones involved:

**[Audiobookshelf](https://audiobookshelf.org)** is the audiobook server. Think Plex, but for audiobooks. It holds the audio files, serves them to its iOS app, and remembers how far into each book I am. This is the *audio side* of the whole thing.

**[Storyteller](https://storyteller-platform.dev)** is the alignment engine. You hand it an epub and the matching audiobook, and it works out exactly where every sentence of the text lands in the audio. It also serves the finished ebooks to my devices through an OPDS catalog (basically a bookstore feed that e-reader apps know how to browse).

**[BookBridge](https://github.com/cporcellijr/bookbridge)** is the sync engine, and the piece that ties it all together. It used to be called abs-kosync-bridge. It knows about my Audiobookshelf progress and my e-reader progress, and it translates between them.

**[Calibre](https://calibre-ebook.com)** (and [calibre-web](https://github.com/janeczku/calibre-web)) is where my epubs live in the first place. It isn't part of the sync loop. It's just the library that Storyteller and BookBridge read from.

And one that's on its way out: a **standalone KOReader sync server**. [KOReader](https://koreader.rocks) (the reading app I run on the Kobo) has its own little progress sync protocol, and I originally ran a separate container for it. BookBridge ships with that server built in now, so the standalone one is retired. One less thing to keep running.

On the devices:

- **Kobo:** [KOReader](https://koreader.rocks), instead of the stock Kobo reader.
- **iPhone, text:** [Readest](https://readest.com), which speaks the same KOReader sync protocol.
- **iPhone, audio:** the Audiobookshelf app.

## How a book gets processed

This is the part I find really cool.

An epub and an audiobook are the same words in two totally different shapes. One is text in chapters. The other is eleven hours of someone talking. Nothing in either file tells you how they line up.

Storyteller figures it out with *forced alignment*:

1. **It transcribes the audiobook.** It runs the audio through [Whisper](https://github.com/openai/whisper), OpenAI's open source speech-to-text model. Out comes a transcript where every word has a timestamp.
2. **It matches the transcript to the book.** The transcript won't be perfect, but it doesn't have to be. Storyteller already has the real text from the epub, so it only needs to find where each sentence of the book shows up in the transcript. That's why I can get away with Whisper's small "base" model. It's not writing the book, it's just finding it.
3. **It writes out the results.** One is a new "readaloud" epub with the audio baked in and a [media overlay](https://www.w3.org/TR/epub-33/#sec-media-overlays), which is the epub standard's way of saying "this sentence plays from 4:31:07 to 4:31:12." The other is the word-level timeline itself, saved alongside the book.

That timeline is the thing I actually care about. It's the map between the two formats.

Don't get me wrong, this is not fast. My server is a little mini PC with no GPU, and I cap Storyteller at two CPU cores so it doesn't starve everything else. An eleven hour audiobook takes roughly overnight. I queue it up and check on it in the morning.

Then BookBridge picks it up. I match the Audiobookshelf audiobook to the Storyteller book in its dashboard, and it ingests Storyteller's timeline and builds its own set of *anchors*: points where it knows a specific piece of text equals a specific moment in the audio. For the first book I set up, that was a bit over 52,000 anchors.

Because Storyteller already did the heavy lifting, this step takes seconds.

The whole pipeline, per book:

1. Epub goes into Calibre, audiobook goes into Audiobookshelf.
2. Storyteller aligns the two. (Overnight.)
3. BookBridge links the audiobook to the aligned book. (Seconds.)
4. I download the ebook to the Kobo from Storyteller's catalog.

## How the sync works

Once a book is linked, here's what happens when I actually read.

**Kobo to audio.** I read a few chapters and put the Kobo to sleep. KOReader pushes my position to the sync server built into BookBridge. BookBridge looks at where I am, pulls out the sentence at that spot, finds that sentence in the alignment, and gets a timestamp. Then it tells Audiobookshelf "Tim is at 4:31:07."

Next time I open the audiobook app, that's where it starts.

**Audio to Kobo.** Same thing backwards. BookBridge checks Audiobookshelf for my listening position, maps the timestamp to a sentence, finds that sentence in the epub, and updates the reading position. When I wake up the Kobo, KOReader asks the sync server where I am and offers to jump ahead.

Readest on my phone works exactly like the Kobo. It's just another text client on the same sync server, so all three stay together.

The trick BookBridge uses is matching on *the actual sentence* rather than a percentage. "43% through the epub" and "43% through the audio" are not the same place. Audiobooks have intros and credits, narrators speed up and slow down, some chapters are dense. Anchoring on the text lands me on the right sentence, not just the right neighborhood.

It's not instant in both directions. When I stop reading, the Kobo pushes right away. Going the other way, BookBridge checks Audiobookshelf about once a minute, so if I stop listening and grab the Kobo immediately, it can be a beat behind.

## The part that bit me

For a while, nothing synced and nothing complained. Everything looked healthy. Positions just never moved.

After a lot of debugging with Claude, the cause turned out to be how KOReader identifies a book. It doesn't use the title or the ISBN. It uses a *fingerprint of the file itself*, a hash built from small samples of the file's contents.

Which means every device has to have the *byte-for-byte identical* epub, and BookBridge has to know that same fingerprint.

Two things were breaking that:

- Storyteller offers two downloads for every book: the big readaloud epub with audio inside, and the small text-only one. Different files, different fingerprints. If the Kobo grabs one and the phone grabs the other, they're different books as far as the sync server is concerned.
- BookBridge had fingerprinted its own copy of the big file, while my devices were reading the small one. So my Kobo's updates were arriving and getting filed under a book the bridge didn't recognize.

The fix was boring once I understood it: always download the small text-only epub, on every device, and tell BookBridge which fingerprint my devices are actually sending. It has a spot for exactly that on each book.

Here's my rule now: **one epub file, one fingerprint, everywhere.**

The same rule means that if Calibre rewrites an epub after I've aligned it (say, I fix the metadata), the file changes and I need to align it again.

## What's still rough

- **Linking a book is manual.** There are a few clicks per book, plus a wait overnight. This is not "buy a book and it just works."
- **Storyteller's status can fib.** The UI will sometimes say a book is aligned while it's still chewing on it. I've learned to check the logs before moving on.
- **I haven't run my whole library through it.** I do this one book at a time, for books I know I'll both read and listen to.
- **Storyteller has its own apps** that play the readaloud books directly, with the text highlighting as it's narrated. That's genuinely neat, but the iOS app was flaky for me, which is how I ended up using Audiobookshelf for audio and letting BookBridge do the syncing instead.

At the end of the day, though, I finish a chapter on the Kobo, pick up my phone, hit play, and I'm on the next sentence. That's all I ever wanted from this.

Huge thanks to the folks behind [Storyteller](https://storyteller-platform.dev), [BookBridge](https://github.com/cporcellijr/bookbridge), [Audiobookshelf](https://audiobookshelf.org), and [KOReader](https://koreader.rocks). I just plugged their work together.

---

*This post was written by Claude (Anthropic's AI assistant) based on my setup notes and my conversations with it while building this, and the voice guide in this repository.*
