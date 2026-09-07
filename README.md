# 算法书 · LeetCode 解题手册

纯前端、零后端的算法阅读手册：16 专题 · 123 题 · Go 实现。

## 特性

- **多书单**：顶部下拉可切换书单（后续可加「面试常考」等，见下方「添加新书单」）
- **中文自然语言搜索**：支持关键词 + 描述匹配（N-gram + 同义词扩展 + 多字段加权）
- **阅读体验**：上一题/下一题、字号调节、深色模式、阅读进度条、继续阅读
- **学习追踪**：题目状态（待复习/已学/已掌握）+ 个人笔记 + 列表过滤（localStorage 本地保存）
- **代码块**：Go 语法高亮 + 行号 + 可编辑 + 一键复制
- **纯静态**：单 HTML 文件，双击即开，无任何后端依赖

## 本地使用

直接双击 `index.html`（或 `leetcode-roadmap.html`）在浏览器打开，平板同样适用。

## 部署到 GitHub Pages（3 步）

1. 在 GitHub 新建仓库（Public），把 `index.html`、`leetcode-roadmap.html`、`.nojekyll` 推送到 `main` 分支根目录：

   ```bash
   git init
   git add index.html leetcode-roadmap.html .nojekyll README.md
   git commit -m "init: algorithm book"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```

2. 打开仓库 **Settings → Pages**，在 **Build and deployment → Source** 选择 **Deploy from a branch**，Branch 选 `main` / `(root)`，Save。

3. 等 1~2 分钟，访问 `https://<你的用户名>.github.io/<仓库名>/` 即可。平板浏览器打开后可「添加到主屏幕」当 App 用。

> 无需任何 CI/CD：这是零构建的单文件站点，push 即部署。

## 更新内容

`leetcode-roadmap.html` 是源文件，`index.html` 是部署入口副本。修改源文件后重新复制同步：

```powershell
Copy-Item leetcode-roadmap.html index.html -Force
git add . ; git commit -m "update" ; git push
```

## 添加新书单

编辑 `leetcode-roadmap.html` 的数据区，在现有 `BOOKS['leetcode']` 旁追加：

```js
BOOKS['interview'] = {
  title: '后端面试高频算法 50 题',
  subtitle: '按面试题型分类 · Go 实现',
  short: '面试常考',              // 切换器里显示的短名
  stats: [{v:'50',k:'题'},{v:'10',k:'类'}],
  secs: [],
  prob: {}
};
// 然后正常追加数据：
// SECS.push({...}) / PROB['xxx'] = {...}（需先切引用，见 switchBook 的写法）
```

顶部书单切换器会自动出现新选项，URL 路由为 `#/book/interview/...`，学习进度按书单隔离。
