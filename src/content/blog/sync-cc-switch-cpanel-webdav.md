---
title: "Sync CC Switch Across Computers with cPanel WebDAV"
description: "Use a cPanel Web Disk account as a free WebDAV server to sync CC Switch settings between Windows, macOS, and Linux. No VPS, Docker, or paid storage."
date: 2026-11-05
category: "Guides"
tags: ["cc-switch", "webdav", "cpanel", "claude-code"]
draft: false
---

If you use Claude Code, Codex, OpenCode, or another AI coding assistant on more than one computer, your setups slowly drift apart. You add a new API provider on your Windows PC, then find it missing on your MacBook. The same happens with MCP servers, prompts, and custom skills.

CC Switch fixes this. It is a free, open-source desktop app that manages your AI coding assistant settings in one place. It can sync them through WebDAV or S3-compatible storage.

This guide shows how to use a cPanel Web Disk account as your own private WebDAV server and sync CC Switch between Windows, macOS, and Linux. If your hosting plan already includes Web Disk, you don't need a VPS, Docker, or another paid storage plan.

## What you need

- A computer running Windows, macOS, or Linux
- CC Switch installed on each computer you want to sync
- A cPanel hosting account with Web Disk turned on
- A domain or hostname with a valid SSL certificate
- Access to HTTPS WebDAV port 2078
- Permission to create a Web Disk account

You can download CC Switch from the official GitHub page: https://github.com/farion1231/cc-switch

The examples below use `example.com` and made-up account details. Replace them with your own.

## How the sync works

WebDAV (Web Distributed Authoring and Versioning) is a protocol that lets apps manage files on a remote server. Here, your cPanel hosting account is the shared storage.

1. CC Switch on Windows uploads its supported settings to your WebDAV server.
2. The server keeps that snapshot.
3. CC Switch on macOS downloads the snapshot.
4. Both computers now use the same supported settings.

When you make changes on the second computer, you can do the same in reverse.

CC Switch also has an Auto Sync option. It uploads changes by itself, but your other computers still won't get those changes right away.

## Step 1: Create a Web Disk account in cPanel

Log in to cPanel and open **Web Disk** in the Files section. Web Disk lets you create accounts that can reach a specific folder through WebDAV.

Under "Create an Additional Web Disk Account", enter these example values:

| Setting | Example |
|---|---|
| Username | ccswitch |
| Domain | example.com |
| Password | A strong, unique password |
| Directory | ccswitch-storage |
| Permissions | Read-Write |
| Digest Authentication | Disabled |

If you can, pick a folder outside `public_html`. That way your sync files can't be opened through a normal public web address.

Choose Read-Write permissions. CC Switch needs to upload, change, and read its sync files.

### Digest authentication

Leave "Enable Digest Authentication" unchecked. According to cPanel, only some older Windows clients need it, and only on unencrypted connections. Your server has a valid SSL certificate and uses HTTPS on port 2078, so you don't need it.

Click **Create**. Your Web Disk account is ready.

## Step 2: Find your WebDAV connection details

Go back to the Web Disk page. Find your new account under "Manage Additional Web Disk Accounts" and open **Configure Client Access**. You will see instructions for Windows, macOS, Linux, and other systems.

These are the made-up details used in this guide:

| Setting | Example |
|---|---|
| WebDAV URL | https://example.com:2078/ |
| Username | ccswitch@example.com |
| Password | Your Web Disk password |
| Protocol | HTTPS |
| Port | 2078 |

Your host may give you a different hostname. If cPanel shows one that differs from your domain, use that one.

You don't need to download a Web Disk connection script. CC Switch connects straight to your WebDAV URL with your username and password.

## Step 3: Test your WebDAV server

Before you set up CC Switch, check that the server answers. On Windows, open PowerShell and run:

```powershell
curl.exe -I https://example.com:2078/
```

You may see something like this:

```text
HTTP/1.1 401 Unauthorized
Server: cPanel
WWW-Authenticate: Basic realm="Restricted Area"
```

