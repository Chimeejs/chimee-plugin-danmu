// import Browser from 'helper/browser.js';
import {deepAssign} from 'chimee-helper';
import Canvas from './canvas.js';
import Thread from './thread.js';
import Css from './css.js';

let pieceId = 0;
class Danma {
  /**
   * @constructor
   * @param {Object} plugin 当前这个 plugin
   * @param {Object} config 当前 plugin 配置
   */
  constructor (plugin, config) {
    this.plugin = plugin;
    this.pDom = plugin.$dom;
    this.config = config;
    this.thread = new Thread(plugin.$dom, config);
    // 画布有两种渲染方式， css 和 canvas
    this.changeMode(config.mode || 'css');
    this.lineHeight = config.lineHeight;
    this.timer = null;
  }

/**
 * 弹幕开始
 */
  start () {
    this.paper.start();
  }

  /**
   * 弹幕暂停
   */
  pause () {
    this.paper.pause();
  }

  /**
   * 清屏操作, 切换渲染模式时
   * 1. 清空 thread 中的数据
   * 2. 清空当前画布上的所有内容
   */
  clear () {
    this.thread.empty();
    this.paper && this.paper.clear();
  }

  /**
   * destroy 销毁操作， 切换模式， 或者用户手动销毁时
   */
  destroy () {
    this.paper.destroy();
  }

/**
 * 屏幕大小发生变化
 */
  resize () {
    this.paper.resize();
    this.thread.resize();
  }
/**
 * 切换 渲染模式
 * @param {String} mode 
 */
  changeMode (mode) {
    if(!mode || mode === this.mode) return;
    this.thread.empty();
    this.paper && this.destroy();
    this.paper = mode === 'canvas' ? new Canvas(this, this.config) : new Css(this, this.config);
    !this.plugin.paused && this.paper.start();
    this.mode = mode;
  }

/**
 * flow  mode 下寻找合适的行， 来存放这条弹幕，
 * @param {Object} piece 当前准备要插的弹幕
 * @return {Number} 行号
 */
  _line (piece) {
    const data = this.thread.pool;
    const len = data.length;
    const rows = new Array(this.thread.rows);
    let row = 0;

    for(let i = len - 1; i >= 0; i--) {
      if(data[i].mode === 'flow') {
        const r = data[i].row;
        rows[r] = rows[r] ? rows[r] : data[i];
      }

    }
    let maxX = 0;
    for(let j = 0; j < rows.length; j++) {

      if(!rows[j]) {
        row = j;
        break;
      }

      const left = rows[j].offset.x + rows[j].piece.width;

      if(piece.width < this.paper.width - left) {
        row = j;
        break;
      }

      if(!maxX || left < maxX) {
        maxX = left;
        row = rows[j].row;
      }
    }

    return row;
  }

/**
 * 固定在上下 mode 下寻找合适的行， 来存放这条弹幕，
 * @return {Number} 行号
 */
  _vLine (data) {
    const rows = this.thread.vRows;
    const len = rows.length;
    let row = 0;
// 固定模式下的弹幕其实是有两种状态
// 1是全部数组的length 都相同的时候
// 2是某个数组，比其他数组大一的情况

// 判断是否全部相同
    const plain = rows.every((item, i) => {
      return Array.isArray(rows[0]) && item.length === rows[0].length;
    });
    if(plain) {
      row = data.mode === 'top' ? 0 : len - 1;
    }else{
      row = this._cLine(rows, data);
    }
    rows[row] = rows[row] ? rows[row].concat(data) : [data];
    return row;
  }
  _cLine (r, d) {
    let row = 0;
    const len = r.length;
    const shortRow = [];
    for(let i = 0; i < len; i++) {
      const p = i === 0 ? len - 1 : i - 1;
      const n = i === len - 1 ? 0 : i + 1;
      const pLen = Array.isArray(r[p]) ? r[p].length : 0;
      const nLen = Array.isArray(r[n]) ? r[n].length : 0;
      const iLen = Array.isArray(r[i]) ? r[i].length : 0;

      if(!iLen || iLen < pLen || iLen < nLen) {
        shortRow.push(i);
      }
    }
    row = d.node === 'top' ? shortRow[0] : shortRow[shortRow.length - 1];
    return row;

  }

/**
 * 用户在当前时间点新增一条弹幕数据
 * @param {Object} d 弹幕数据
 */
  emit (data) {
    if(this.status === 'close') return;
    let danma = {};
    if(typeof data === 'string') {
      danma.text = data;
    }else{
      danma = data;
    }
    const defaultData = {
      text: '你真的很漂亮',
      mode: 'flow',
      fontSize: 'big',
      color: '#fff'
    };

    data = deepAssign(defaultData, danma);
    data.mode = data.mode || 'flow';
    const piece = this.paper.createPiece(data);
    const row = data.mode === 'flow' ? this._line(piece) : this._vLine(data);
    pieceId++;
    this.thread.pool.push({
      id: pieceId,
      piece,
      text: data.text,
      mode: data.mode,
      speed: Math.pow(piece.width, 1 / 3) * 0.3,
      row,
      offset: {
        x: data.mode === 'flow' ? this.paper.width : (this.paper.width - piece.width) / 2,
        y: this.lineHeight * row
      }
    });
  }

  getPieceByPoint (x, y) {
    const pieces = [];
    this.thread.pool.map(item => {
      const startPoint = [item.offset.x, item.offset.y];
      const endPoint = [item.offset.x + item.piece.width, item.offset.y + item.piece.width];
      x >= startPoint[0] && x <= endPoint[0] && y >= startPoint[1] && y <= endPoint[1] && pieces.push(item);
    });
    return pieces;
  }

  // forbid (id) {

  // }
}

export default Danma;
