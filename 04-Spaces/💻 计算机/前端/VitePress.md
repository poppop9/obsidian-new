<u>插件</u> ：

<u>教学</u> ：
- https://developer.aliyun.com/article/1487073?spm=a2c6h.14164896.0.0.2fc947c5MpOuep&scm=20140722.S_community@@%E6%96%87%E7%AB%A0@@1487073._.ID_1487073-RL_VitePress%E7%AE%80%E6%98%93%E9%80%9F%E9%80%9F%E4%B8%8A%E6%89%8B%E5%B0%8F%E5%86%8C-LOC_search~UND~community~UND~item-OR_ser-V_3-P0_0
- https://docs.bugdesigner.cn/docs/Tutorial/vitepress.html
- https://vitepress.yiov.top/

<u>模板市场</u> ：
- https://www.builtatlightspeed.com/

<u>例子</u> ：
- https://doc.theojs.cn/


# ❤ 安装
- `npm add -D vitepress` 
- `npx vitepress init` 初始化项目

# ❤ 文件结构
- `.vitepress` 
	- `.config.js` 配置文件，自定义站点的各个方面
- `src` 
	- `public` 静态资源
	- `notes` 笔记

# ❤ 布局
## 💛 首页
- <u>搜索栏</u> ：在 `config.mjs` 中的 themeConfig 中设置

```json
themeConfig: {
	……
	search: {
		provider: "local",
		options: {
			button: {
				buttonText: '搜索文档',
				buttonAriaLabel: '搜索文档',
			},
			modal: {
				noResultsText: '无法找到结果',
				resetButtonTitle: '重置搜索',
				footer: {
					selectText: '选择',
					navigateText: '切换',
				}
			}
		}
	},
}
```

- <u>网页标签图标</u> ：在 config.mjs 中设置
```java
export default defineConfig({
	……
    head: [["link", {rel: "icon", href: "https://obsidian-1307744200.cos.ap-guangzhou.myqcloud.com/%E5%9B%BE%E7%89%87/202408041213316.png"}]],
}
```



## 💛 文档页
### 💙 左侧栏文件夹
- 动态生成左侧文件树
```js
import path from "node:path";
import fs from "node:fs";

// 文件根目录
const DIR_PATH = path.resolve();
// 白名单, 过滤不是文章的文件和文件夹
const WHITE_LIST = [
    "index.md",
    ".vitepress",
    "node_modules",
    ".idea",
    "assets",
];

// 判断是否是文件夹
const isDirectory = (path) => fs.lstatSync(path).isDirectory();

// 取差值
const intersections = (arr1, arr2) =>
    Array.from(new Set(arr1.filter((item) => !new Set(arr2).has(item))));

// 把方法导出直接使用
function getList(params, path1, pathname) {
    // 存放结果
    const res = [];
    // 开始遍历params
    for (let file in params) {
        // 拼接目录
        const dir = path.join(path1, params[file]);
        // 判断是否是文件夹
        const isDir = isDirectory(dir);
        if (isDir) {
            // 如果是文件夹, 读取之后作为下一次递归参数
            const files = fs.readdirSync(dir);
            res.push({
                text: params[file],
                collapsible: true,
                items: getList(files, dir, `${pathname}/${params[file]}`),
            });
        } else {
            // 获取名字
            const name = path.basename(params[file]);
            // 排除非 md 文件
            const suffix = path.extname(params[file]);
            if (suffix !== ".md") {
                continue;
            }
            res.push({
                text: name,
                link: `${pathname}/${name}`,
            });
        }
    }
    // 对 name 做一下处理，把后缀删除
    res.map((item) => {
        item.text = item.text.replace(/\.md$/, "");
    });
    return res;
}

export const set_sidebar = (pathname) => {
    // 去掉 src/notes 前缀
    const trimmedPathname = pathname.replace(/^src\/notes\/?/, '');
    // 获取 pathname 的路径
    const dirPath = path.join(DIR_PATH, pathname);
    // 读取 pathname 下的所有文件或者文件夹
    const files = fs.readdirSync(dirPath);
    // 过滤掉白名单中的项
    const items = intersections(files, WHITE_LIST);
    // 调用 getList 函数
    return getList(items, dirPath, trimmedPathname);
};
```

- 将这个 mjs 文件导入到 config.mjs
```js
themeConfig: {
	……
	sidebar: {
		// 当访问/计算机/Web/前端下的路径时，展示后面的文件树
		"/计算机/Web/前端": set_sidebar("src/notes/计算机/Web/前端"),
	},
}
```

### 💙 右侧栏目录
- 右侧栏标题
```json
themeConfig: {
	outlineTitle: '目录',
}
```

