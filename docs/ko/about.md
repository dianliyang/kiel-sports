---
layout: doc
title: 소개
search: false
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/dianliyang.png',
    name: 'dianliyang',
    title: 'GitHub Sponsors',
    desc: '이 프로젝트의 지속적인 유지 관리를 후원할 수 있습니다.',
    sponsor: 'https://github.com/sponsors/dianliyang',
    actionText: '후원하기'
  }
]
</script>

# 소개

Sports in Kiel은 독일 키엘의 운동 및 활동 정보를 모아 보여주는 집계 사이트입니다.

CAU Sport Center, Urban Apes, 그리고 기타 지역 제공처의 수업과 활동 정보를 스크래핑하고, 정리하고, 번역하여 하나의 탐색 가능한 카탈로그로 제공합니다.

## 이용 안내

- 운동 카드를 클릭하면 원래 제공처 웹사이트로 이동할 수 있습니다.
- 입력 필드에 포커스가 없을 때는 <kbd>←</kbd> 와 <kbd>→</kbd> 로 이전 페이지와 다음 페이지로 이동할 수 있습니다.

## 안내

이 사이트는 스크래핑한 원본 데이터를 바탕으로 구성됩니다. 탐색과 비교에는 유용하지만, 모든 정보가 완전하고 정확하며 항상 최신이라고 보장하지는 않습니다.

이 사이트의 번역은 사람이 확인하지 않았으며 부정확할 수 있습니다.

수정과 기여를 환영합니다.

일정, 자리 현황, 가격, 예약 정보처럼 중요한 내용은 반드시 원래 제공처에서 다시 확인하세요.

## 후원

<VPTeamMembers size="small" :members="members" />