That is fine. A protected WebDAV server answers with 401 when you don't send credentials. It means the server is reachable and wants you to log in.

### Test the login

Next, run:

```powershell
curl.exe --basic -u "ccswitch@example.com" -X PROPFIND -H "Depth: 0" "https://example.com:2078/"
```

Curl asks for your Web Disk password. Type it and press Enter. If the login works, you get an XML reply like this:

```xml
<d:multistatus xmlns:d="DAV:">
  <d:response>
    <d:href>/</d:href>
    <d:propstat>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>
```

The HTTP status is normally `207 Multi-Status`. This shows the server handles WebDAV requests and your login can reach the folder.

It does not prove that you can upload files. You will find that out with CC Switch's connection test and your first upload.

## Step 4: Set up WebDAV in CC Switch

Open CC Switch on your main computer and go to `Settings > Data > Cloud Sync`. Choose **WebDAV** as the sync method. If your version has a service provider selector, pick **Custom**.

Enter these example values:

| CC Switch setting | Example value |
|---|---|
| Provider | Custom |
| WebDAV Server URL | https://example.com:2078/ |
| WebDAV Account | ccswitch@example.com |
| WebDAV Password | Your account password |
| Remote Root Directory | cc-switch-sync |
| Sync Profile Name | default |
| Auto Sync | Disabled at first |

The Remote Root Directory is where CC Switch keeps its sync data on the server. The Sync Profile Name labels your settings profile. Use the same profile name on every computer that should share the same settings.

Click **Save Config**, then **Test Connection**. If the test passes, CC Switch can talk to your WebDAV server.

## Step 5: Upload your settings from Windows

Say Windows is your main computer and already has the providers, MCP servers, prompts, and skills you want to keep.

First, make a local backup with CC Switch's backup or export feature. Then go back to `Settings > Data > Cloud Sync` and click **Upload to Cloud**.

CC Switch may show a confirmation with the data it will upload and where it will go. Read it, confirm, and wait for the success message. Your settings snapshot is now on your cPanel server.

If a cloud snapshot already exists, the upload may replace it.

## Step 6: Download the settings on macOS

Install and open CC Switch on your Mac, then go to `Settings > Data > Cloud Sync`. Pick WebDAV and enter the same details you used on Windows. These four must match:

- WebDAV Server URL
- WebDAV username and password
- Remote Root Directory
- Sync Profile Name

Click **Save Config** and test the connection. Before you restore anything, back up the settings already on your Mac. Then click **Download from Cloud**.

CC Switch shows details about the remote snapshot. Read the restore confirmation and continue. When the download ends, check your provider list, MCP configurations, prompts, and custom skills. Your Mac should now have the supported settings from Windows.

You can repeat these steps on Linux.

## Step 7: Check that sync works

Test the setup before you rely on it. On Windows, add a harmless test provider with a name you will recognize:

```text
WebDAV Sync Test
```

Don't put a real API key in it. Upload your settings to WebDAV. On macOS, download them again and see if the test provider shows up. If it does, sync works. You can delete the test entry and sync once more.

## Step 8: Turn on Auto Sync

CC Switch has an **Auto Sync** setting. When it is on, changes to the database trigger an automatic upload to WebDAV. That helps if you often change providers, prompts, or other supported settings.

But Auto Sync only uploads. It does not merge changes across all your computers. If you edit a provider on Windows, the new version uploads by itself, while your Mac still has to download the latest snapshot before it shows the change.

### A simple routine

| Situation | What to do |
|---|---|
| Starting work on Windows | Download the latest cloud settings |
| After editing on Windows | Upload to WebDAV |
| Starting work on macOS | Download the latest cloud settings |
| After editing on macOS | Upload to WebDAV |
| Using Auto Sync | Check that uploads succeed, and refresh other devices as needed |

Don't edit the same settings on two computers before syncing them. Think of WebDAV sync as one shared snapshot. It is not a tool for editing together, and it does not merge conflicts for you.

