# Excel 导出后打开很慢 / 图片异常 — 归因说明

本文记录对 **sys6 报货 / 做单 / 捡号** 导出流程的技术分析结论，便于后续改需求或换实现时对照。

---

## 现象

- 上传 Excel → 在系统内生成导出数据 → 下载「带图」的表格文件后，用 **Microsoft Excel** 打开 **耗时很长**。
- 部分环境下图片 **显示不全或像「丢失」**（实为加载失败或超时）。

---

## 主因：导出物不是「内嵌图片的 xlsx」，而是 HTML 伪装成 Excel

项目使用 **`vue-json-excel`**（依赖 `downloadjs`）。其机制是：

1. 把 JSON 数据拼成 **完整 HTML 文档**（含 `<table>`、表头等）。
2. 以 **`application/vnd.ms-excel`** MIME 类型触发下载，扩展名常为 `.xls` / `.xlsx`。

也就是说，文件本质是 **「HTML 表格 + Excel 兼容外壳」**，**不是** Office Open XML（真正的 `.xlsx` 二进制包）里那种 **把图片字节打进压缩包** 的方式。

相关实现见：`node_modules/vue-json-excel/JsonExcel.vue` 中的 `jsonToXLS`（把 `data` 渲染成 HTML 的 `<table>`，再塞进模板字符串）。

**后果**：Excel 打开文件时，除了解析大段 HTML 外，对单元格里的 `<img src="https://...">` 会按 **外链** 去 **联网下载** 每一张图。  
订单量大、SKU 多时，**唯一图片 URL 数量可达数百**，打开时间近似于「解析 HTML + 大量 HTTP 请求」，因此会 **明显变慢**。

---

## 次因：单元格内嵌套 HTML 体积大

报货等导出在 `src/views/sys6/goods/utils/imgExport.js` 里按 **每行 4 张图** 分块，每个格子是 `excelFormat.js` 里拼出来的 **嵌套 `<table>`**（图 + 规格 + 品名等），旁边还有占位用的 `imgEmptyLeftTable`。

在一次实测（调试埋点）中，约 **95 行导出块、377 张不重复图** 时，仅序列化后的导出 JSON 长度约 **29 万字符量级**；实际 HTML 只会更大。  
**HTML 解析与渲染** 本身也会贡献一部分打开时间，但通常 **弱于「数百次外链拉图」**。

---

## 图片 URL 与「丢图」的代码向因素

### 1. 拼接 `src="https:${img}"` 的边界情况

`src/views/sys6/goods/utils/excelFormat.js` 中 `imgTable`、`orderTable` 使用：

```text
<img src="https:${img}" ... />
```

- 当 `img` 为 **`//host/path`**（协议相对 URL，小秘导出里常见）时，结果为 **`https://host/path`**，合法。
- 当 `img` 已是 **`https://...` 完整 URL** 时，会变成 **`https:https://...`**，**非法**，图片必挂。

`src/views/sys6/goods/utils/jianhaoExcel.js` 中捡号导出同样存在 `https:${imgUrl}` 的写法，逻辑一致。

### 2. 导入阶段把缩略图换成大图

`src/views/sys6/upload/main.js` 在映射「商品图片网址」时，将 **`_100x.` 替换为 `_300x.`**，便于在系统里看图更清晰。

导出 HTML 里的 `<img src>` 若仍指向 **`_300x`**，Excel 打开时 **单张下载更大**，总流量与耗时上升，也更容易因超时、弱网表现为 **图不出来**。

**缓解思路（实现层面，按需采纳）**：

- 仅在 **导出用 HTML** 的 `src` 上把 `_300x` 改回 `_100x`（或单独导出域名规则），与页面展示用 URL 解耦。
- 或使用统一函数：规范化协议（`//` / `https://`）并可选降级缩略图，避免双 `https:` 与过大外链图叠加。

---

## 与「真 Excel + 内嵌图」的差异（为何换技术能根治）

| 方式 | 打开时图片从哪来 |
|------|------------------|
| 当前：HTML + `<img src="URL">` | Excel **联网按 URL 再下载** |
| 真 xlsx + 内嵌图片 / 绘图 | 像素数据在 **文件包内**，打开主要读本地 IO |

若要 **显著** 减少打开时间、避免外链失败，需要改为 **生成真正的 xlsx 并把图片写入工作簿**（通常需服务端或专用库，纯前端成本与体积更高）。

---

## 小结（归因一句话）

**打开慢**：Excel 在打开「HTML 伪 Excel」时，要对 **大量 `<img>` 外链** 发起网络请求；图多、图大则更慢。  
**像丢图**：除网络/CDN 因素外，需排查 **`https:` 与完整 `https://` URL 的错误拼接**，以及 **过大缩略图尺寸（如 `_300x`）** 带来的超时风险。

---

## 相关文件索引

| 路径 | 说明 |
|------|------|
| `node_modules/vue-json-excel/JsonExcel.vue` | HTML 导出为「Excel」 |
| `src/views/sys6/goods/index.vue` | `download-excel` 触发下载 |
| `src/views/sys6/goods/utils/imgExport.js` | 报货图块导出数据结构 |
| `src/views/sys6/goods/utils/ordersExport.js` | 做单导出 |
| `src/views/sys6/goods/utils/excelFormat.js` | `imgTable` / `orderTable` HTML |
| `src/views/sys6/goods/utils/jianhaoExcel.js` | 捡号表格 HTML |
| `src/views/sys6/upload/main.js` | 导入时 `_100x` → `_300x` 等 |

---

**相关**：若要将导出改为真 xlsx 且与当前视觉效果对齐，见 [excel-export-parity-spec.md](./excel-export-parity-spec.md)。

---

*文档基于对当前仓库与一次带埋点的本地复现（样例：约 482 行导入、377 张不重复图、多数 URL 含 `_300x`）整理。*
