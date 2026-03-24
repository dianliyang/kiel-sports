# Mobile Price Label Layout Design

**Architecture:** Keep the existing price rendering markup and localized copy, but make the mobile layout more tolerant of long labels. The fix should happen primarily in CSS so translated labels such as `Mitarbeitende` keep their full meaning without colliding with the euro value on narrow screens.

**Approach Options:**
- Keep the current two-column mobile grid and allow labels to wrap inside each price item.
- Collapse the mobile price grid to one column for the narrowest layout to remove horizontal crowding.
- Shorten English and German copy only as a fallback if layout changes are insufficient.

**Recommendation:** Use the first two together. Let labels wrap and switch the small-screen price panel to a single-column stack. This fixes current long labels and makes future locales safer without reducing clarity.

**Testing:** Add a regression test that asserts the mobile CSS allows label wrapping and uses a single-column layout for the price panel at the small-screen breakpoint.
