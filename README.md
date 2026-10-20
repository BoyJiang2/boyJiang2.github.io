# Boy's Website

我的个人网站，用来放博客、项目和学习笔记。

Astro + Markdown/MDX，内容保存在 `src/content/`。站内支持统一搜索、四种主题、KaTeX 公式和分级目录。

## 本地运行

```bash
npm install
npm run dev
```

检查类型并构建静态页面：

```bash
npm run check
npm run build
```

## 写内容

```text
src/content/
├─ blogs/      # 博客
├─ projects/   # 项目
└─ notes/
   ├─ 课程/课程名称/
   ├─ 论文/论文系列/
   └─ 技术/主题名称/
```

笔记的分类和系列由文件夹决定，例如：

```text
src/content/notes/论文/Transformer 经典论文/attention-is-all-you-need.md
```

博客和笔记常用的 frontmatter：

```yaml
---
title: Attention Is All You Need
summary: 用自注意力替代循环与卷积。
tags: [Transformer, Attention]
---
```

- 博客默认不公开，需要设置 `published: true`；笔记和项目默认公开，可用 `published: false` 隐藏。
- 目前只列出 `src/content/notes/论文/` 下的笔记，范围由 `src/utils/content.ts` 中的 `PUBLIC_NOTE_CATEGORIES` 控制。
- 博客可选 `wide: true`，用于知识图谱这类交互式 MDX 文章；默认是 `false`。
- 列表和索引按文件夹路径与标题自动排序。
- 正文中的 `## / ### / ####` 会自动生成文章目录。
- 公式、代码、引用、表格和图片示例见 `src/content/notes/技术/Markdown 写作手册/markdown-capabilities-demo.md`。

### 图片与附件

推荐将文章图片放在文章同目录的 `assets/` 中，图片会由 Astro 自动读取、打包并部署。这样移动或重命名文章时，图片也会一起管理：

```text
src/content/notes/论文/MLSys/kv-cache.md
src/content/notes/论文/MLSys/assets/kv-cache-layout.png
```

在 Markdown 中使用相对路径：

```md
![KV Cache 布局](./assets/kv-cache-layout.png)
```

建议图片文件使用小写英文、数字和连字符命名；截图优先使用 WebP 或 PNG。图片会保持原始清晰度，并自动适应文章宽度。

跨文章共用的图片，以及 PDF、压缩包等下载附件，仍放在 `public/uploads/`：

```md
![图片说明](/uploads/example.png)
[下载 PDF](/uploads/example.pdf)
```

### 新增项目

1. 在 `src/content/projects/` 新建一个 `.md` 文件，例如 `my-project.md`。
2. 填入最小 frontmatter。项目卡片会直接打开这里的 GitHub 链接：

```yaml
---
title: My Project
summary: 用一句话说明这个项目解决了什么问题。
tags: [Astro, TypeScript]
github: https://github.com/your-name/my-project
---
```

3. 本地检查、构建通过后提交并推送，部署方式见下文：

```bash
npm run check
npm run build
git add src/content/projects/my-project.md
git commit -m "Add my project"
git push origin main
git push github-pages main
```

## 在线编辑

仓库中的 `.pages.yml` 已配置 [Pages CMS](https://app.pagescms.org/)：

1. 使用 GitHub 登录 Pages CMS。
2. 授权 `BoyJiang2/Boy-website`。
3. 选择 `main` 分支。
4. 新建或修改博客、项目和笔记。

保存后，内容和附件会直接提交到 GitHub。

## 部署

- 构建命令：`npm run build`
- 输出目录：`dist`
- Node.js：20+

- `BoyJiang2/Boy-website`（`origin` remote）的 `main` 分支更新后自动部署到 Cloudflare，网站使用自定义域名 `https://boyjiang.com`（Worker 默认地址为 `boy-website.boyjiang2.workers.dev`）；`ASTRO_SITE` 默认是 `https://boyjiang.com`。
- `BoyJiang2/boyJiang2.github.io`（`github-pages` remote）由 `.github/workflows/deploy.yml` 部署；该工作流只在此仓库运行，使用 `main` 分支和 `ASTRO_SITE=https://boyjiang2.github.io`。
