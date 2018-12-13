import {raf, caf} from 'chimee-helper';

class Canvas {
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
   * 根据父节点创建 canvas 画布，增加 canvas 属性
   * @param {String} id
   */
  create (pDom) {
    const canvas = document.createElement('canvas');
    canvas.className = 'chimee-danmu-content';
    pDom.appendChild(canvas);

    this.layer = canvas;
    this.width = this.layer.width = pDom.offsetWidth;
    this.height = this.layer.height = pDom.offsetHeight;
    this.context = this.layer.getContext('2d');
  }
  /**
   * 销毁 dom 及其事件
   */
  destroy () {
    caf.call(window, this.timer);
    this.layer.parentNode.removeChild(this.layer);
  }
  /**
   * 为一条数据创建一个 canvas
   * @param {Object} d
   */
  createPiece (d) {
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    const fontSizeRatio = d.fontSize === 'small' ? 0.6 : 1;
    const fontSize = typeof d.fontSize === 'number' ? `${Math.floor(d.fontSize)}px` : `${Math.floor(fontSizeRatio * this.fontSize)}px`;
    const fontFamily = d.fontFamily || 'serif';
    ctx.font = `${fontSize} ${fontFamily}`;
    cvs.width = ctx.measureText(d.text).width;
    cvs.height = this.lineHeight;
    ctx.font = `${fontSize} ${fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = d.color || '#ffffff';
    ctx.fillText(d.text, 0, 0);
    return cvs;
  }
  start () {
    this.render();
  }
  pause () {
    caf.call(window, this.timer);
  }
  draw (d) {
    this.context.drawImage(d.piece, d.offset.x, d.offset.y, d.piece.width, d.piece.height);
  }
  resize () {
    this.width = this.layer.width = this.pDom.offsetWidth;
    this.height = this.layer.height = this.pDom.offsetHeight;
    this.render();
    this.pause();
  }
  /**
   * 逐条读取弹幕池中的弹幕数据并根据弹幕样式展示
   * @param {Array} pool
   */
  render () {
    this.clear();
    this.thread.pool.forEach((item, i) => {
      this.draw(item);
      if(item.mode === 'flow') {
        item.offset.x -= item.speed;
        item.offset.x < -item.piece.width && this.thread.remove(i);
      }else{
        const time = new Date();
        const index = item.row;
        item.startTime = item.startTime || new Date();
        if(time - item.startTime > 5000) {
          this.thread.remove(i);
          this.thread.vRows[index].shift();
        }
      }

    });
    this.timer = raf.call(window, () => {this.render();});
  }

  /**
   * 清除画布
   */
  clear () {
    this.context.clearRect(0, 0, this.layer.width, this.layer.height);
  }
}

export default Canvas;
