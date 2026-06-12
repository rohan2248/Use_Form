# Product

## Register

product

## Users

Indie creators and small teams who need surveys, signups, and feedback forms quickly, without enterprise overhead. They are usually mid-task — launching a project, collecting feedback, running a signup — and the form is a means to that end. They want to build, share, and check responses in minutes, often switching between building a form and scanning its analytics.

## Product Purpose

A form builder with a builder dashboard (forms, fields, responses, analytics, settings), public form filling at `/form/[id]`, and an explore page. Success: a user can create a form, publish it, share the link, and understand the responses without friction or a manual. Built as a Turborepo monorepo (Next.js 16 web + Express/tRPC API).

## Brand Personality

Friendly and playful — approachable, warm, with moments of delight in interactions — while remaining a credible tool. Three words: friendly, light, capable. The interface should feel like a helpful companion, not a corporate console; playfulness lives in micro-interactions, copy, and empty states, never at the cost of clarity or speed.

## Anti-references

- **Generic SaaS dashboard**: identical card grids, hero-metric blocks, gradient accents, admin-template scaffolding.
- **Over-decorated playful**: full-cartoon styling, novelty fonts, decoration that undermines trust in a data tool. Playful ≠ unserious.

## Design Principles

1. **Forms first, chrome last** — the user's form and its responses are the content; UI recedes around them.
2. **Delight in the details** — personality through micro-interactions, empty states, and copy, not loud layout or decoration.
3. **One glance, one answer** — every dashboard view should answer its primary question (How is my form doing? What changed?) without digging.
4. **Fast path to share** — creating, publishing, and copying a form link is the golden path; keep it always within reach.
5. **Friendly but trustworthy** — warmth never compromises legibility, data accuracy, or predictability.

## Accessibility & Inclusion

WCAG 2.1 AA: body text contrast ≥4.5:1, large text ≥3:1, full keyboard navigation, visible focus states, `prefers-reduced-motion` alternatives for every animation. Public forms are filled by end users on any device — the fill experience must be accessible even more strictly than the builder.
