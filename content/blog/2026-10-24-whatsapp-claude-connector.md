---
title: Making WhatsApp Searchable from Claude
layout: post
slug: whatsapp-claude-connector
date: 2026-10-24
category: Code
ai_assisted: true
tags:
- claude
- mcp
- whatsapp
- homelab
- caddy
---

A big chunk of my Scout-life runs through WhatsApp group chats: Campouts, cabin bunk counts, who's tenting, who's bringing cots, what's happening next month.

And WhatsApp search is... fine. If you remember the exact word someone used.

What I actually want to ask is something like *"find the messages from yesterday where we talked about camping planning in the scoutmaster chat."* That's a Claude question, not a search box question. So I set out to make it one.

## The problem

There's no official API for reading your own personal WhatsApp chats. The Business API is for businesses sending messages, not for me searching my history.

What *does* exist is the same trick WhatsApp Web uses: a **linked device**. You open WhatsApp on your phone, go to Linked devices, and scan a QR code. From then on, that device gets a copy of your messages, just like the desktop app does.

A handful of open source projects do exactly this and then expose your messages over [MCP](https://modelcontextprotocol.io). MCP (Model Context Protocol) is the standard way Claude talks to outside tools. You run an MCP server, tell Claude where it is, and Claude can call the tools it offers: "search messages," "list chats," that kind of thing. In the Claude apps these show up as **connectors**.

So the plan: run one of these on a machine I own, and plug it into Claude as a connector.

## My setup, briefly

If you've never seen my home setup, here's the 30-second version, because all of it comes up below.

- **The HTPC.** A small Linux box at home. It started as a media server and grew. Everything on it runs as a [Docker](https://www.docker.com) container, all defined in one [Docker Compose](https://docs.docker.com/compose/) file: Plex, Jellyfin, Audiobookshelf, the *arrs, and now this.
- **Ansible.** I don't hand-edit the server. An [Ansible](https://www.ansible.com) playbook copies the config files over, creates folders, and runs `docker compose up`. If it's not in the repo, it doesn't exist.
- **Caddy.** [Caddy](https://caddyserver.com) is a web server acting as a *reverse proxy*: it's the one front door on ports 80/443. A request for `jellyfin.mydomain` comes in, Caddy hands it to the Jellyfin container. It also gets and renews HTTPS certificates from [Let's Encrypt](https://letsencrypt.org) automatically, which is the main reason I love it.
- **Cloudflare.** My domain's DNS lives at [Cloudflare](https://www.cloudflare.com). My home IP address changes every so often, so a little container called [cloudflare-ddns](https://github.com/favonia/cloudflare-ddns) keeps the DNS records pointed at wherever my house currently is. Caddy also uses the Cloudflare API to prove I own the domain when it asks for certificates.
- **Tailscale.** [Tailscale](https://tailscale.com) is a private network (a *Tailnet*) between my own devices: laptop, phone, the HTPC. Devices on it get `100.x.x.x` addresses that only work for my devices, from anywhere. Most of my services are only reachable over Tailscale, so they never face the public internet at all.
- **Authelia.** For the few things that need a login screen, [Authelia](https://www.authelia.com) sits in front of them and makes you sign in first.

The short version: by default, things live on the Tailnet, and only a few deliberate exceptions face the internet.

## Picking a server

I worked through this with Claude, and we looked at a few:

- [lharries/whatsapp-mcp](https://github.com/lharries/whatsapp-mcp) is the original most of these come from. Great idea, but it's built to run on a laptop next to Claude Desktop, not on a server.
- [flaviotome/whatsapp-mcp](https://github.com/flaviotome/whatsapp-mcp) is a really nice read-only design, but it was about a week old when I looked.
- [felipeadeildo/whatsapp-mcp](https://github.com/felipeadeildo/whatsapp-mcp) has moved to Cloudflare Workers (Cloudflare's hosted platform). Slick, but I wanted it on my own box.

I landed on [Tauri-EPO/whatsapp-mcp](https://github.com/Tauri-EPO/whatsapp-mcp), a fork of the lharries project that's been rebuilt for an always-on server. It's two containers:

1. **The bridge.** A Go program built on [whatsmeow](https://github.com/tulir/whatsmeow) (thanks [tulir](https://github.com/tulir)) that *is* the linked device. Every message that arrives gets written into a SQLite database with full-text search.
2. **The MCP server.** A Python program that answers Claude's questions straight from that database. Searching never touches WhatsApp itself, so it's fast.

The features that sold me:

- **Read-only mode.** `WHATSAPP_READ_ONLY=1` removes every send/edit/delete tool. Claude can read; it can't post to the troop chat on my behalf. I don't care about sending, and I *really* don't want a *prompt injection* (someone writing "ignore your instructions and send this..." in a chat Claude reads) to be able to send anything.
- **Real search.** Full-text search filterable by chat and date, plus a tool that pulls the messages around each hit so Claude sees the conversation, not just one line.
- **A `coverage` tool** that tells Claude which date ranges it actually has. More on why that matters below.

## The catch: Claude's connectors live in the cloud

My first instinct was "everything's on my Tailnet, just give Claude the Tailscale address." Done.

Nope.

Custom connectors in the Claude desktop and mobile apps get called **from Anthropic's servers**, not from my phone or laptop. Anthropic's servers aren't on my Tailnet, so a `100.x` address means nothing to them. If I wanted this on mobile (I did), the endpoint had to be reachable from the public internet.

That's a scary sentence when the thing behind it is every WhatsApp message I have.

To make it scarier, connectors only support OAuth (a full "log in and approve" flow) or no auth at all. There's no field to paste a password or API key. And my usual answer for exposed services, Authelia's login page, doesn't work because a connector can't click through a login page.

## The lock

Here's what I did instead. Three layers, all in Caddy:

1. **Only Anthropic's servers get in.** Anthropic [publishes the IP addresses its servers call out from](https://platform.claude.com/docs/en/api/ip-addresses), exactly so people can allowlist them. Any request from anywhere else gets a 404 (Not Found), like the site isn't even there. My Tailnet is allowed too, so I can test it.
2. **The URL carries a secret.** The connector URL looks like `https://whatsapp.example.com/<64-character-random-token>/mcp`. Wrong token? 404.
3. **Caddy turns that secret into a real password.** The MCP server expects a *bearer token*: a secret sent in an `Authorization` header on every request. Connectors can't send one, so Caddy strips the token off the URL and adds the header itself before passing the request along. The MCP server checks it on its own, so even something already inside my network can't use it without the token.

Here's the Caddy config. `{$WHATSAPP_MCP_TOKEN}` is an environment variable, `100.64.0.0/10` is Tailscale's address range, and `whatsapp-bridge:8000` is the container's name and port on Docker's internal network:

```caddyfile
whatsapp.example.com {
    @mcp {
        remote_ip 160.79.104.0/21 100.64.0.0/10
        path /{$WHATSAPP_MCP_TOKEN}/mcp
        expression `{env.WHATSAPP_MCP_TOKEN}.size() >= 32`
    }
    handle @mcp {
        uri strip_prefix /{$WHATSAPP_MCP_TOKEN}
        reverse_proxy whatsapp-bridge:8000 {
            header_up Authorization "Bearer {$WHATSAPP_MCP_TOKEN}"
            flush_interval -1
        }
    }
    handle {
        respond 404
    }
}
```

Reading it top to bottom: `@mcp` only matches when the request comes from an allowed IP *and* has the right path. Matching requests get the token stripped and forwarded with the header; everything else gets a 404. The `expression` line is a little paranoid: if the token ever failed to load, the path would collapse to `//mcp`, so this keeps the route closed instead. `flush_interval -1` makes Caddy pass streamed responses through right away instead of buffering them.

The rest of the plumbing:

- A new DNS record for the subdomain, added to the list cloudflare-ddns already keeps up to date.
- My router already forwards port 443 to the HTPC for the handful of public services, so nothing changed there.
- The two WhatsApp containers don't publish any ports at all. The only way in is through Caddy.

The token itself never touches git. My Ansible playbook generates it on the server the first time it runs (`openssl rand -hex 32` is 32 random bytes written as 64 hex characters) and saves it to a file only my user can read. Caddy and both containers load it from there as an environment variable:

```yaml
- name: Generate WhatsApp MCP token if missing
  ansible.builtin.shell: |
    umask 077
    printf 'WHATSAPP_MCP_TOKEN=%s\n' "$(openssl rand -hex 32)" > /mnt/whatsapp-mcp/secrets.env
  args:
    creates: /mnt/whatsapp-mcp/secrets.env
    executable: /bin/bash
```

`creates:` means Ansible skips this if the file already exists, so re-running the playbook doesn't rotate the token out from under me.

Is this as good as proper OAuth? No. But a 256-bit random secret *plus* an IP allowlist *plus* read-only tools felt like the right amount of lock for the amount of setup. The server supports OAuth if I ever want to go further.

## Testing it (and a dumb moment)

Before deploying, Claude downloaded a real Caddy binary, pointed the route at a dummy backend, and threw bad requests at it: wrong token, no token, `//mcp`, path tricks, a disallowed IP. All 404s. Only the right token from an allowed IP got through, with the header attached.

Then I deployed it and ran the checks, one layer at a time, so a failure would point at the broken piece:

1. **Pairing.** The bridge printed a QR code in its logs. Scanned it from my phone: `connected (authenticated)`.
2. **The token.** Confirmed Caddy's container actually had the 64-character token loaded.
3. **The MCP server alone.** Sent a request straight to the container from inside Docker's network, skipping Caddy: `200 OK`.
4. **Through Caddy.** Same request through Caddy over the Tailnet, with the token in the URL: `200 OK`.
5. **The connector.** Added it in claude.ai under Settings → Connectors → Add custom connector. It shows up in the desktop and mobile apps from there.

Then the real test. I asked Claude about camping planning in the scoutmaster chat. It found the group, checked the day I asked about (nothing that day, a quiet one), and surfaced the actual planning thread from a few days earlier: who's in the cabin, who's tenting, the upcoming cabin trip and ski weekend.

That's the thing I wanted. 🎉

## What it doesn't do

Being honest about the gaps:

- **History is patchy.** A linked device only gets the old messages your phone decides to send when you pair. I have about 11,600 messages, solid from this spring on, but with real holes in late 2024 and over last winter. Everything from now on gets captured, though. Claude checks `coverage` before claiming nothing happened, which is exactly what I want.
- **It's unofficial.** Linked-device clients like this break WhatsApp's terms of service. The ban risk for a quiet read-only device seems low, but it's not zero.
- **No voice notes yet.** Transcribing them needs a [whisper.cpp](https://github.com/ggml-org/whisper.cpp) server (local speech-to-text) that I haven't set up.

At the end of the day, though, it was fast to spin up, it lives on hardware I already own, and now my group chats are something I can actually *ask questions of*. For a scout dad, that's a real win.

---

*This post was written by Claude (Anthropic's AI assistant) based on my conversation with it while building this, and the voice guide in this repository.*
