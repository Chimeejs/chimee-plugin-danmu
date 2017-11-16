# 弹幕组件

> 使用 css ／ canvas 实现弹幕

## 安装使用

1. 安装

```shell
npm install chimee-plugin-danmu
```

2. 使用

```javascript
import chimee from 'chimee';
import chimeePluginDanmu from 'chimee-plugin-danmu';

// 安装插件
chimee.install(chimeeDanmu);
const player = new chimee({
  // ...
  // 使用插件
  plugin: [
    chimeePluginDanmu.name
  ]
});
```

**也可以在页面中引用 /lib/index.browser.js 然后在页面中使用 chimeePluginDanmu**

## 配置

### mode

  * 类型： String
  * 含义： 弹幕使用 canvas 还是 css 渲染
  * 默认： 'css'
  * 值： 'css' , 'canvas'

### lineHeight

  * 类型： String
  * 含义： 弹幕使用 canvas 还是 css 渲染
  * 默认： 'css'
  * 值： 'css' , 'canvas'

### updateByVideo

  * 类型： Boolean
  * 含义： 弹幕是否与视频状态同步，视频播放／暂停状态对应弹幕的播放暂停
  * 默认： true, 默认是同步的
  * 值： true / false


## 方法

### start

  * 作用： 弹幕开始
  * 类型： Function
  * 参数： 空
  * 返回： 空

### pause

  * 作用： 弹幕暂停
  * 类型： Function
  * 参数： 空
  * 返回： 空

### open

  * 作用： 打开弹幕
  * 类型： Function
  * 参数： 空
  * 返回： 空

### close

  * 作用： 关闭弹幕
  * 类型： Function
  * 参数： 空
  * 返回： 空

### changeMode

  * 作用： 切换弹幕渲染方式
  * 类型： Function
  * 参数： mode
    * 类型： String
    * 含义： 替换的模式， 可传 'css' 或者 'canvas' 不可以为空
  * 返回： 空

### sendMsg

  * 作用： 发送弹幕
  * 类型： Function
  * 参数： data
    * 类型： Object
      * text
        * 类型： String
        * 含义： 弹幕内容
      * mode
        * 类型： String
        * 含义： 弹幕展现方式（固定下方 top/ 固定上方bottom）／滚动弹幕(flow)
        * 默认值： flow
      * fontSize
        * 类型： String
        * 含义： 字体大小（大号 big）／ （小号／ small)
        * 默认值： big
      * color
        * 类型： String
        * 含义： 弹幕颜色
        * 默认值： #fff
      
    * 含义： 替换的模式， 可传 'css' 或者 'canvas' 不可以为空
  * 返回： 空

```javascript
  const defaultData = {
    text: '你真的很漂亮',
    mode: 'flow',
    fontSize: 'big',
    color: '#fff'
  };

```

### receiveData

  * 作用： 接受弹幕的初始数据
  * 类型： Function
  * 参数： data
    * 类型： Array
    * 含义： 初始化塞入的所有数据
  * 返回： 空


## 事件

### danmuContextmenu

  * 作用：监听弹幕右键点击事件
  * 回调函数参数： 
    * pieces: 
      * 类型: Array
      * 含义: 位于这个位置的所有弹幕集合


## 其他

### Q: 如何实现弹幕右键弹窗

  用户可以监听 danmuContextmenu 事件，拿到该点下面的所有弹幕，然后使用 chimee-plugin-pop 插件，来自己构造弹窗（原因：弹窗内容根据业务场景会有不同的定制情况）