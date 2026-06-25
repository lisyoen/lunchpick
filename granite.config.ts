import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "lunchpick",
  brand: {
    displayName: "오늘 뭐 먹지",
    primaryColor: "#3182F6",
    icon: "", // 앱인토스 콘솔 업로드 후 이미지 URL 입력
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev --port 5173",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
