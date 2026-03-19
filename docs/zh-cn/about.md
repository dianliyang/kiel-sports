---
layout: doc
title: 关于
search: false
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/dianliyang.png',
    name: 'dianliyang',
    title: 'GitHub Sponsors',
    desc: '支持这个项目的持续维护。',
    sponsor: 'https://github.com/sponsors/dianliyang',
    actionText: '支持'
  }
]
</script>

# 关于

Sports in Kiel 是一个聚合德国基尔运动课程和活动信息的网站。

它会抓取、整理并翻译来自 CAU Sport Center、Urban Apes 以及其他本地提供方的课程与活动信息，并汇总成一个可浏览的目录。

## 使用说明

- 点击课程卡片即可跳转到原始提供方网站。
- 当焦点不在输入框内时，可以使用 <kbd>←</kbd> 和 <kbd>→</kbd> 切换上一页和下一页。

## 免责声明

本网站基于抓取到的来源数据构建，适合用来发现和比较课程，但不保证所有信息都完整、绝对准确或始终是最新状态。

本站中的翻译未经人工核对，可能并不准确。

欢迎你提供修正和贡献。

涉及时间、名额、价格、预约等重要信息时，请务必以原始提供方页面为准。

## 支持

<VPTeamMembers size="small" :members="members" />
