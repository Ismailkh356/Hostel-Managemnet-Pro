# Hostel Management System - Design Guidelines

## Design Approach

**Selected Framework:** Design System Approach (Utility-Focused)

**Justification:** This is an information-dense management application where efficiency, learnability, and consistent patterns are paramount. Drawing inspiration from modern productivity tools like Linear and Notion, combined with Material Design principles for comprehensive component coverage.

**Core Principles:**
- Clarity over decoration: Every element serves a functional purpose
- Scannable information hierarchy: Dense data presented in digestible chunks
- Efficient workflows: Minimize clicks for common tasks
- Responsive data tables: Comfortable viewing on various screen sizes

---

## Typography System

**Font Stack:** Inter (primary), SF Pro Display (headings alternative)
- **Headings:** 
  - H1: text-3xl font-semibold (Dashboard titles)
  - H2: text-2xl font-semibold (Section headers)
  - H3: text-xl font-medium (Card headers, Modal titles)
  - H4: text-lg font-medium (Subsections)
- **Body Text:** text-base font-normal (Default content)
- **Labels:** text-sm font-medium (Form labels, table headers)
- **Metadata:** text-sm font-normal (Timestamps, secondary info)
- **Small Text:** text-xs (Badges, helper text)

---

## Layout System

**Spacing Scale:** Use Tailwind units of 2, 4, 6, 8, 12, and 16
- Component padding: p-6 or p-8
- Section spacing: space-y-6 or space-y-8
- Card gaps: gap-4 or gap-6
- Form field spacing: space-y-4
- Tight spacing: gap-2 (button groups, inline elements)

**Grid Structure:**
- Main layout: Sidebar (w-64) + Content area (flex-1)
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 with gap-6
- Data tables: Full width with horizontal scroll on mobile
- Forms: Single column max-w-2xl for optimal input completion

---

## Component Library

### Navigation & Structure

**Sidebar Navigation:**
- Fixed left sidebar (w-64, h-screen)
- Logo/brand at top (p-6)
- Stacked navigation items with icons (Heroicons)
- Active state: Subtle background fill with medium font weight
- Collapsible sections for nested items
- User profile/settings at bottom

**Top Bar:**
- Breadcrumb navigation (left aligned)
- Global search (center, expandable)
- Quick actions: Notifications bell, user avatar (right aligned)
- Height: h-16 with px-6 padding

### Data Display

**Dashboard Cards:**
- Rounded corners (rounded-lg)
- Border treatment (border)
- Padding: p-6
- Structure: Header (icon + title + action button), Metric (large number), Trend indicator, Footer (context/link)
- Grid layout for 3-4 key metrics

**Data Tables:**
- Sticky header row
- Alternating row backgrounds for scannability
- Row actions (kebab menu on hover)
- Sortable column headers with arrow indicators
- Pagination controls at bottom
- Empty states with illustration + CTA
- Row height: py-4 for comfortable touch targets

**Guest/Booking Cards:**
- Compact card design (rounded-lg border p-4)
- Guest photo/avatar (left, w-12 h-12)
- Primary info (name, dates) with secondary metadata below
- Status badge (top right)
- Quick action buttons at bottom

### Forms & Inputs

**Form Layout:**
- Vertical labels above inputs
- Input fields: Full width, h-10, rounded-md, border
- Focus states: Ring treatment
- Required field indicators: Asterisk in label
- Helper text below inputs (text-sm)
- Error states: Border treatment + error message
- Multi-step forms: Progress stepper at top

**Input Types:**
- Text/Number inputs: Standard height h-10
- Textarea: Min height h-24
- Select dropdowns: Custom styled with chevron icon
- Date pickers: Calendar popover on click
- File uploads: Drag-drop zone with preview
- Search inputs: Magnifying glass icon (left), clear button (right when active)

**Button Hierarchy:**
- Primary CTA: Medium size px-6 py-2.5, rounded-md, font-medium
- Secondary: Ghost style with border
- Tertiary: Text only with hover underline
- Icon buttons: Square p-2, rounded-md
- Button groups: Attached with rounded-none on inner buttons

### Modals & Overlays

**Modal Dialogs:**
- Centered overlay with backdrop blur
- Max width: max-w-2xl for forms, max-w-4xl for detailed views
- Header: Title (text-xl) + close button (top right)
- Content padding: p-6
- Footer: Action buttons aligned right, cancel left
- Slide-in animation from bottom on mobile

