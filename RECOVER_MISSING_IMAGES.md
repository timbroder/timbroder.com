# Recovering the missing images

This is a job description for a Claude session (or a person) that can open Tim's Google Photos library. The session that moved the site from Gatsby to Astro could not: the library is not linked on the laptop it ran on.

## The situation

Posts from 2007 to 2015 showed pictures that were hosted elsewhere: on Picasa Web Albums, on Blogger, on Flickr. Those hosts no longer serve them. During the migration every remote image was looked for at its original address and in the Internet Archive. 109 were found and now live in this repo. **90 were not found anywhere**, and the 43 posts that showed them show a placeholder instead: a crooked picture frame with a tumbleweed, `/images/missing-image.svg`.

Tim believes the originals of most of them are in his Google Photos library. Picasa Web Albums was folded into Google Photos, and he moved his Flickr photos there.

**Your job is to find as many of the 90 as you can in Google Photos and put them back.**

## What done looks like

- Each picture you found is a file under `public/images/remote/<post>/`, and its post shows it where the placeholder was.
- `content/image-sources.json` says where each one came from.
- The build and the tests pass.
- A pull request lists what you recovered, what you could not find, and what you were unsure about.

Finding all 90 is not expected. A picture you are not sure about stays a placeholder. A wrong picture in a post is worse than a missing one.

## Before you start

You need:

- **This repository**, with Node 22 or later (`.nvmrc`). Run `npm ci` once.
- **A way to see Tim's Google Photos.** Either a browser signed in to his account, or a folder holding a Google Takeout export that Tim has downloaded for you.

If you have neither, stop and tell Tim which one you need. Do not look for another way in.

Branch from `main`.

## Step 1: see what is missing

```sh
node scripts/images/recover.ts --list
```

It prints every missing image, post by post:

```
Blogger resumes service  (2007-08-22)
  content/blog/2007-08-22-blogger-resumes-service.md
  image 1 of 2: blogger_down1.jpg
      was on:  Picasa Web Albums, shown at 400 px on its long side
      follows: …Blogger was down this morning from a little after 9:30 until a few minutes ago, but now, all is well...
      address: https://lh4.google.com/…/s400/blogger_down1.jpg?imgdl=1
```

- **The date** is the day the post was published. The picture was taken or uploaded on that day or shortly before.
- **The file name** is the name the picture had when Tim uploaded it. Flickr is the exception: its names are Flickr's own numbers.
- **`follows`** is the text just before the picture in the post. Read the post itself for more; it usually says what the picture shows.
- **`address`** is what you pass to the script in step 3. Copy it exactly.

Add `--json` to get the same list as data.

Where the pictures were, and what that means for the search. One picture was shown twice, so the 90 pictures account for 91 placeholders:

| Was on | Placeholders | What to expect |
|---|---|---|
| Blogger (uploaded with the post) | 42 | Screenshots Tim added to posts on his old Blogger blog, 2007 to 2009. Blogger kept each blog's uploads in an album of their own. |
| Picasa Web Albums | 35 | Screenshots and a few photos from 2007 and 2008, uploaded to Picasa and linked from posts. |
| Flickr | 7 | Screenshots for two posts from 2015. The file names will not help; go by date and by what the post describes. |
| Facebook | 1 | A personal photo, in the post "Outtake from our engagement photo shoot" (2010). |
| Another site's image | 6 | A chart from a Google spreadsheet, a video thumbnail, pictures from other people's sites. These were never Tim's and are very unlikely to be in his library. Skip them unless you happen to find one. |

## Step 2: find the pictures

Work post by post. For each missing image, look for a picture that fits all of what you know: the file name, the date, and what the post says it shows.

**In a browser.** Search Google Photos for the file name, without its extension if the full name finds nothing. Then try the date: jump to the month of the post and look at what was added around that day. Look through the album list for albums named after the blog ("gPowered" was its name from 2007 to 2009) or with names like "Blog", "Screenshots" or "Drop Box". Most of the missing pictures are small screenshots of web pages and desktop apps from 2007 to 2009, so they stand out among photos.

