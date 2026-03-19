---
layout: doc
title: Über uns
search: false
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/dianliyang.png',
    name: 'dianliyang',
    title: 'GitHub Sponsors',
    desc: 'Unterstütze die laufende Pflege dieses Projekts.',
    sponsor: 'https://github.com/sponsors/dianliyang',
    actionText: 'Unterstützen'
  }
]
</script>

# Über uns

Sport in Kiel ist ein Aggregator für Workout- und Aktivitätsangebote in Kiel, Deutschland.

Die Seite sammelt, organisiert und übersetzt Kurs- und Aktivitätsinformationen von Anbietern wie dem CAU Sportzentrum, Urban Apes und anderen lokalen Quellen in einem durchsuchbaren Katalog.

## Hinweise zur Nutzung

- Klicke auf eine Workout-Karte, um die Originalseite des Anbieters zu öffnen.
- Mit <kbd>←</kbd> und <kbd>→</kbd> kannst du zur vorherigen oder nächsten Seite wechseln, solange der Fokus nicht in einem Eingabefeld liegt.

## Haftungsausschluss

Diese Website wird aus erhobenen Quelldaten erstellt. Sie dient der Entdeckung und dem Vergleich, garantiert jedoch nicht, dass jedes Detail vollständig, absolut korrekt oder auf dem neuesten Stand ist.

Übersetzungen auf dieser Seite werden nicht von Menschen geprüft und können ungenau sein.

Beiträge und Korrekturen sind willkommen.

Verifiziere wichtige Details wie Zeitpläne, Verfügbarkeit, Preise und Buchungsinformationen immer beim ursprünglichen Anbieter, bevor du dich darauf verlässt.

## Unterstützung

<VPTeamMembers size="small" :members="members" />
