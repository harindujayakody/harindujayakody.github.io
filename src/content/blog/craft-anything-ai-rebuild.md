---
title: "Craft Anything: Rebuild Any Software With Your AI Agent"
description: "ArtCraft's open-source Craft Anything lets your AI coding agent study a website, app, or game and rebuild it in the language you pick. Here is what it does and how to start."
date: 2026-11-05
category: "AI"
tags: ["craft-anything", "artcraft", "reverse-engineering", "open-source", "mcp"]
draft: false
---

Reports say Claude Code with Opus 5.5 now blocks some reverse engineering tasks, including ones run through REA (Reverse Engineer Anything). ArtCraft, the team behind a set of open-source alternatives to Adobe apps, has released its own answer: Craft Anything.

It is a free tool that lets your AI coding agent study a website, desktop app, mobile app, or game, then rebuild it in the framework or language you choose. This post covers what it does, how it works, and what to know before you try it.

## What happened with REA

REA is an open-source project that connects AI coding agents to tools like Ghidra, so the agent can take software apart and explain how it works. It went viral in October.

Since then, users have reported that Claude stops partway through reverse engineering work. Tom's Hardware wrote that Anthropic confirmed new Claude Code limits to prevent game cloning, and that users also see blocks on other reverse engineering tasks. Other writers say the picture is less clear. One article argues that Claude has not banned REA by name, and that people are hitting a broad safety check that also catches some harmless work. Anthropic has not given a full explanation, so treat the details as unsettled.

## What Craft Anything does

You point it at a target, say what you want, and press Start. It then works in four steps:

1. **Study**: it inspects the original, including its pages, code, files, and how it runs.
2. **Build**: a coding agent builds a new project in the language, framework, or game engine you ask for.
3. **Check**: it compares the new version with the original and lists what still does not match.
4. **Refine**: you open or play the result, ask for changes, and it improves the build.

The checks are concrete. A website is compared at three screen widths. A game is tested with its own self-test. You can read the list of differences and decide what to fix next.

You can ask for things like "Recreate this website" or "Recreate this game's gameplay in Rust". There is also a "just look inside" option if you only want to understand how something works.

## Clean room or Deep mode

Craft Anything has two modes, and the difference matters.

In **Clean room mode**, the default, nothing inside the original is read. It works only from what a visitor can see: screenshots, visible text, measured layout, colors, fonts, and spacing. Tools that look inside are refused.

In **Deep mode**, every tool is available for your private use. It reads a program's code and files with its built-in engines, and with Ghidra if you have it installed. It also reads a website's JavaScript.

The README says Clean room is a rule about what the app offers, not a sandbox for your computer. A coding agent you run still acts as you, with its own permissions.

## 320 tools in one engine

Under the hood is a reverse engineering engine written in pure Rust. It has 320 tools, 300 of them in the engine and the rest from the AI and setup layers. They cover native programs, .NET, Java, Android, Apple apps, Electron and JavaScript, websites, firmware, packet captures, databases, and game files.

The same engine runs as three things:

- a desktop app with a Simple view and an Advanced workbench
- a command line tool called `craft-anything-cli`
- an MCP server, so any MCP client can use the tools

Every tool is both a CLI command and an MCP tool. That means an agent can study a target or run a full rebuild without opening the app.

## Which AI agent does it use?

Building needs a coding agent signed in on your computer. Claude Code is supported first, and Craft Anything runs your own copy of it under your own sign-in. A GitHub Copilot setup works through your installed Copilot CLI. A Codex adapter exists but has not been verified on a real install. Other agents that speak ACP, such as Gemini CLI, Qwen Code, opencode, and goose, can be switched on per backend, although only Maki has been run live.

Craft Anything does not promise to get around any agent's own limits. Your use of each agent falls under your own agreement with its provider.

## How to try it

You need Rust 1.97 or newer. Then:

```bash
git clone https://github.com/storytold/craft-anything && cd craft-anything
cargo run --release -p craft-anything                # the desktop app
cargo install --path apps/craft-anything-cli         # the CLI
craft-anything-cli doctor                            # checks the install, agents and engines
```

To rebuild a site from the command line:

```bash
craft-anything-cli rebuild https://example.com "Recreate this website"
```

If you would rather not build from source, the Releases page has installers for Windows, macOS, Linux, and FreeBSD, plus a browser viewer built with WebAssembly. New projects are saved in `Documents/Craft Anything`.

## Things to know first

Craft Anything is in early alpha. The desktop app, CLI, and MCP server work today, along with the study, build, check, and refine flow for websites, apps, and games using Claude Code as the builder. Building with API keys and other coding agents is only partly there. The repo has more detail on what is tested.

Use it on software you own or are allowed to examine. The README says it never bypasses DRM, logins, or anti-cheat, and that the agent is told not to copy logos, photos, or text unless you confirm you have permission. Software terms often ban reverse engineering, so read them before you start.

One more warning: when the builder installs a project's dependencies, those commands run on your computer, and packages can run code while they install. Craft Anything asks before it runs a command type it has not seen in that project. Be careful with "always allow" for `npm`.

It is open source under the MIT or Apache-2.0 license. When I checked, the repo had about 11,300 stars and 1,900 forks.

## Try it today

Craft Anything turns a hard, manual job into a request you type in plain words, and it checks its own work against the original. It is still alpha software, so expect rough spots. If you build things or like to see how software works, it is worth an afternoon.

The code and downloads are at [https://github.com/storytold/craft-anything](https://github.com/storytold/craft-anything).
