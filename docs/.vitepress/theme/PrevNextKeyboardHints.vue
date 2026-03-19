<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { useRouter, withBase } from "vitepress";
import { usePrevNext } from "vitepress/dist/client/theme-default/composables/prev-next.js";
import { getDocNavDirection } from "./keyboardNavigation";

const control = usePrevNext();
const router = useRouter();

function navigate(direction: "prev" | "next"): void {
  const link = control.value[direction]?.link;
  if (!link) return;
  void router.go(withBase(link));
}

function onKeydown(event: KeyboardEvent): void {
  const direction = getDocNavDirection(event);
  if (!direction || !control.value[direction]?.link) {
    return;
  }

  event.preventDefault();
  navigate(direction);
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template></template>
