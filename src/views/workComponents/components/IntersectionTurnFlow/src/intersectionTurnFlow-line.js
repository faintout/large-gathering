
/**
 * IntersectionTurnFlow - 路口转向流量图（Canvas）
 *
 * 角度约定（罗盘角，顺时针）：0=北(上), 90=东(右), 180=南(下), 270=西(左)
 * dir: 1=左转, 2=直行, 3=右转
 *
 * @param {HTMLElement|string} container  容器元素或 CSS 选择器
 * @param {Array}  data     路口数据，见下方格式说明
 * @param {Object} [options] 可选配置
 *
 * data 格式:
 * [
 *   { crossId: 1, angle: 0, trunkList: [
 *       { dir: 1, flow: 120 },  // 左转
 *       { dir: 2, flow: 200 },  // 直行
 *       { dir: 3, flow: 80  },  // 右转
 *   ]},
 *   ...
 * ]
 */
class IntersectionTurnFlow {

  /* ─────────────────────────── 私有字段 ─────────────────────────── */

  #maxFlow = 1;

  /* ─────────────────────────── 默认配置 ─────────────────────────── */

  /**
   * 默认基准半径（px）：对应默认画布 600×600 时 Math.min(600,600)/2 = 300
   * 所有距离类参数均以此为基准填写像素值，实际渲染时由 #px() 等比缩放。
   */
  static get BASE_RADIUS() { return 300; }

  static get DEFAULTS() {
    return {
      width: 600,
      height: 600,
      // ── 以下距离类参数均为基准像素值（以 600×600 画布 / 基准半径 300 为参考） ──
      innerRadius: 200,         // 交叉口内圆半径（px @ 600×600）
      outerRadius: 250,         // 路段外端距中心距离（px，用于标注定位）
      shaftLen: 90,             // 箭杆/入口矩形绘制长度（px），从 innerRadius 向外延伸
      laneOffset: 54,           // 进/出口车道中心线相对于路段中心线的侧向偏移（px）
      shaftWidth: 11,           // 箭杆宽度（px）
      arrowHeadLen: 40,         // 箭头长度（px）
      arrowHeadWidth: 30,       // 箭头宽度（px）
      curveWidth: 5,            // 流量曲线线宽（px，所有线统一使用此值）
      curveAlpha: 0.82,         // 曲线透明度（无单位，不参与缩放）
      cpFactor: 0.50,           // 贝塞尔控制点距离因子（相对于弦长，无单位，不参与缩放）
      colors: ['#e74c3c', '#e67e22', '#27ae60', '#8e44ad',"lightpink"],
      labelFont: '14px Arial, sans-serif',
      dirLabelFont: 'bold 14px Arial, sans-serif',
      labelColor: '#333',
      dirLabelColor: '#dceaff',
      showFlowLabels: true,
      showDirLabels: true,
      dirLabelOffset: -50,      // 方向标签距内圆的偏移量（px），正值=向内（靠近中心），负值=向外
      flowLabelDist: 16,        // 流量标注距内圆的内侧偏移量（px）
      totalFlowLabelDist: 220,  // 总流量标注距圆心的距离（px）；null = 自动取箭杆中点
    };
  }

  /* ─────────────────────────── 构造函数 ─────────────────────────── */

  constructor(container, data, options) {
    this.el   = typeof container === 'string' ? document.querySelector(container) : container;
    this.data = data || [];
    this.opts = Object.assign({}, IntersectionTurnFlow.DEFAULTS, options || {});
    this.#setup();
    this.render();
  }

  /* ─────────────────────────── 初始化 Canvas ─────────────────────────── */

