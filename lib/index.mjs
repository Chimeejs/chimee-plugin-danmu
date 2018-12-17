
/**
 * chimee-plugin-danmu v0.1.1
 * (c) 2017 yandeqiang
 * Released under ISC
 */

function __$styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

import { addEvent, caf, deepAssign, isObject, raf, removeEvent, setStyle } from 'chimee-helper';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _Object$assign from 'babel-runtime/core-js/object/assign';
import _Object$getOwnPropertyDescriptor from 'babel-runtime/core-js/object/get-own-property-descriptor';
import { autobind } from 'toxic-decorators';

var Canvas = function () {
  function Canvas(parent, config) {
    _classCallCheck(this, Canvas);

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


  _createClass(Canvas, [{
    key: 'create',
    value: function create(pDom) {
      var canvas = document.createElement('canvas');
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

  }, {
    key: 'destroy',
    value: function destroy() {
      caf.call(window, this.timer);
      this.layer.parentNode.removeChild(this.layer);
    }
    /**
     * 为一条数据创建一个 canvas
     * @param {Object} d
     */

  }, {
    key: 'createPiece',
    value: function createPiece(d) {
      var cvs = document.createElement('canvas');
      var ctx = cvs.getContext('2d');
      var fontSizeRatio = d.fontSize === 'small' ? 0.6 : 1;
      var fontSize = typeof d.fontSize === 'number' ? Math.floor(d.fontSize) + 'px' : Math.floor(fontSizeRatio * this.fontSize) + 'px';
      var fontFamily = d.fontFamily || 'serif';
      ctx.font = fontSize + ' ' + fontFamily;
      cvs.width = ctx.measureText(d.text).width;
      cvs.height = this.lineHeight;
      ctx.font = fontSize + ' ' + fontFamily;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = d.color || '#ffffff';
      ctx.fillText(d.text, 0, 0);
      return cvs;
    }
  }, {
    key: 'start',
    value: function start() {
      this.render();
    }
  }, {
    key: 'pause',
    value: function pause() {
      caf.call(window, this.timer);
    }
  }, {
    key: 'draw',
    value: function draw(d) {
      this.context.drawImage(d.piece, d.offset.x, d.offset.y, d.piece.width, d.piece.height);
    }
  }, {
    key: 'resize',
    value: function resize() {
      this.width = this.layer.width = this.pDom.offsetWidth;
      this.height = this.layer.height = this.pDom.offsetHeight;
      this.render();
      this.pause();
    }
    /**
     * 逐条读取弹幕池中的弹幕数据并根据弹幕样式展示
     * @param {Array} pool
     */

  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      this.clear();
      this.thread.pool.forEach(function (item, i) {
        _this.draw(item);
        if (item.mode === 'flow') {
          item.offset.x -= item.speed;
          item.offset.x < -item.piece.width && _this.thread.remove(i);
        } else {
          var time = new Date();
          var index = item.row;
          item.startTime = item.startTime || new Date();
          if (time - item.startTime > 5000) {
            _this.thread.remove(i);
            _this.thread.vRows[index].shift();
          }
        }
      });
      this.timer = raf.call(window, function () {
        _this.render();
      });
    }

    /**
     * 清除画布
     */

  }, {
    key: 'clear',
    value: function clear() {
      this.context.clearRect(0, 0, this.layer.width, this.layer.height);
    }
  }]);

  return Canvas;
}();

var Thread = function () {
	function Thread(pDom, config) {
		_classCallCheck(this, Thread);

		this.pool = [];
		this.pDom = pDom;
		this.config = config;
		this.resize();
	}

	_createClass(Thread, [{
		key: "resize",
		value: function resize() {
			this.rows = Math.floor(parseInt(this.pDom.offsetHeight) / this.config.lineHeight);
			this.vRows = _Object$assign(new Array(this.rows), this.vRows);
		}
		/**
   * 从弹幕池内，根据 index 来取对应一条弹幕数据
   * @param {Number} i
   */

	}, {
		key: "get",
		value: function get(i) {
			return this.pool[i];
		}
		/**
   * 向弹幕池内存一条弹幕的具体数据
   * @param {Object} d
   */

	}, {
		key: "push",
		value: function push(d) {
			this.pool.push(d);
		}
		/**
   * 从弹幕池内删除一条弹幕
   * @param {Number} i
   */

	}, {
		key: "remove",
		value: function remove(i) {
			this.pool.splice(i, 1);
		}

		/**
   * 清空弹幕池
   */

	}, {
		key: "empty",
		value: function empty() {
			this.pool = [];
			this.vRows = new Array(this.rows);
		}
	}]);

	return Thread;
}();

var _class;

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var Css = (_class = function () {
  function Css(parent, config) {
    _classCallCheck(this, Css);

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


  _createClass(Css, [{
    key: 'create',
    value: function create(pDom) {
      var dom = document.createElement('div');
      dom.className = 'chimee-danmu-content';
      pDom.appendChild(dom);
      this.layer = dom;
      this.width = pDom.offsetWidth;
      this.height = pDom.offsetHeight;
    }

    /**
     * 销毁 dom 及其事件
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      caf.call(window, this.timer);
      this.layer.parentNode.removeChild(this.layer);
    }

    /**
     * 为一条数据创建一个 piece
     * @param {Object} d data 一条弹幕相关信息, 创建的时候就把其塞到容器里
     */

  }, {
    key: 'createPiece',
    value: function createPiece(d) {
      var fontSizeRatio = d.fontSize === 'small' ? 0.6 : 1;
      var fontSize = typeof d.fontSize === 'number' ? Math.floor(d.fontSize) + 'px' : Math.floor(fontSizeRatio * this.fontSize) + 'px';
      var fontFamily = d.fontFamily || 'serif';
      var color = d.color || '#ffffff';
      var piece = document.createElement('div');
      piece.className = 'danmu-piece';
      setStyle(piece, {
        color: color,
        fontSize: fontSize,
        fontFamily: fontFamily,
        transform: 'translateX(-9999px)'
      });
      piece.textContent = d.text;
      this.layer.appendChild(piece);
      piece.width = piece.offsetWidth;
      piece.height = this.lineHeight;
      return piece;
    }
  }, {
    key: 'start',
    value: function start() {
      this.render();
    }
  }, {
    key: 'pause',
    value: function pause() {
      caf.call(window, this.timer);
    }
  }, {
    key: 'resize',
    value: function resize() {
      this.width = this.pDom.offsetWidth;
      this.height = this.pDom.offsetHeight;
    }

    /**
     * 逐条读取弹幕池中的弹幕数据并根据弹幕样式展示
     * @param {Array} pool
     */

  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      this.thread.pool.forEach(function (item, i) {
        setStyle(item.piece, 'transform', 'translateX(' + item.offset.x + 'px) translateY(' + item.offset.y + 'px) ');
        if (item.mode === 'flow') {
          item.offset.x -= item.speed;
          if (item.offset.x < -item.piece.width) {
            item.piece.parentNode.removeChild(item.piece);
            _this.thread.remove(i);
          }
        } else {
          var time = new Date();
          var index = item.row;
          item.startTime = item.startTime || new Date();
          if (time - item.startTime > 5000) {
            item.piece.parentNode.removeChild(item.piece);
            _this.thread.remove(i);
            _this.thread.vRows[index].shift();
          }
        }
      });
      this.timer = raf.call(window, this.render);
    }

    /**
     * 清除画布
     */

  }, {
    key: 'clear',
    value: function clear() {
      this.layer.innerHTML = '';
    }
  }]);

  return Css;
}(), _applyDecoratedDescriptor(_class.prototype, 'render', [autobind], _Object$getOwnPropertyDescriptor(_class.prototype, 'render'), _class.prototype), _class);

// import Browser from 'helper/browser.js';
var pieceId = 0;

var Danma = function () {
  /**
   * @constructor
   * @param {Object} plugin 当前这个 plugin
   * @param {Object} config 当前 plugin 配置
   */
  function Danma(plugin, config) {
    _classCallCheck(this, Danma);

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


  _createClass(Danma, [{
    key: 'start',
    value: function start() {
      this.paper.start();
    }

    /**
     * 弹幕暂停
     */

  }, {
    key: 'pause',
    value: function pause() {
      this.paper.pause();
    }

    /**
     * 清屏操作, 切换渲染模式时
     * 1. 清空 thread 中的数据
     * 2. 清空当前画布上的所有内容
     */

  }, {
    key: 'clear',
    value: function clear() {
      this.thread.empty();
      this.paper && this.paper.clear();
    }

    /**
     * destroy 销毁操作， 切换模式， 或者用户手动销毁时
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.paper.destroy();
    }

    /**
     * 屏幕大小发生变化
     */

  }, {
    key: 'resize',
    value: function resize() {
      this.paper.resize();
      this.thread.resize();
    }
    /**
     * 切换 渲染模式
     * @param {String} mode 
     */

  }, {
    key: 'changeMode',
    value: function changeMode(mode) {
      if (!mode || mode === this.mode) return;
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

  }, {
    key: '_line',
    value: function _line(piece) {
      var data = this.thread.pool;
      var len = data.length;
      var rows = new Array(this.thread.rows);
      var row = 0;

      for (var i = len - 1; i >= 0; i--) {
        if (data[i].mode === 'flow') {
          var r = data[i].row;
          rows[r] = rows[r] ? rows[r] : data[i];
        }
      }
      var maxX = 0;
      for (var j = 0; j < rows.length; j++) {

        if (!rows[j]) {
          row = j;
          break;
        }

        var left = rows[j].offset.x + rows[j].piece.width;

        if (piece.width < this.paper.width - left) {
          row = j;
          break;
        }

        if (!maxX || left < maxX) {
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

  }, {
    key: '_vLine',
    value: function _vLine(data) {
      var rows = this.thread.vRows;
      var len = rows.length;
      var row = 0;
      // 固定模式下的弹幕其实是有两种状态
      // 1是全部数组的length 都相同的时候
      // 2是某个数组，比其他数组大一的情况

      // 判断是否全部相同
      var plain = rows.every(function (item, i) {
        return Array.isArray(rows[0]) && item.length === rows[0].length;
      });
      if (plain) {
        row = data.mode === 'top' ? 0 : len - 1;
      } else {
        row = this._cLine(rows, data);
      }
      rows[row] = rows[row] ? rows[row].concat(data) : [data];
      return row;
    }
  }, {
    key: '_cLine',
    value: function _cLine(r, d) {
      var row = 0;
      var len = r.length;
      var shortRow = [];
      for (var i = 0; i < len; i++) {
        var p = i === 0 ? len - 1 : i - 1;
        var n = i === len - 1 ? 0 : i + 1;
        var pLen = Array.isArray(r[p]) ? r[p].length : 0;
        var nLen = Array.isArray(r[n]) ? r[n].length : 0;
        var iLen = Array.isArray(r[i]) ? r[i].length : 0;

        if (!iLen || iLen < pLen || iLen < nLen) {
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

  }, {
    key: 'emit',
    value: function emit(data) {
      if (this.status === 'close') return;
      var danma = {};
      if (typeof data === 'string') {
        danma.text = data;
      } else {
        danma = data;
      }
      var defaultData = {
        text: '你真的很漂亮',
        mode: 'flow',
        fontSize: 'big',
        color: '#fff'
      };

      data = deepAssign(defaultData, danma);
      data.mode = data.mode || 'flow';
      var piece = this.paper.createPiece(data);
      var row = data.mode === 'flow' ? this._line(piece) : this._vLine(data);
      pieceId++;
      this.thread.pool.push({
        id: pieceId,
        piece: piece,
        text: data.text,
        mode: data.mode,
        speed: typeof data.speed === 'number' && data.speed > 0 || Math.pow(piece.width, 1 / 3) * 0.3,
        row: row,
        offset: {
          x: data.mode === 'flow' ? this.paper.width : (this.paper.width - piece.width) / 2,
          y: this.lineHeight * row
        }
      });
    }
  }, {
    key: 'getPieceByPoint',
    value: function getPieceByPoint(x, y) {
      var pieces = [];
      this.thread.pool.map(function (item) {
        var startPoint = [item.offset.x, item.offset.y];
        var endPoint = [item.offset.x + item.piece.width, item.offset.y + item.piece.width];
        x >= startPoint[0] && x <= endPoint[0] && y >= startPoint[1] && y <= endPoint[1] && pieces.push(item);
      });
      return pieces;
    }

    // forbid (id) {

    // }

  }]);

  return Danma;
}();

__$styleInject("chimee-danmu{position:absolute;top:0;left:0;display:block;width:100%;height:100%}chimee-danmu .chimee-danmu-content{position:relative;width:100%;height:100%;user-select:none;overflow:hidden}chimee-danmu .danmu-piece{position:absolute;left:0;top:0;display:inline-block;white-space:pre;pointer-events:none;font-weight:400;line-height:1.125;opacity:1;text-shadow:#000 1px 0 1px,#000 0 1px 1px,#000 0 -1px 1px,#000 -1px 0 1px}", {});

/**
 * 插件默认配置
 */
var defaultConfig = {
  lineHeight: 30,
  fontSize: 24,
  mode: 'css',
  updateByVideo: true
};

var chimeeDanmu = {
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
  level: 2,
  create: function create() {},
  init: function init(videoConfig) {
    if (videoConfig && videoConfig.danmu === false) return;
  },
  inited: function inited() {
    var config = isObject(this.$config) ? deepAssign(defaultConfig, this.$config) : defaultConfig;
    this.danmu = new Danma(this, config);
    addEvent(window, 'resize', this._resize);
    this.updateByVideo = config.updateByVideo;

    !this.updateByVideo && this.danmu.start();
  },
  destroy: function destroy() {
    this.danmu.destroy();
    this.$dom.parentNode.removeChild(this.$dom);
    removeEvent(window, 'resize', this._resize);
  },

  events: {
    play: function play() {
      if (!this.updateByVideo) return;
      this.status === 'open' && this.danmu.start();
    },
    pause: function pause() {
      if (!this.updateByVideo) return;
      this.status === 'open' && this.danmu.pause();
    },
    timeupdate: function timeupdate() {
      if (this.status === 'close') return;
      // 这里可以留一个限制，限制一秒内数据的展示量
      if (Math.abs(this.currentTime - this.currentPiece.time) > 1 || this.currentPiece.time === undefined) {
        this._searchPosition();
      }
      while (this.currentTime >= this.currentPiece.time && this.currentPiece.time) {
        this.danmu.emit(this.currentPiece);
        this.currentPiece = this.danmuList[this.currentPostion++] || {};
      }
    },
    contextmenu: function contextmenu(e) {
      e.preventDefault();
      var p = this.danmu.getPieceByPoint(e.offsetX, e.offsetY);
      this.$emit('danmuContextmenu', p);
    }
  },
  methods: {
    _searchPosition: function _searchPosition() {
      var len = this.danmuList.length;
      if (len === 0) return;
      if (this.currentTime > this.danmuList[len - 1].time) {
        this.currentPiece = {};
        this.currentPostion = len + 1;
        return;
      }
      if (this.currentTime < this.danmuList[0].time) {
        this.currentPiece = this.danmuList[0];
        this.currentPostion = 0;
        return;
      }
      for (var i = 0; i < len; i++) {
        var item = this.danmuList[i];
        if (item.time >= this.currentTime) {
          this.currentPostion = i;
          this.currentPiece = item;
          break;
        }
      }
    },
    open: function open() {
      this.status = 'open';
      this.danmu.start();
    },
    close: function close() {
      this.status = 'close';
      this.danmu.clear();
      this.danmu.pause();
    },
    start: function start() {
      this.danmu.start();
    },
    pause: function pause() {
      this.danmu.pause();
    },
    changeMode: function changeMode(mode) {
      this.danmu.changeMode(mode);
    },
    sendMsg: function sendMsg(msg) {
      this.status === 'open' && this.danmu.emit(msg);
    },
    receiveData: function receiveData(data) {
      this.danmuList = data;
      this.currentPiece = this.danmuList[this.currentPostion++] || {};
    },
    _resize: function _resize() {
      this.danmu.resize();
    }
  }
};

export default chimeeDanmu;
