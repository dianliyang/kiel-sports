declare module "vitepress/dist/client/theme-default/composables/prev-next.js" {
  import { Ref } from "vue";
  export function usePrevNext(): Ref<{
    prev?: { text: string; link: string };
    next?: { text: string; link: string };
  }>;
}
