---
layout: doc
title: About
search: false
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/dianliyang.png',
    name: 'dianliyang',
    title: 'GitHub Sponsors',
    desc: 'Support ongoing maintenance of this project.',
    sponsor: 'https://github.com/sponsors/dianliyang',
    actionText: 'Sponsor'
  }
]
</script>

# About

Sports in Kiel is an aggregator for workout and activity listings in Kiel, Germany.

It scrapes, organizes, and translates course and activity information from providers such as the CAU Sport Center, Urban Apes, and other local sources into one browsable catalog.

## Guidance

- Click a workout card to open the original provider website.
- Use <kbd>←</kbd> and <kbd>→</kbd> to move to the previous or next page when focus is not inside an input field.

## Disclaimer

This site is built from scraped source data. It is useful for discovery and comparison, but it does not guarantee that every detail is complete, perfectly accurate, or the latest available.

Translations on this site are not checked by humans and may be inaccurate.

Contributions and corrections are welcome.

Always verify important details such as schedule, availability, pricing, and booking information with the original provider before relying on it.

## Support

<VPTeamMembers size="small" :members="members" />
