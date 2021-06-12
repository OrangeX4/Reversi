# Reversi 黑白棋 (前端部分)

## [在线网址](http://1.15.246.22/)

## 实现功能

### 双人对战

拥有基本的黑白棋游戏判断逻辑, 和简洁的界面显示.

用于在一台设备上自娱自乐 (并不.

并且可以保存对局数据, 便于后续分析.

![](https://pic3.58cdn.com.cn/nowater/webim/big/n_v2df668e13f633489a8f44f8a411eede7c.png)

### 人机对战

通过前后端分离的设计, 前端用前端全家桶实现, 后端使用 Python 语言, 便于整合黑白棋 AI 算法.

目前已经有数位小伙伴把 AI 放到这里了!

比如杰哥, czz 和阿伟.

![](https://pic3.58cdn.com.cn/nowater/webim/big/n_v2e4655e504a00402f9de661bceaaceeb9.png)

### 联机对战

经过好几天的奋斗, 终于加入了联机功能!

虽然实现的不是很优雅, 但是支持十个对局的 "高 (di) 并发" 应该没问题??

![](https://pic3.58cdn.com.cn/nowater/webim/big/n_v2ae48e8a6900a4683a7c4f32cdf723635.png)

### AI 对战

我们可以让 AI 打 AI!

这样就能快乐地以可视化的方式看 AI 打架了.

(虽然服务器可能撑不住...)

![](https://pic3.58cdn.com.cn/nowater/webim/big/n_v295f23e78561d40628166b05ebd847ea1.png)


## 使用技术

- 前端必备三个基础知识: HTML + CSS + JS
- 前端框架: React (React Hook + Typescript)
- 组件库: Ant Design


## 自行部署

1. 安装 [NodeJS](https://nodejs.org/en/);
2. 安装 Yarn: `npm install yarn -g`;
3. Clone 该仓库: `git clone https://github.com/OrangeX4/Reversi-Front.git`;
4. 终端进入该仓库, 运行 `yarn start` 进入代码热更新开发模式;
5. 运行 `yarn build` 生成静态文件;
6. 修改 `src\utils.ts` 文件下的 url 地址, 以适配你的后端.


## [后端](https://github.com/OrangeX4/Reversi-Back)



