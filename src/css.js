import {raf, caf, setStyle} from 'chimee-helper';
import {autobind} from 'toxic-decorators';

class Css {
  constructor (parent, config) {
    this.create(parent.pDom);
    this.thread = parent.thread;
    this.renderTime = parent.renderTime;
    this.timer = null;
    this.pDom = parent.pDom;
    this.fontSize = config.fontSize;
    this.lineHeight = config.lineHeight;
  }

  /**
   * 根据父节点创建 dom 画布，增加 dom 相关属性
   * @param {String} id
   */
  create (pDom) {
    const dom = document.createElement('div');
    dom.className = 'chimee-danmu-content';
    pDom.appendChild(dom);
    this.layer = dom;
    this.width = pDom.offsetWidth;
    this.height = pDom.offsetHeight;
  }

  /**
   * 销毁 dom 及其事件
   */
  destroy () {
    caf.call(window, this.timer);
    this.layer.parentNode.removeChild(this.layer);
  }

  /**
   * 为一条数据创建一个 piece
   * @param {Object} d data 一条弹幕相关信息, 创建的时候就把其塞到容器里
   */
  createPiece (d) {
    const fontSizeRatio = d.fontSize === 'small' ? 0.6 : 1;
    const fontSize = typeof d.fontSize === 'number' ? `${Math.floor(d.fontSize)}px` : `${Math.floor(fontSizeRatio * this.fontSize)}px`;
    const fontFamily = d.fontFamily || 'serif';
    const color = d.color || '#ffffff';
    const piece = document.createElement('div');
    piece.className = 'danmu-piece';
    setStyle(piece, {
      color,
      fontSize,
      fontFamily,
      transform: 'translateX(-9999px)'
    });
    piece.textContent = d.text;
    this.layer.appendChild(piece);
    piece.width = piece.offsetWidth;
    piece.height = this.lineHeight;
    return piece;
  }

  start () {
    this.render();
  }

  pause () {
    caf.call(window, this.timer);
  }

  resize () {
    this.width = this.pDom.offsetWidth;
    this.height = this.pDom.offsetHeight;
  }

/**
 * 逐条读取弹幕池中的弹幕数据并根据弹幕样式展示
 * @param {Array} pool
 */
  @autobind
  render () {
    this.thread.pool.forEach((item, i) => {
      setStyle(item.piece, 'transform', `translateX(${item.offset.x}px) translateY(${item.offset.y}px) `);
      if(item.mode === 'flow') {
        item.offset.x -= item.speed;
        if(item.offset.x < -item.piece.width) {
          item.piece.parentNode.removeChild(item.piece);
          this.thread.remove(i);
        }
      }else{
        const time = new Date();
        const index = item.row;
        item.startTime = item.startTime || new Date();
        if(time - item.startTime > 5000) {
          item.piece.parentNode.removeChild(item.piece);
          this.thread.remove(i);
          this.thread.vRows[index].shift();
        }
      }

    });
    this.timer = raf.call(window, this.render);
  }

  /**
   * 清除画布
   */
  clear () {
    this.layer.innerHTML = '';
  }
}

export default Css;
