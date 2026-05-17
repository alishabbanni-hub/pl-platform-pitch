# PL Platform — Investor Pitch

Interactive presentation of the Professional Learning platform, built with Next.js 14, TypeScript, and Tailwind CSS.

The first slide (`PartnershipModel`) shows a central "Your Platform" circle. Clicking it reveals five partner/collaborator circles one-by-one with a staggered fade-in animation.

## Quickstart

```bash
# 1. Clone (or push this folder as the initial commit)
git clone https://github.com/<you>/pl-platform-pitch.git
cd pl-platform-pitch

# 2. Install dependencies
npm install

# 3. Run the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser. Click the dark center circle to trigger the reveal.

## Deploy

The fastest path is **Vercel**:

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Vercel auto-detects Next.js — click Deploy
4. You get a public URL like `https://pl-platform-pitch.vercel.app` in ~60 seconds

## Customize the partnership slide

Open `src/app/components/PartnershipModel.tsx`. The knobs:

| Constant / field          | What it controls                                             |
|---------------------------|--------------------------------------------------------------|
| `partners[]`              | The 5 placeholder labels and their colors                    |
| `RADIUS`                  | Distance from center to each partner circle (default 260px)  |
| `STAGGER_MS`              | Delay between each partner appearing (default 180ms)         |
| Center label `Your Platform` | The text inside the central circle                        |
| Header `<h1>` and `<p>`   | Slide title and subtitle                                     |

## Project structure

```
pl-platform-pitch/
├── src/
│   └── app/
│       ├── components/
│       │   └── PartnershipModel.tsx   ← the interactive slide
│       ├── globals.css                 ← Tailwind directives
│       ├── layout.tsx                  ← root HTML shell
│       └── page.tsx                    ← renders <PartnershipModel />
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

## Adding more slides

The current home page (`src/app/page.tsx`) renders just `<PartnershipModel />`. To turn this into a multi-slide deck, you can:

- Create more components in `src/app/components/` (e.g., `BusinessModel.tsx`, `UserJourney.tsx`)
- Either stack them vertically in `page.tsx`, or build a small slide-navigation wrapper that switches between them on arrow keys / clicks

Tell Claude what slide you want next and it'll build it.
