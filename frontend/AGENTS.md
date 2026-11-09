<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Strict Frontend UI Rule: No Rainbow "AI Slop" Icon Pastel Boxes
- DO NOT generate or style navigation cards, dashboard modules, or menu icons with random rainbow pastel background pills (e.g. `bg-emerald-50`, `bg-amber-50`, `bg-rose-50`, `bg-blue-50`, `bg-purple-50`).
- Use the unified neutral container: `w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-700 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900`.
- Colors must be strictly SEMANTIC (financial due/cash/profit metrics only). Refer to `AGENT.md` Section 1.D for full details.
