class Thread {
	constructor (pDom, config) {
		this.pool = [];
		this.pDom = pDom;
		this.config = config;
		this.resize();
	}
	resize () {
		this.rows = Math.floor(parseInt(this.pDom.offsetHeight) / this.config.lineHeight);
		this.vRows = Object.assign(new Array(this.rows), this.vRows);
	}
/**
 * 从弹幕池内，根据 index 来取对应一条弹幕数据
 * @param {Number} i
 */
	get (i) {
		return this.pool[i];
	}
/**
 * 向弹幕池内存一条弹幕的具体数据
 * @param {Object} d
 */
	push (d) {
		this.pool.push(d);
	}
/**
 * 从弹幕池内删除一条弹幕
 * @param {Number} i
 */
	remove (i) {
		this.pool.splice(i, 1);
	}

	/**
	 * 清空弹幕池
	 */
	empty () {
		this.pool = [];
		this.vRows = new Array(this.rows);
	}

}
export default Thread;