**In a Takeout export.** Let the script find files with matching names:

```sh
node scripts/images/recover.ts --search /path/to/Takeout
```

It lists each missing image that has a same-named file in the folder, with the file's size. It changes nothing. A name is only a hint: several posts have a `1.jpg` or an `Untitled.jpg`, so open each candidate and check it against the post.

Things I believe but could not check from here, so verify before relying on them:

- Albums from Picasa Web Albums appear as albums in Google Photos.
- Pictures uploaded through Blogger were kept in Google's "Album Archive", which Google closed in 2023. They may only be reachable through Google Takeout now (look for Blogger and Google Photos in the list of products to export), or not at all.

If the Blogger pictures turn out to be unreachable, say so in your report and recover what you can of the rest.

**Deciding whether a picture is the one.** It is, when its file name matches and it shows what the post describes, or when its date matches and it plainly shows what the post describes. The picture in Google Photos may be larger than the one the post showed; that is fine and expected. If two candidates fit, or one fits only roughly, leave the placeholder and note it in your report.

## Step 3: put a picture back

Download the picture to a folder outside this repository. Then:

```sh
node scripts/images/recover.ts "<address from the list>" /path/to/the/picture.jpg --note "Google Photos, album gPowered"
```

The script:

1. checks the file is a real picture;
2. copies it to `public/images/remote/<post>/`, under the name it had in the old address;
3. points the post at it, in exactly the place the placeholder was (it refuses if that place does not hold the placeholder);
4. updates `content/image-sources.json`: the image's source becomes `google-photos`, with your note.

It refuses a file wider than 2000 pixels or bigger than 1.5 MB. The column a post sits in is about 1000 pixels wide at most, so anything larger only takes up space. Make a large original smaller first. On a Mac:

```sh
sips --resampleWidth 1600 /path/to/the/picture.jpg
```

Use `--note` to say where you found the picture: the album, or the path inside the Takeout export. If you found it somewhere other than Google Photos, say that in the note.

Do not edit the posts or `content/image-sources.json` by hand for this. The script keeps the two in step, and a test compares them.

## Step 4: check

```sh
npm run build
npm test
npm run test:build
```

All three must pass. Then look at a few of the posts you changed:

```sh
npm run serve      # serves the build at http://localhost:4321
```

Each recovered picture should sit where the placeholder was and make sense next to the text around it.

`node scripts/images/recover.ts --list` shows what is still missing.

## Step 5: hand over

Commit the new files under `public/images/remote/`, the changed posts and `content/image-sources.json`. Open a pull request into the branch you started from. Tim merges pull requests himself.

A change that only touches `content/` and `public/images/` skips the automated tests on GitHub by design, which is why step 4 matters.

In the pull request, give Tim three short lists:

- **Recovered:** post, picture, where you found it.
- **Not found:** what you searched for and where you looked.
- **Unsure:** candidates you did not use, and why.

## Rules

- **Only look and download.** In Google Photos, do not delete, edit, move or share anything, and do not change any sharing setting. Download only the pictures you intend to use, and remove your downloads when you are done.
- **Everything you put back becomes public.** This repository and the website are public. The missing pictures were public once, in these same posts, so a screenshot that matches is fine to restore. If a candidate shows people, a home, or anything else personal that the post does not clearly call for, ask Tim before committing it.
- **Do not change alt text or any other words in a post.** Card summaries are built from the text, alt text of these pictures included, and the tests compare them with the old site.
- **Leave what you cannot find.** Do not replace a missing picture with a similar one, a recreation or a newer screenshot. Do not remove placeholders.
- **Do not touch the 14 images recorded as `removed`.** They were tracking pixels and share buttons, not pictures.

## Background

- `content/image-sources.json` is the record of every image that used to be remote: its old address, what the post shows now, and where the copy came from. For a missing image, `positions` says which image of which post it is.
- The scripts that did the original search were removed once the site went live. `scripts/images/recover.ts` is all this job needs.
- `MIGRATION_PLAN.md`, if it is still in the repo, describes the whole migration. Stage 5 is the part about images.
