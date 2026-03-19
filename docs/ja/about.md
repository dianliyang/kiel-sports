---
layout: doc
title: このサイトについて
search: false
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/dianliyang.png',
    name: 'dianliyang',
    title: 'GitHub Sponsors',
    desc: 'このプロジェクトの継続的な運営を支援できます。',
    sponsor: 'https://github.com/sponsors/dianliyang',
    actionText: '支援する'
  }
]
</script>

# このサイトについて

Sports in Kiel は、ドイツ・キールのワークアウトやアクティビティ情報を集約するサイトです。

CAU Sport Center、Urban Apes、そのほか地域の提供元から講座やアクティビティ情報を取得し、整理し、翻訳して、ひとつの見やすいカタログにまとめています。

## 使い方

- ワークアウトカードをクリックすると、元の提供元サイトを開けます。
- 入力欄にフォーカスしていないときは、<kbd>←</kbd> と <kbd>→</kbd> で前後のページへ移動できます。

## 免責事項

このサイトはスクレイピングした元データをもとに構成されています。発見や比較には便利ですが、すべての情報が完全で、常に正確で、最新であることを保証するものではありません。

このサイトの翻訳は人による確認を行っておらず、不正確な場合があります。

修正や改善への貢献を歓迎します。

日程、空き状況、料金、予約情報などの重要な内容は、必ず元の提供元で確認してください。

## サポート

<VPTeamMembers size="small" :members="members" />
