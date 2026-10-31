# VoiceUp 🗣️

**Empowering Citizens Through Transparent Reporting.**

VoiceUp is a public civic-issue reporting platform: anyone can report a local problem — a pothole, a broken streetlight, an open drain, uncollected garbage — with the exact location, and everyone can see it, track its status, and push it up the public agenda.

**Live app:** https://voice-up.netlify.app

## Voice reporting

VoiceUp includes a built-in voice assistant for citizens who cannot read or write: a floating mic button on every page opens a talking agent that asks each report question out loud, listens to the spoken answers (Hindi, Bhojpuri through the Hindi model, or English), confirms the important details, and files the report automatically. It runs entirely in the browser on the Web Speech API and speech synthesis — no servers, no API keys, no cost.

## Features

- **Report an issue** — title, description, category, urgency, the responsible organization, and location (place name, pincode, GPS coordinates), plus an optional photo link
- **Voice agent** — press-to-talk interviewer that fills the whole report by conversation
- **Public status tracking** — every issue moves through `open → in progress → resolved`, visible to everyone
- **Community signal** — upvotes, comments and view counts; the **Trending** page surfaces what the neighborhood cares about most
- **Map view** — every issue pinned by GPS coordinates
- **Organizations** — issues are tagged to the body responsible (municipal ward, electricity board, etc.)
- **Accounts** — sign in to report, vote and comment

## Tech stack

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Supabase (Postgres + Auth) · TanStack Query · Web Speech API

## Local development

```sh
git clone https://github.com/frhn9204-creator/public-pulse-board.git
cd public-pulse-board
npm i
npm run dev
```

## Roadmap

- 📷 Direct camera photo upload
- 🏛️ Official response timeline per issue
- 📊 Ward-level public dashboards
- 💬 Report via WhatsApp

---

Built by [frhn9204-creator](https://github.com/frhn9204-creator), a Class 11 student from Patna, India.