  #setup() {
    const dpr    = window.devicePixelRatio || 1;
    const o      = this.opts;
    // 以容器 DOM 的实际尺寸为准，未设置时回退到 options 默认值
    o.width  = this.el.clientWidth  || o.width;
    o.height = this.el.clientHeight || o.height;
    // 基准半径：所有距离比例值以此为基准换算为像素
    this.refRadius = Math.min(o.width, o.height) / 2;
    const canvas = document.createElement('canvas');
    canvas.width        = Math.round(o.width  * dpr);
    canvas.height       = Math.round(o.height * dpr);
    canvas.style.width  = o.width  + 'px';
    canvas.style.height = o.height + 'px';
    this.el.appendChild(canvas);
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);
    this.cx = o.width  / 2;
    this.cy = o.height / 2;
  }

  /* ─────────────────────────── 像素缩放 ─────────────────────────── */

  /**
   * 将基准像素值等比缩放到当前实际画布尺寸
   * scale = actualRefRadius / BASE_RADIUS
   * 当画布为默认 600×600 时 scale=1，值保持不变。
   */
  #px(baseValue) {
    return baseValue * (this.refRadius / IntersectionTurnFlow.BASE_RADIUS);
  }

  /* ─────────────────────────── 坐标计算 ─────────────────────────── */

  /**
   * 罗盘角度 + 距离 + 侧偏 → 画布坐标
   * 侧偏正值 = 沿"向外看"方向的右侧
   */
  #pt(angle, dist, perpOff = 0) {
    const r = angle * Math.PI / 180;
    return {
      x: this.cx + Math.sin(r) * dist + Math.cos(r) * perpOff,
      y: this.cy - Math.cos(r) * dist + Math.sin(r) * perpOff,
    };
  }

  /** 罗盘角度 → 向外单位向量 */
  #outDir(angle) {
    const r = angle * Math.PI / 180;
    return { x: Math.sin(r), y: -Math.cos(r) };
  }

  /* ─────────────────────────── 辅助 ─────────────────────────── */

  #color(index) {
    const c = this.opts.colors;
    return c[index % c.length];
  }

  #flowLW(_flow) {
    return this.#px(this.opts.curveWidth);
  }

  /**
   * 出口索引（顺时针排列的其他路口）
   *   dir=1 左转 → 第一个顺时针出口 (exits[0])
   *   dir=2 直行 → 中间出口
   *   dir=3 右转 → 最后一个顺时针出口 (exits[n-1])
   */
  #exitIdx(dir, exitCount) {
    if (dir === 1) return 0;
    if (dir === 2) return Math.floor(exitCount / 2);
    if (dir === 3) return exitCount - 1;
    return 0;
  }

  /* ─────────────────────────── 主渲染 ─────────────────────────── */

  render() {
    const ctx = this.ctx, o = this.opts;
    ctx.clearRect(0, 0, o.width, o.height);

    const sorted = this.data.slice().sort((a, b) => a.angle - b.angle);
    const n = sorted.length;
    if (!n) return;

    /* 计算最大转向流量，用于曲线线宽比例 */
    this.#maxFlow = 1;
    sorted.forEach(cross => {
      cross.trunkList.forEach(t => {
        if (t.flow > this.#maxFlow) this.#maxFlow = t.flow;
      });
    });

    /* ── 收集所有转向曲线 ── */
    const curves = [];
    sorted.forEach((cross, i) => {
      const exits = [];
      for (let k = 1; k < n; k++) exits.push(sorted[(i + k) % n]);
      const color = this.#color(i);

      cross.trunkList.forEach(trunk => {
        const ei = this.#exitIdx(trunk.dir, exits.length);
        if (ei >= 0 && ei < exits.length) {
          curves.push({
            fromAngle : cross.angle,
            toAngle   : exits[ei].angle,
            flow      : trunk.flow,
            color,
            lw        : this.#flowLW(trunk.flow),
          });
        }
      });
    });

    /* 顺时针角差：from → to，结果 [0, 360) */
    const cwDiff = (from, to) => ((to - from) % 360 + 360) % 360;

    /* ── 按入口角度分组，排序后计算侧偏（以 -laneOffset 为中心居中堆叠，不交叉） ──
         排序规则：顺时针角差【降序】→ 右转排最左（最小 perpOff），左转排最右（最大 perpOff）
         这样从同一入口出发的曲线，在几何上天然不会相互交叉。               */
    const entryGroups  = {};
    const entryTotalWs = {};   /* angle → 该入口所有曲线线宽之和，用于箭杆宽 */
    curves.forEach((c, idx) => {
      (entryGroups[c.fromAngle] ??= []).push(idx);
    });
    Object.keys(entryGroups).forEach(k => {
      const indices   = entryGroups[k];
      const fromAngle = +k;
      /* 降序：角差大（右转）排前 → 分配最小 perpOff */
      indices.sort((a, b) => cwDiff(fromAngle, curves[b].toAngle) - cwDiff(fromAngle, curves[a].toAngle));
      const totalW = indices.reduce((s, idx) => s + curves[idx].lw, 0);
      entryTotalWs[fromAngle] = totalW;
      let cursor = -this.#px(o.laneOffset) - totalW / 2;
      indices.forEach(idx => {
        const lw = curves[idx].lw;
        curves[idx].entryOff = cursor + lw / 2;
        cursor += lw;
      });
    });

    /* ── 按出口角度分组，排序后计算侧偏（以 +laneOffset 为中心居中堆叠，不交叉） ──
         排序规则：顺时针角差【升序】→ 角差小（来自近处）排最左（最小 perpOff）           */
    const exitGroups  = {};
    const exitTotalWs = {};    /* angle → 该出口所有曲线线宽之和，用于箭杆宽 */
    curves.forEach((c, idx) => {
      (exitGroups[c.toAngle] ??= []).push(idx);
    });
    Object.keys(exitGroups).forEach(k => {
      const indices = exitGroups[k];
      const toAngle = +k;
      /* 升序：角差小排前 → 分配最小 perpOff */
      indices.sort((a, b) => cwDiff(curves[a].fromAngle, toAngle) - cwDiff(curves[b].fromAngle, toAngle));
      const totalW = indices.reduce((s, idx) => s + curves[idx].lw, 0);
      exitTotalWs[toAngle] = totalW;
      let cursor = this.#px(o.laneOffset) - totalW / 2;
      indices.forEach(idx => {
        const lw = curves[idx].lw;
        curves[idx].exitOff = cursor + lw / 2;
        cursor += lw;
      });
    });

    /* 1. 先绘制转向曲线（置于路段箭头下方） */
    curves.forEach(c => this.#drawCurve(c.fromAngle, c.toAngle, c.flow, c.color, c.entryOff, c.exitOff));

    /* 2. 再绘制路段箭头（置于曲线上方） */
    sorted.forEach((cross, i) => {
      const angle = cross.angle;
      const total = cross.trunkList.reduce((s, t) => s + t.flow, 0);
      this.#drawRoad(
        angle,
        this.#color(i),
        total,
        i + 1,          // 方向编号按顺时针顺序，第1个=方向1，第2个=方向2，依此类推
        entryTotalWs[angle] || this.#px(o.shaftWidth),
        exitTotalWs[angle]  || this.#px(o.shaftWidth),
      );
    });

    /* 3. 流量标注：按入口分组，按文字实际宽度排版成一行，居中对齐入口车道 */
    if (o.showFlowLabels) {
      const labelDist = this.#px(o.innerRadius) - this.#px(o.flowLabelDist);
      const labelH    = 18;
      const labelPad  = 6;   /* 文字左右内边距 */

      Object.keys(entryGroups).forEach(k => {
        const indices   = entryGroups[k];
        const fromAngle = +k;

        /* 第一遍：量出每个标注的宽度 */
        ctx.font = o.labelFont;
        const items = indices
          .map(idx => {
            const c  = curves[idx];
            const tw = ctx.measureText(String(c.flow)).width + labelPad * 2;
            return { c, txt: String(c.flow), tw };
          })
          .filter(it => it.c.flow > 0);

        if (!items.length) return;

        /* 第二遍：按文字宽度排版，整体以 -laneOffset 为中心 */
        const totalW = items.reduce((s, it) => s + it.tw, 0);
        let cursor   = -this.#px(o.laneOffset) - totalW / 2;

        items.forEach(it => {
          const perpOff = cursor + it.tw / 2;
          const pt      = this.#pt(fromAngle, labelDist, perpOff);
          ctx.save();
          ctx.font          = o.labelFont;
          ctx.textAlign     = 'center';
          ctx.textBaseline  = 'middle';
          ctx.fillStyle     = 'rgba(255,255,255,0.85)';
          ctx.fillRect(pt.x - it.tw / 2, pt.y - labelH / 2, it.tw, labelH);
          ctx.fillStyle = o.labelColor;
          ctx.fillText(it.txt, pt.x, pt.y);
          ctx.restore();
          cursor += it.tw;
        });
      });
    }
  }

  /* ─────────────────────────── 路段箭头 ─────────────────────────── */

  /* entryW：入口箭杆宽（= 该路入口所有曲线线宽之和）
     exitW ：出口箭杆宽（= 该路出口所有曲线线宽之和）  */
  #drawRoad(angle, color, totalFlow, crossId, entryW, exitW) {
    const o  = this.opts;
    const ir = this.#px(o.innerRadius), lo = this.#px(o.laneOffset);
    /* 箭杆外端：从内圆向外延伸 shaftLen；若未配置则回退到 outerRadius */
    const outerDist = ir + (o.shaftLen != null ? this.#px(o.shaftLen) : (this.#px(o.outerRadius) - ir));

    /* 出口车道：向外方向右侧，箭头尖朝外，箭杆宽 = 出口线段总宽 */
    this.#filledArrow(angle,  lo, ir, outerDist, color, exitW);
    /* 入口车道：向外方向左侧，纯矩形箭杆（无箭头），箭杆宽 = 入口线段总宽 */
    this.#filledShaft(angle, -lo, outerDist, ir, color, entryW);

    if (o.showFlowLabels && totalFlow > 0) {
      /* totalFlowLabelDist 有值时使用配置距离，否则取箭杆中点 */
      const mid      = (o.totalFlowLabelDist != null) ? this.#px(o.totalFlowLabelDist) : (ir + outerDist) / 2;
      const exitGap  = exitW  / 2 + 10;
      const entryGap = entryW / 2 + 10;
      this.#textLabel(this.#pt(angle, mid,  lo + exitGap),  String(totalFlow), o.labelFont, o.labelColor);
      this.#textLabel(this.#pt(angle, mid, -lo - entryGap), String(totalFlow), o.labelFont, o.labelColor);
    }

    if (o.showDirLabels) {
      const lp = this.#pt(angle, ir - this.#px(o.dirLabelOffset), 0);
      this.#textLabel(lp, '方向' + crossId, o.dirLabelFont, o.dirLabelColor);
    }
  }

  /** 绘制纯文本标注（居中） */
  #textLabel(pt, text, font, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font         = font;
    ctx.fillStyle    = color;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, pt.x, pt.y);
    ctx.restore();
  }

  /**
   * 绘制实心箭头多边形
   *   startDist → endDist：箭头尖在 endDist 处
   *   perpOff：侧向偏移（正=右，负=左）
   *   shaftW：箭杆宽度（可选，默认 opts.shaftWidth）
   */
  #filledArrow(angle, perpOff, startDist, endDist, color, shaftW) {
    const o   = this.opts, ctx = this.ctx;
    const sw  = (shaftW != null) ? shaftW : this.#px(o.shaftWidth);
    const hl  = this.#px(o.arrowHeadLen);
    /* 箭头宽至少比箭杆宽出固定留白，保证箭头形状可见 */
    const hw  = Math.max(this.#px(o.arrowHeadWidth), sw + 6);
    const sign     = endDist > startDist ? 1 : -1;
    const neckDist = endDist - sign * hl;

    const pts = [
      this.#pt(angle, startDist, perpOff - sw / 2),
      this.#pt(angle, startDist, perpOff + sw / 2),
      this.#pt(angle, neckDist,  perpOff + sw / 2),
      this.#pt(angle, neckDist,  perpOff + hw / 2),
      this.#pt(angle, endDist,   perpOff),
      this.#pt(angle, neckDist,  perpOff - hw / 2),
      this.#pt(angle, neckDist,  perpOff - sw / 2),
    ];

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  /**
   * 绘制纯矩形箭杆（无箭头），用于入口车道
   *   perpOff：侧向偏移（正=右，负=左）
   *   shaftW ：箭杆宽度（可选，默认 opts.shaftWidth）
   */
  #filledShaft(angle, perpOff, startDist, endDist, color, shaftW) {
    const o   = this.opts, ctx = this.ctx;
    const sw  = (shaftW != null) ? shaftW : this.#px(o.shaftWidth);

    const pts = [
      this.#pt(angle, startDist, perpOff - sw / 2),
      this.#pt(angle, startDist, perpOff + sw / 2),
      this.#pt(angle, endDist,   perpOff + sw / 2),
      this.#pt(angle, endDist,   perpOff - sw / 2),
    ];

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  /* ─────────────────────────── 转向流量曲线 ─────────────────────────── */

  /**
   * 绘制从 fromAngle 入口到 toAngle 出口的贝塞尔转向曲线
   *   fromPerpOff：入口处侧偏（由堆叠算法计算，以 -laneOffset 为中心）
   *   toPerpOff  ：出口处侧偏（由堆叠算法计算，以 +laneOffset 为中心）
   *   控制点：沿路段切线方向向中心缩进（基于弦长比例）
   */
  #drawCurve(fromAngle, toAngle, flow, color, fromPerpOff, toPerpOff) {
    const o   = this.opts, ctx = this.ctx;
    const ir  = this.#px(o.innerRadius);

    const start = this.#pt(fromAngle, ir, fromPerpOff);
    const end   = this.#pt(toAngle,   ir, toPerpOff);

    const dx    = end.x - start.x, dy = end.y - start.y;
    const chord = Math.sqrt(dx * dx + dy * dy);
    const cpd   = chord * o.cpFactor;

    const d1  = this.#outDir(fromAngle);
    const d2  = this.#outDir(toAngle);
    const cp1 = { x: start.x - d1.x * cpd, y: start.y - d1.y * cpd };
    const cp2 = { x: end.x   - d2.x * cpd, y: end.y   - d2.y * cpd };

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    ctx.strokeStyle  = color;
    ctx.lineWidth    = this.#flowLW(flow);
    ctx.lineCap      = 'round';
    ctx.globalAlpha  = o.curveAlpha;
    ctx.stroke();
    ctx.restore();
  }

  /* ─────────────────────────── 销毁 ─────────────────────────── */

  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

/* ─────────────────────────── 导出 ─────────────────────────── */

// if (typeof define === 'function' && define.amd) {
//   define(() => IntersectionTurnFlow);
// } else if (typeof module !== 'undefined' && module.exports) {
//   module.exports = IntersectionTurnFlow;
// } else {
//   (typeof window !== 'undefined' ? window : this).IntersectionTurnFlow = IntersectionTurnFlow;
// }

export default IntersectionTurnFlow;