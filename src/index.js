import {isObject, deepAssign, addEvent, removeEvent, raf, caf} from 'chimee-helper';
import Danmu from './danmu.js';
import './danmu.css';

/**
 * 插件默认配置
 */
const defaultConfig = {
  lineHeight: 30,
  fontSize: 24,
  mode: 'css'
};

const chimeeDanmu = {
  name: 'chimeeDanmu',
  el: 'chimee-danmu',
  data: {
    status: 'open',
    danmu: {},
    danmuList: [],
    currentPostion: 0, // 目前弹幕指针的位置
    currentPiece: {} // 目前弹幕指针所指的弹幕片
  },
  operable: true,
  penetrate: true,
  level: -1,
  create () {
  },
  init (videoConfig) {
    if(videoConfig && videoConfig.danmu === false) return;
    const config = isObject(this.$config) ? deepAssign(defaultConfig, this.$config) : defaultConfig;
    this.danmu = new Danmu(this, config);
    addEvent(window, 'resize', this._resize);
  },
  inited () {

  },
  destroy () {
    this.danmu.destroy();
    this.$dom.parentNode.removeChild(this.$dom);
    removeEvent(window, 'resize', this._resize);
  },
  events: {
    play () {
      this.status === 'open' && this.danmu.start();
    },
    pause () {
      this.status === 'open' && this.danmu.pause();
    },
    timeupdate () {
      if(this.status === 'close') return;
      // 这里可以留一个限制，限制一秒内数据的展示量
      if(Math.abs(this.currentTime - this.currentPiece.time) > 1 || this.currentPiece.time === undefined) {
        this.__searchPosition();
      }
      while(this.currentTime >= this.currentPiece.time && this.currentPiece.time) {
        this.danmu.emit(this.currentPiece);
        this.currentPiece = this.danmuList[this.currentPostion++] || {};
      }
    },
    contextmenu () {
      // 暂未扩充，调研中。。。
    }
  },
  methods: {
    __searchPosition () {
      const len = this.danmuList.length;
      if(len === 0) return;
      if(this.currentTime > this.danmuList[len - 1].time) {
        this.currentPiece = {};
        this.currentPostion = len + 1;
        return;
      }
      if(this.currentTime < this.danmuList[0].time) {
        this.currentPiece = this.danmuList[0];
        this.currentPostion = 0;
        return;
      }
      for(let i = 0; i < len; i++) {
        const item = this.danmuList[i];
        if(item.time >= this.currentTime) {
          this.currentPostion = i;
          this.currentPiece = item;
          break;
        }
      }
    },
    open () {
      this.status = 'open';
    },
    close () {
      this.status = 'close';
      this.danmu.clear();
      this.danmu.pause();
    },
    start () {
      this.danmu.start();
    },
    pause () {
      this.danmu.pause();
    },
    changeMode (mode) {
      this.danmu.changeMode(mode);
    },
    sendMsg (msg) {
      this.status === 'open' && this.danmu.emit(msg);
    },
    receiveData (data) {
      this.danmuList = data;
      this.currentPiece = this.danmuList[this.currentPostion++] || {};
    },
    _resize () {
      this.danmu.resize();
    }
  }
};
export default chimeeDanmu;