## What CC Switch syncs

Cloud sync shares supported app settings: provider information, MCP configurations, prompts, and custom skills. It does not share everything. Some settings stay on the computer where CC Switch is installed, such as local app paths, device state, and certain app options.

This matters because Windows and macOS use different folder structures. A Windows path like this:

```text
C:\Users\ExampleUser\
```

does not work on macOS, where the home folder might be:

```text
/Users/exampleuser/
```

After you restore your settings, check that each coding assistant is installed and set up on that computer. Also check any tool-specific login or local environment needs.

## Common problems

### HTTP 401 Unauthorized

A 401 means the server wants you to log in. If you get it when you test without credentials, that is normal. If you get it after sending your username and password, check them, and check how the Web Disk account is set up.

### HTTP 403 Forbidden

A 403 can point to a permissions problem or an access limit. Make sure your Web Disk account has Read-Write permissions and can reach the folder.

### Connection timeout

Check whether port 2078 is open. Some hosts and networks block nonstandard HTTPS ports. If it is blocked, ask your hosting provider.

### SSL certificate error

Use a hostname that your SSL certificate covers. Don't turn off certificate checks just to get the connection working.

### Upload fails but the connection test passes

A passing connection test doesn't guarantee uploads will work. Check the account's write permissions, your free hosting storage, and any server limits.

### Settings are missing on the second computer

Make sure both computers use the same WebDAV address, Remote Root Directory, and Sync Profile Name. Also confirm the first computer finished its upload before you try to download.

### Remote settings are incompatible

If CC Switch reports a sync format or database compatibility error, check the app version on both computers. Matching, up-to-date versions avoid most of these problems. Don't force an incompatible restore.

## Security tips

Your WebDAV server may hold sensitive data, including API credentials. A few precautions:

1. Use HTTPS with a valid SSL certificate.
2. Create a Web Disk account just for CC Switch.
3. Use a strong, unique password.
4. Keep the sync folder outside public web folders.
5. Limit the account to the one folder it needs.
6. Keep your own local backups.
7. Never publish your WebDAV password, API keys, or sync files.
8. Change or revoke credentials right away if you think someone got in.

HTTPS protects data while it travels between your computer and the server. It does not mean the files on your hosting account are end-to-end encrypted. Use a host you trust.

## Frequently asked questions

### Is CC Switch free?

Yes. It is free and open source on GitHub.

### Can I use ordinary shared hosting?

Yes, if your account supports WebDAV, allows secure connections, and gives you enough permissions and storage.

### Do I need a VPS?

No. A cPanel hosting account with Web Disk can be enough.

### Can I sync Windows and macOS?

Yes. CC Switch supports both, and WebDAV gives them a shared place for supported settings.

### Can I sync three or more computers?

Yes. They can all use the same WebDAV address and sync profile, as long as they run compatible versions and you follow a steady upload and download routine.

### Does CC Switch sync automatically?

It can upload automatically when Auto Sync is on. Don't expect every device to download remote changes right away, or to merge conflicting edits.

### Can I use Nextcloud instead of cPanel?

Yes. CC Switch works with WebDAV services such as Nextcloud and Synology NAS, as well as custom WebDAV servers.

### Does CC Switch install Claude Code or Codex on every computer?

No. Cloud sync shares supported settings only. Each computer still needs its own tools and local setup.

## Wrap up

A cPanel Web Disk account is a practical way to keep your AI coding assistant settings the same on several computers, using hosting you may already pay for. Create the Web Disk account, test secure WebDAV access, set up CC Switch, upload from your main computer, and download on the others. Once that works, turn on Auto Sync if you like, and keep downloading on your other devices before you start work.

Links: [CC Switch on GitHub](https://github.com/farion1231/cc-switch), [CC Switch website](https://ccswitch.io), and the [cPanel Web Disk docs](https://docs.cpanel.net/cpanel/files/web-disk/).
