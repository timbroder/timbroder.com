---
title: Bloodborne_20250321184741 Is Not a Title
layout: post
slug: youtube-boss-titles
date: 2026-11-24
category: Code
ai_assisted: true
ai_model: claude-fable-5-2
tags:
- youtube
- ps5
- python
- openai
- claude
- yt-dlp
---

When you share a clip from a PS5 to YouTube, it gets a title like this:

`Bloodborne_20250321184741`

Game name, underscore, timestamp. Technically accurate. Completely useless.

I have a lot of those. When we counted back in January, my channel had 254 videos, and 136 of them still had a title like that. A lot of them are boss fights.

The title I actually want is `Bloodborne: Father Gascoigne Melee PS5`. Which means somebody has to open each video, see who I'm fighting, and type it in. 136 times.

I was never going to do that.

So [Claude Code](https://claude.com/claude-code) and I built [YouTube Boss Title Updater](https://github.com/timbroder/YouTubeBossTitles). It looks at each video, works out which boss is in it, and renames it.

## What it does

One run goes like this:

1. It lists every video on the channel through the [YouTube Data API](https://developers.google.com/youtube/v3).
2. It keeps the ones with a default PS5 title. That's anything ending in an underscore and 14 digits.
3. It takes the game's name off the front.
4. It works out which boss is in the video. (This is the fun part. More below.)
5. It renames the video to `Game: Boss PS5`.
6. It adds the video to a playlist for that game, and makes the playlist if there isn't one.
7. It writes a row to a Google Sheet: old title, new title, and links to the video and the playlist.

Step 2 is one line of Python:

```python
pattern = r".+_\d{14}$"
```

## Finding the boss

It tries the cheap thing first.

**The thumbnail.** YouTube already made one, so there's nothing to download. The script hands it to [OpenAI's](https://platform.openai.com/docs/guides/images-vision) GPT-4o and asks who the boss is. That takes about two seconds.

**Then the video.** If the thumbnail isn't enough, [yt-dlp](https://github.com/yt-dlp/yt-dlp) downloads just the first 90 seconds, at the worst quality it can find. [ffmpeg](https://ffmpeg.org) pulls a frame at 10, 20, 30, 45 and 60 seconds, and all five go to the model in one request. That's more like ten or fifteen seconds.

Here's most of the prompt:

```
Please identify the boss being fought in these images. Look for:
1. Boss health bars or names displayed on screen
2. Large enemy characters that appear to be bosses
3. Arena or environment indicators
4. Boss introduction text or cutscenes

If you can identify a specific boss name, respond with ONLY the boss name.
If you cannot identify a specific boss, respond with "Unknown Boss".
```

Number 1 does a lot of the work. Many of these games put the boss's name on screen next to a giant health bar, so a lot of the time the model only has to read it.

It also gets a list of the game's bosses to pick from, scraped from [Wikipedia](https://www.wikipedia.org) and the game's [Fandom](https://www.fandom.com) wiki.

When we tested it, the whole thing came out to about $0.007 a video. Less than a cent.

## The rules

The AI part is the flashy bit. These are the rules around it.

**Souls-likes get "Melee."** So it's `Bloodborne: Father Gascoigne Melee PS5`, but `Clair Obscur: Expedition 33: Serpenphare PS5`. There's a list: Bloodborne, Dark Souls, Demon's Souls, Sekiro, Lies of P, Nioh and a few more. With a [RAWG](https://rawg.io/apidocs) API key, the script can look a game up instead of relying on the list.

Elden Ring was on that list for the first couple of weeks. Then it came off. You can play Elden Ring as a mage, and then the tag is just wrong.

**It doesn't guess.** If the model isn't sure, it's told to say "Unknown Boss". A second check throws out anything that doesn't look like a name: "Unknown", "Solo", anything ending in "mode", anything under three letters. A video that fails that check keeps its ugly title. An Astro Bot clip with no boss in it did exactly that.

I'd rather have an ugly title than a wrong one.

**Everything can be undone.** The original title is saved in a local SQLite database. `--rollback VIDEO_ID` puts it back, and `--dry-run` shows what would change without touching anything.

## Four days to build

The first commit was January 11th. By the 14th it had tests, CI, a config file, a way to resume a run that got interrupted, a cache, parallel workers and the rollback command.

Here's how that went. Claude wrote a project plan, split into phases. I edited it. (There are seven commits in a row from me that just say "Update PROJECT_PLAN.md".) Then we worked through it as five "sprints", each one its own pull request. All five were merged in two days.

Then Claude wrote a manual test plan and ran it against my real channel, with me checking the results. 54 tests: 40 passed, 14 were skipped, none failed. It turned up one real bug, a missing permission for Google Sheets.

That was the easy part.

## Ten months to keep it running

A script that leans on YouTube and Google isn't done when it works. Here's what has broken since.

**`ffmpeg exited with code 8`.** Twice, months apart, for two different reasons. Neither one was ffmpeg's fault.

In June, my copy of yt-dlp was six months old and couldn't get past YouTube's JavaScript challenge anymore. The only format it could still see was audio-only. So ffmpeg was being asked to grab a video frame from an m4a.

This past weekend, same error. This time YouTube was answering with a 403. The fix was a newer yt-dlp, plus the extra that installs its challenge solver:

```
yt-dlp[default]>=2026.10.21
```

Leave off the `[default]` and the new version fails in a completely different way.

**Google sign-in.** [gspread](https://github.com/burnash/gspread) needs a Drive permission to find the log sheet by name, so we added one. Later, Google refused to grant the YouTube and Drive permissions on the same consent screen: "This request contains scopes that cannot be requested together." Now the script asks twice on the first run and keeps two tokens. And when a saved token expires, it deletes the token and asks again instead of crashing.

**Doing the same work twice.** Every normal run was going back over videos it had already handled, and retrying the failed ones every single time. Now it skips both. Failed videos only get another try with `--resume`.

Don't get me wrong, none of this is a complaint about yt-dlp. They're the ones chasing YouTube's changes so I don't have to.

## What's still rough

- **It only looks at the first minute.** The last frame it grabs is at 60 seconds. If the boss's name hasn't been on screen by then, the video fails.
- **The scraped boss lists aren't great.** In our January test, the Wikipedia scraper sometimes came back with a list of review sites instead of bosses. The model got the bosses right anyway.
- **The tests cover about half the code.** That was the number in January. There are 76 tests now.
- **It'll break again.** YouTube will change something, and I'll be bumping yt-dlp. Again.

## Try it

It's on GitHub under the MIT license: [timbroder/YouTubeBossTitles](https://github.com/timbroder/YouTubeBossTitles). You need Python 3.10 or newer, ffmpeg, a Google Cloud project for the YouTube and Sheets APIs, and an OpenAI key. The README walks through all of it.

Start with `--dry-run`.

Huge thanks to the folks behind [yt-dlp](https://github.com/yt-dlp/yt-dlp), [ffmpeg](https://ffmpeg.org) and [gspread](https://github.com/burnash/gspread). This script is mostly glue between their work.

---

*This post was written by Claude (Anthropic's AI assistant) based on the project's README, pull requests and commit history, and the voice guide in this repository. Claude Code also built the tool described here with me.*