**Drawers (Side Panels):**
- Right-aligned for quick edits/details
- Full height, w-96 or w-1/3
- Slide-in animation
- Used for: Guest details, booking modifications, quick add forms

**Toast Notifications:**
- Top-right positioned
- Auto-dismiss after 5s
- Icon indicating type (success, error, info)
- Padding: p-4, rounded-lg
- Stacked vertically with gap-2

### Calendar & Scheduling

**Room Availability Calendar:**
- Month view with day cells
- Booking blocks overlay on dates
- Hover shows booking details
- Click to view/edit booking
- Legend for booking statuses
- Navigation: Previous/Next month arrows + month/year dropdown

**Timeline View (Alternative):**
- Horizontal timeline with rooms as rows
- Booking blocks span across dates
- Drag-to-adjust booking duration
- Zoom controls for day/week/month views

### Special Components

**Status Badges:**
- Pill shaped (rounded-full px-3 py-1)
- Text: text-xs font-medium uppercase
- States: Available, Occupied, Maintenance, Checked-in, Checked-out, Pending, Confirmed, Cancelled

**Quick Stats Bar:**
- Horizontal row above main content
- Small cards showing: Total guests, Check-ins today, Check-outs today, Occupancy rate
- Icon + number + label format
- Quick glance metrics

**Search & Filters:**
- Persistent search bar in top navigation
- Advanced filters in expandable panel
- Active filter chips below search (dismissible)
- Filter categories: Date range, Room type, Status, Guest name

---

## Page-Specific Layouts

**Dashboard (Home):**
- Top: Quick stats bar (4 metrics)
- Middle: Today's check-ins/check-outs (2-column grid)
- Bottom: Recent activity feed + upcoming bookings

**Bookings Page:**
- Top: Search + filters + "New Booking" CTA
- Main: Data table with sortable columns
- Columns: Guest name, Room, Check-in, Check-out, Status, Actions
- Click row to open booking details drawer

**Rooms Page:**
- Grid of room cards (grid-cols-3)
- Card shows: Room image, number, type, capacity, status, nightly rate
- Hover reveals "View Details" overlay
- "Add Room" floating action button (bottom right)

**Guests Page:**
- List view with guest cards
- Search by name/email/phone
- Filters: Current guests, Past guests, All
- Click to view guest profile with booking history

**Calendar View:**
- Full-screen calendar interface
- Sidebar shows selected day's bookings
- Color-coded by room or booking status
- Drag-and-drop booking creation/modification

**Reports/Analytics:**
- Tab navigation for different report types
- Charts: Bar charts for revenue, line charts for occupancy trends
- Date range selector (top right)
- Export data button
- Grid of summary cards above charts

---

## Interaction Patterns

**Loading States:**
- Skeleton screens for data tables/cards
- Spinner for button actions
- Progressive loading for images

**Empty States:**
- Centered illustration (w-48)
- Helpful message (text-lg font-medium)
- Primary CTA to add first item
- Used in: Empty bookings, no search results, new installations

**Confirmation Dialogs:**
- Small modal (max-w-md)
- Warning icon for destructive actions
- Clear explanation of consequences
- Two-button footer: Cancel (ghost) + Confirm (primary/danger)

---

## Accessibility Requirements

- Keyboard navigation: Full support with visible focus indicators
- ARIA labels: All icon buttons, form inputs, interactive elements
- Form validation: Inline errors with aria-invalid
- Screen reader announcements: For toast notifications, modal changes
- Color contrast: WCAG AA compliant minimum
- Touch targets: Minimum 44x44px for mobile

---

## Images

This management application uses minimal decorative imagery, focusing on functional visuals:

**Profile Images:**
- Guest avatars: Circular, 40x40px in lists, 80x80px in profiles
- Staff avatars: Circular, 32x32px
- Fallback: Initials on solid background

**Room Images:**
- Featured image on room cards: 16:9 aspect ratio, rounded-lg
- Room details: Gallery with 3-5 images
- Thumbnails: Square, 100x100px

**Empty State Illustrations:**
- Simple line art style
- Centered, w-48 to w-64
- Locations: Empty bookings, no search results, welcome screens

**No Hero Images:** This is an internal tool, not a marketing site. Focus on efficient information display rather than visual storytelling.