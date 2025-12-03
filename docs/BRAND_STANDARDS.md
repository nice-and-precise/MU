# Brand Standards & Design System

## 1. Brand Identity

**Midwest Underground** is a premier Horizontal Directional Drilling (HDD) operations platform. Our brand reflects strength, precision, safety, and industrial reliability. The interface is designed to be used by engineers in the office and crews in the field, requiring a balance of high-density data visualization and clear, high-contrast readability.

### Core Values
*   **Reliability**: Systems that work as hard as the crews in the field.
*   **Precision**: Accurate data visualization and reporting.
*   **Safety**: High-visibility colors and clear warnings to prevent errors.
*   **Efficiency**: Streamlined workflows to minimize downtime.

## 2. Visual Identity

### Logos
*   **Primary Logo**: `MidwestUnderground_Logo (1).png`
    *   **Usage**: Official documents, main application headers, marketing materials, and reports.
*   **Icon/Mark**: `MU_Logo (1).png`
    *   **Usage**: Favicons, mobile headers, compact UI elements, and social media avatars.

**Usage Guidelines:**
*   **Clear Space**: Maintain a minimum clear space equal to 50% of the logo's height around all sides.
*   **Integrity**: Do not distort, stretch, or recolor the logo.
*   **Contrast**: Ensure the logo is placed on a background that provides sufficient contrast. Use the white version on dark backgrounds.

### Color Palette

Our color palette is designed for high visibility and contrast, suitable for both office and field environments. It leverages CSS variables for easy theming and Dark Mode support.

| Color Name | Hex Code | Tailwind Variable | Usage |
| :--- | :--- | :--- | :--- |
| **Midwest Charcoal** | `#2A2A2A` | `--color-charcoal` / `--primary` | Primary text, dark backgrounds, headers, neutral buttons. |
| **Safety Orange** | `#FF6700` | `--color-orange` / `--secondary` | Call-to-actions, alerts, highlights, active states. |
| **Sky Blue** | `#4A90E2` | `--color-blue` / `--accent` | Information, links, focus rings, secondary highlights. |
| **White** | `#FFFFFF` | `--background` | Main background (Light Mode), cards, inputs. |
| **Slate** | `#0f172a` | `--background` (Dark) | Main background (Dark Mode). |

**Semantic Colors:**
*   **Primary**: Used for main actions and key brand elements.
*   **Secondary**: Used for high-priority actions (Safety Orange).
*   **Destructive**: Used for dangerous actions (Red).
*   **Muted**: Used for secondary text and backgrounds.
*   **Accent**: Used for interactive elements and highlights.

### Typography

We use a combination of **Inter** for readability and **Oswald** for industrial impact.

*   **Headings (Oswald)**: Strong, condensed sans-serif.
    *   **Usage**: Page titles, section headers, data labels, and navigation items.
    *   **Variable**: `--font-oswald`
    *   **Tailwind Class**: `font-heading`
*   **Body (Inter)**: Clean, modern sans-serif.
    *   **Usage**: General text, forms, data tables, and tooltips.
    *   **Variable**: `--font-inter`
    *   **Tailwind Class**: `font-sans`

## 3. UI/UX Components

We utilize a component-driven architecture based on **shadcn/ui** and **Tailwind CSS**. This ensures consistency and accessibility across the application.

### Design Tokens
*   **Border Radius**: `0.625rem` (approx 10px) - Softens the industrial look slightly for a modern feel.
    *   Variable: `--radius`
*   **Shadows**: Subtle shadows to create depth without clutter.
*   **Icons**: **Lucide React** - Consistent, stroke-based icons that scale well.

### Common Components
*   **Buttons**:
    *   `default`: Charcoal background, white text. Standard action.
    *   `secondary`: Orange background, dark text. High visibility/Safety action.
    *   `destructive`: Red background, white text. Delete/Remove actions.
    *   `outline`: Bordered, transparent background. Secondary actions.
    *   `ghost`: Transparent background. Low priority actions.
*   **Cards**: White (or dark slate) background with subtle border and shadow. Used for grouping content like job details, forms, or charts.
*   **Inputs**: Clean borders with focus rings matching the accent color (Sky Blue).
*   **Data Tables**: High density, alternating row colors (striped) for readability, sticky headers.

## 4. Technical Implementation

### Global Configuration
Styles are defined in `src/app/globals.css` using Tailwind CSS v4 `@theme` directives.

```css
@import "tailwindcss";
@plugin "tailwindcss-animate";

:root {
  /* Brand Colors */
  --color-charcoal: #2A2A2A;
  --color-orange: #FF6700;
  --color-blue: #4A90E2;

  /* Theme Variables */
  --primary: oklch(0.205 0 0); /* Charcoal */
  --secondary: oklch(0.97 0 0); /* Orange-ish/Light */
  --accent: oklch(0.97 0 0);
  /* ... */
}

@theme inline {
  --color-charcoal: var(--color-charcoal);
  --color-orange: var(--color-orange);
  --color-blue: var(--color-blue);
  --font-sans: var(--font-inter);
  --font-heading: var(--font-oswald);
}
```

### Font Loading
Fonts are loaded in `src/app/layout.tsx` using `next/font/google` to ensure zero layout shift and optimal performance.

```tsx
import { Inter, Oswald } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <body className={`${inter.variable} ${oswald.variable} antialiased`}>
      {children}
    </body>
  );
}
```

### Component Usage
Import components from the `@/components/ui` directory. Do not build custom buttons or inputs unless absolutely necessary; extend the existing ones.

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function JobCard({ title, status }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-sans text-muted-foreground">Status: {status}</p>
        <Button variant="secondary" className="mt-4">View Details</Button>
      </CardContent>
    </Card>
  );
}
```

## 5. Best Practices & Research

### Accessibility (a11y)
*   **Contrast**: Ensure text passes WCAG AA standards (4.5:1 ratio). This is critical for field use where lighting conditions vary.
*   **Focus States**: All interactive elements must have visible focus states. Tailwind's `ring` utilities handle this by default in shadcn/ui.
*   **Semantic HTML**: Use proper tags (`<main>`, `<nav>`, `<button>`, `<table>`) to ensure screen reader compatibility and proper keyboard navigation.
*   **ARIA Labels**: Use `aria-label` or `aria-labelledby` for icons or non-text elements.

### Responsive Design
*   **Mobile-First**: Design for mobile screens first. Field crews use tablets and phones.
*   **Breakpoints**: Use standard Tailwind breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`).
*   **Touch Targets**: Ensure buttons and links are at least 44x44px for touch usability.

### Performance
*   **Image Optimization**: Use `next/image` for all assets.
*   **Dynamic Imports**: Use `next/dynamic` for heavy components (e.g., 3D maps, complex charts) to reduce initial bundle size.
*   **Server Components**: Prefer Server Components for data fetching and static content to reduce client-side JavaScript.

### Code Quality
*   **TypeScript**: Use strict typing. Avoid `any`.
*   **Linting**: Follow the project's ESLint configuration.
*   **Naming Conventions**:
    *   Components: PascalCase (`JobCard.tsx`)
    *   Functions: camelCase (`calculateDistance`)
    *   Variables: camelCase (`jobId`)
    *   Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)
