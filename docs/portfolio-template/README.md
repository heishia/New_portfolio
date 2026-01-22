# Portfolio Metadata Template

This guide explains how to add custom metadata to your GitHub repositories for the portfolio website.

## Quick Start

1. Create a `portfolio/` folder in your repository root
2. Add `meta.json` with your project metadata
3. Add screenshots to `portfolio/screenshots/`
4. The portfolio will automatically pick up changes on the next sync

## Folder Structure

```
your-repo/
├── portfolio/
│   ├── meta.json              # Required: Project metadata
│   └── screenshots/           # Required: Project screenshots
│       ├── main.png           # Required: Main screenshot
│       ├── feature-01.png     # Optional: Additional screenshots
│       └── mobile.png         # Optional: Mobile view
├── src/
└── README.md
```

## Metadata Fields

### Required Fields

| Field | Description |
|-------|-------------|
| `display.title` | Project display title |
| `display.description` | Brief description (2-3 sentences) |
| `classification.project_type` | Array of types: `web`, `mobile`, `desktop`, `automation`, `api`, `library` |
| `timeline.start_date` | Project start date (YYYY-MM-DD) |
| `screenshots` | At least one screenshot with `file` and `caption` |

### Optional Fields

| Field | Description |
|-------|-------------|
| `display.subtitle` | One-line tagline |
| `display.detailed_description` | Long description (markdown supported) |
| `classification.tags` | Technology tags |
| `classification.status` | `planning`, `development`, `completed`, `maintenance` |
| `classification.priority` | Display order (higher = first) |
| `timeline.end_date` | Project end date |
| `timeline.is_ongoing` | Set `true` if still active |
| `technologies` | Array of tech stack items |
| `features` | Array of feature descriptions |
| `links.demo_url` | Live demo URL |
| `links.documentation_url` | Documentation URL |
| `metrics.*` | Lines of code, commits, contributors |
| `story.challenges` | What was difficult |
| `story.achievements` | Results and achievements |
| `roles` | Your role and contributions |
| `client` | Client information |

## Templates

### Full Template

See [meta.json](./meta.json) for all available fields.

### Minimal Template

See [meta.minimal.json](./meta.minimal.json) for required fields only.

## Project Types

- `web` - Web applications and websites
- `mobile` - iOS/Android mobile apps
- `desktop` - Desktop software (Electron, native)
- `automation` - Automation scripts and tools
- `api` - Backend APIs and services
- `library` - Reusable libraries and packages

## Screenshot Guidelines

1. **main.png** (Required)
   - Main view of your project
   - Recommended: 1920x1080 or 1280x720

2. **Additional Screenshots** (Optional)
   - Name them descriptively: `feature-login.png`, `dashboard.png`
   - Include mobile views if responsive

3. **Supported Formats**
   - PNG (recommended)
   - JPG/JPEG
   - WebP

## Priority System

Use `classification.priority` to control display order:

- `priority: 10` - Featured projects (shown first)
- `priority: 5` - Important projects
- `priority: 0` - Default (sorted by date)
- Negative values push projects lower

## Example

```json
{
  "display": {
    "title": "E-Commerce Platform",
    "description": "Full-featured online shopping platform with payment integration"
  },
  "classification": {
    "project_type": ["web"],
    "status": "completed",
    "priority": 10
  },
  "timeline": {
    "start_date": "2024-01-15",
    "end_date": "2024-06-30"
  },
  "technologies": [
    { "name": "Next.js", "category": "frontend" },
    { "name": "Stripe", "category": "payment" }
  ],
  "screenshots": [
    { "file": "main.png", "caption": "Homepage" },
    { "file": "checkout.png", "caption": "Checkout Flow" }
  ]
}
```

## Sync Behavior

- **Automatic**: Daily sync via GitHub Actions
- **Manual**: Click the refresh button on the portfolio
- **On Push**: Not automatic (to avoid rate limits)

## Troubleshooting

### Metadata not showing up

1. Verify `portfolio/meta.json` exists in repo root
2. Check JSON syntax is valid
3. Wait for next sync or trigger manual refresh

### Screenshots not loading

1. Verify files exist in `portfolio/screenshots/`
2. Check file names match `meta.json` references
3. Ensure files are committed and pushed