- 右侧栏展示目录标题的级别
```json
themeConfig: {
	outline: [1, 4],
}
```


# ❤ 路由
<u>srcDir</u> ：将 src 目录配置为路由的根目录，这样访问笔记就可以直接端口号后面加 src 之后的路径
```js
export default defineConfig({
	// 
	srcDir: './src',
……
})
```


# ❤ 主题
在 `.vitepress/config.js` 中的 themeConfig 中配置

# ❤️ 配置
<u>纯净链接</u> ：访问文件时，没有多余的 `.md` 后缀链接

```js
export default defineConfig({
	cleanUrls: true, // 纯净链接
{)
```

# ❤ 插件
<u>图片放大</u> ：
- `npm add medium-zoom` 
- 在 .vitepress/theme 下添加 medium-zoom.mjs 
```js
import {onMounted, watch, nextTick} from 'vue'
import {useRoute} from 'vitepress'
import mediumZoom from 'medium-zoom'

export function useMediumZoom() {
    const route = useRoute();

    const initZoom = () => {
        // 不显式添加{data-zoomable}的情况下为所有图像启用此功能
        mediumZoom('.main img', {background: 'var(--vp-c-bg)'});
    };

    onMounted(() => {
        initZoom();
    });

    watch(
        () => route.path,
        () => nextTick(() => initZoom())
    );
}
```

- 将上述文件导入到同级目录的 index.js 中
```js
import {useMediumZoom} from "./medium-zoom.mjs";

export default {
    ……,
    setup() {
        useMediumZoom();
    }
}
```

- 避免遮挡
```css
/* 图片点击放大优先级调整 */
.medium-zoom-image {
  z-index: 9999 !important;
}
```

---

<u>多功能侧边栏</u> ： https://vitepress-sidebar.jooy2.com/

pwa ： https://chodocs.cn/program/vitepress-plugin/#%E6%96%87%E6%A1%A3%E6%94%AF%E6%8C%81-pwa

# ❤️ algolia DocSearch
- [申请免费爬取计划](https://docsearch.algolia.com/apply/)
	- 如果计划未通过，那就 [自己爬取](https://docsearch.algolia.com/docs/legacy/run-your-own/)
- 接受邀请，进入到官方创建好的爬网程序
- 获取 search key，并填写 config.mjs 配置，[配置详解](https://github.com/vuejs/vitepress/blob/main/types/docsearch.d.ts#L96)
```json
search: {    
	provider: 'algolia',
	options: {
		appId: 'RHXPT',
		apiKey: '28a8949a0177be59',
		indexName: 'vitepress',
		placeholder: '请输入搜索内容',
		translations: {
			button: {
				buttonText: '搜索文档',
			}
		}
	}
},
```

- 可以 [定义爬取的周期](https://www.algolia.com/doc/tools/crawler/apis/configuration/schedule/)

# ❤ 部署
## 💛 同步
将 github 的 B 库，同步到 C 库的某个子文件夹下
```yml
# sync-to-vitePress.yml 文件
name: Sync to C repository subfolder

on:
  push:
    branches:
      - main  # 监听B仓库main分支的更改

jobs:
  sync:
    runs-on: ubuntu-22.04
    steps:
      # Step 1: 检出 B 仓库的代码
      - name: Checkout obsidian-new repository
        uses: actions/checkout@v3
        
      # Step 2: 克隆 C 仓库到本地
      - name: Clone vitePress repository
        run: |
          git clone https://${{ secrets.ACCESS_TOKEN }}@github.com/poppop9/vitePress.git
          cd vitePress
          git checkout main

      # Step 3: 将 B 仓库的内容复制到 C 仓库的子文件夹
      - name: Copy B repository to C repository subfolder
        run: |
          mkdir -p vitePress/src/notes
          cp -r $(ls -A | grep -v vitePress) vitePress/src/notes/
          
      # Step 4: 提交并推送更改到 C 仓库
      - name: Commit and Push changes to C repository
        run: |
          cd vitePress
          git config --global user.name "GitHub Action"
          git config --global user.email "action@github.com"
          git add src/notes
          git commit -m "Sync from obsidian-new repository" || echo "No changes to commit"
          git push origin main
```

https://blog.csdn.net/weixin_42164539/article/details/128761266

<u>部署平台</u> ：
- vercal
	- 构建命令 `npm run docs:build` 
	- 输出目录 `.vitepress/dist` 
- https://www.netlify.com/

---

Windows 创建软连接，将笔记文件夹，软链接到项目的 notes 文件夹下
```bash
New-Item -ItemType SymbolicLink -Path "E:\VScode\vitepress\src\notes" -Target "E:\Obsidian doc\obsidian"
```










