
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
      innerRadius: 180,         // 交叉口内圆半径（px @ 600×600）
      // outerRadius: 250,         // 路段外端距中心距离（px，用于标注定位）
      // shaftLen: 70,             // 保留备用；实际箭杆/布局长度由 entryBoxW + entryBoxSep 决定
      laneOffset: 54,           // 进/出口车道中心线相对于路段中心线的侧向偏移（px）
      // shaftWidth: 11,           // 箭杆宽度（px）
      arrowHeadLen: 24,         // 箭头三角长度（px）；与 entryBoxW 共同决定箭杆形态
      arrowHeadWidth: 25,       // 箭头三角宽度（px）
      curveWidth: 5,            // 流量曲线线宽（px，所有线统一使用此值）
      curveAlpha: 0.82,         // 曲线透明度（无单位，不参与缩放）
      cpFactor: 0.50,           // 贝塞尔控制点距离因子（相对于弦长，无单位，不参与缩放）
      colors: ['#e74c3c', '#e67e22', '#27ae60', '#8e44ad',"lightpink"],
      labelFont: '14px Arial, sans-serif',  // 非流量框标注用（固定大小）
      labelFontSize: 14,        // 流量框内文字基准字号（基准px，随画布缩放）
      dirLabelFont: 'bold 14px Arial, sans-serif',
      labelColor: '#333',
      dirLabelColor: '#dceaff',
      showFlowLabels: false,
      showDirLabels: true,
      dirLabelOffset: -80,      // 方向标签距内圆的偏移量（px），正值=向内（靠近中心），负值=向外
      // flowLabelDist: 16,        // 流量标注距内圆的内侧偏移量（px）
      totalFlowLabelDist: 220,  // 总流量标注距圆心的距离（px）；null = 自动取箭杆中点
      entryBoxW: 55,            // 流量框沿道路方向宽度（基准px）；同时决定出口箭头总长
      entryBoxH: 22,            // 流量框垂直道路方向高度（基准px）
      entryBoxSep: 0,           // 各路流量框与总流量框之间的间隔（基准px）
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
    // 清空容器，防止多次实例化导致画布堆叠
    if (this.el) this.el.innerHTML = '';

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

  #color(i) {
    const c = this.opts.colors;
    return c[i % c.length];
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

    /* 入口流量框堆叠参数（与 #drawEntryFlowBoxes 保持一致） */
    const BOX_H   = this.#px(o.entryBoxH);   // 单个分项框垂直方向高度（perpendicular）
    const BOX_W   = this.#px(o.entryBoxW);   // 单个分项框沿道路方向宽度
    const BOX_GAP = this.#px(2);              // 分项框间距（垂直堆叠方向）
    const lo      = this.#px(o.laneOffset);

    /* 统一布局：各路流量框内边缘 = 内圆 ir，曲线出入口均在 ir 处，无间隙 */

    /* ── 收集所有转向曲线，entryOff 直接取对应流量框中心位置 ── */
    const curves = [];
    sorted.forEach((cross, i) => {
      const exits = [];
      for (let k = 1; k < n; k++) exits.push(sorted[(i + k) % n]);
      const color = this.#color(i);

      /* 与 #drawEntryFlowBoxes 相同的堆叠公式 */
      const nb        = cross.trunkList.length;
      const stackH    = nb * BOX_H + (nb - 1) * BOX_GAP;
      const startPerp = -lo - stackH / 2 + BOX_H / 2;

      cross.trunkList.forEach((trunk, ti) => {
        const ei = this.#exitIdx(trunk.dir, exits.length);
        if (ei >= 0 && ei < exits.length) {
          curves.push({
            fromAngle : cross.angle,
            toAngle   : exits[ei].angle,
            flow      : trunk.flow,
            color,
            lw        : this.#flowLW(trunk.flow),
            entryOff  : startPerp + (nb - 1 - ti) * (BOX_H + BOX_GAP),  // 与第 ti 个流量框中心对齐（L→S→R 从左到右）
            // entryDist 不传 → #drawCurve 默认从 ir 出发（与各路流量框内边缘重合）
          });
        }
      });
    });

    /* 顺时针角差：from → to，结果 [0, 360) */
    const cwDiff = (from, to) => ((to - from) % 360 + 360) % 360;

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

    /* 按出口角度统计总流量（供出口流量框使用） */
    const exitFlowMap = {};
    curves.forEach(c => {
      exitFlowMap[c.toAngle] = (exitFlowMap[c.toAngle] ?? 0) + c.flow;
    });

    /* 2. 再绘制路段箭头（置于曲线上方） */
    sorted.forEach((cross, i) => {
      const angle = cross.angle;
      const total = cross.trunkList.reduce((s, t) => s + t.flow, 0);
      this.#drawRoad(
        angle,
        this.#color(i),
        total,
        i + 1,          // 方向编号按角度顺时针顺序，第1个=方向1，第2个=方向2，依此类推
        exitTotalWs[angle]  || this.#px(o.shaftWidth),
        cross.trunkList,
        exitFlowMap[angle]  ?? 0,
      );
    });

    /* 3. 流量标注（可选）：按入口分组，按文字宽度排版 */
    if (o.showFlowLabels) {
      const labelDist = this.#px(o.innerRadius) - this.#px(o.flowLabelDist);
      const labelH    = 18;
      const labelPad  = 6;
      const entryGroups = {};
      curves.forEach((c, idx) => { (entryGroups[c.fromAngle] ??= []).push(idx); });

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

  /* exitW     ：出口箭杆宽（= 该路出口所有曲线线宽之和）
     trunkList ：各转向流量列表，用于绘制入口流量标注框
     exitFlow  ：该路出口总流量，用于出口总流量框 */
  #drawRoad(angle, color, totalFlow, dirIndex, exitW, trunkList, exitFlow) {
    const o   = this.opts;
    const ir  = this.#px(o.innerRadius), lo = this.#px(o.laneOffset);
    const boxW = this.#px(o.entryBoxW);
    const boxH = this.#px(o.entryBoxH);
    const sep  = this.#px(o.entryBoxSep ?? 3);

    /*
     * 统一布局（从内圆 ir 向外，进出口完全对齐）：
     *
     *   ir ──[boxW]──► ir+boxW  ──[sep]──► ir+boxW+sep ──[boxW]──► ir+2·boxW+sep
     *    │ 进口：各路流量框  │            │  进/出口总流量框（同距离，左右两侧）  │
     *    │ 出口：箭头（杆+头）│
     *
     *  outerDist = ir + 2·boxW + sep
     */
    const outerDist  = ir + 2 * boxW + sep;
    const arrowEnd   = ir + boxW;          // 出口箭头尖端 = 各路流量框外边缘

    /* 出口车道：箭头总长 = entryBoxW（杆+头均在 [ir, arrowEnd] 内），perpOff = +lo */
    this.#filledArrow(angle, lo, ir, arrowEnd, color, exitW);

    /* 入口车道：各路流量框 + 总流量框 */
    this.#drawEntryFlowBoxes(angle, trunkList, color, outerDist, lo);

    /* 出口总流量框：与进口总流量框同距离（outerDist - boxW/2），位于出口侧 +lo */
    if (exitFlow > 0) {
      const totPt = this.#pt(angle, outerDist - boxW / 2, lo);
      this.#drawRotatedBox(totPt, angle, boxW, boxH, String(exitFlow), color);
    }

    if (o.showDirLabels) {
      const lp = this.#pt(angle, ir - this.#px(o.dirLabelOffset), 0);
      this.#textLabel(lp, '方向' + dirIndex, o.dirLabelFont, o.dirLabelColor);
    }
  }

  /**
   * 在路段入口绘制流量标注框，全部布局在箭杆范围内（ir ~ outerDist）：
   *
   * 沿路方向（dist 轴）布局（从内到外）：
   *   [内圆 ir] → [各分项框] → [总流量框] → 路段外端(outerDist)
   *
   * 垂直方向：各分项框以 -lo 为中心堆叠；总流量框与堆叠等高居中于 -lo
   */
  #drawEntryFlowBoxes(angle, trunkList, color, outerDist, lo) {
    const n = trunkList ? trunkList.length : 0;
    if (!n) return;

    const o    = this.opts;
    const boxH = this.#px(o.entryBoxH);         // 框垂直方向高度（perpendicular）
    const boxW = this.#px(o.entryBoxW);         // 框沿道路方向宽度（进出口统一）
    const gap  = this.#px(2);                   // 分项框垂直堆叠间距
    const sep  = this.#px(o.entryBoxSep ?? 3);  // 各路流量框与总流量框之间的间隔

    const totalFlow = trunkList.reduce((s, t) => s + t.flow, 0);
    const stackH    = n * boxH + (n - 1) * gap;  // 分项框堆叠总高度

    /* 总流量框：外边缘紧贴 outerDist，尺寸与分项框一致，居中于 -lo */
    const totDist   = outerDist - boxW / 2;
    const totPt     = this.#pt(angle, totDist, -lo);
    this.#drawRotatedBox(totPt, angle, boxW, boxH, String(totalFlow), color);

    /* 分项框：位于总流量框内侧，沿垂直方向以 -lo 为中心堆叠 */
    const indDist   = outerDist - boxW - sep - boxW / 2;
    const startPerp = -lo - stackH / 2 + boxH / 2;

    /* 按 angle 方向从左到右：L(dir=3)→S(dir=2)→R(dir=1)，索引倒序分配 perpOff */
    trunkList.forEach((trunk, idx) => {
      const perpOff = startPerp + (n - 1 - idx) * (boxH + gap);
      const pt = this.#pt(angle, indDist, perpOff);
      this.#drawRotatedBox(pt, angle, boxW, boxH, String(trunk.flow), color);
    });
  }

  /**
   * 绘制与路段方向对齐的矩形标注框，文字随框一起旋转
   *   roadW：沿道路方向的宽度（local-x）；perpH：垂直道路方向的高度（local-y）
   *   旋转角 = (angle - 90)°，使 local-x 轴对齐道路向外方向
   *
   *   文字方向处理：
   *     sin(angle) >= 0 时，local-x 指向 canvas 右侧，文字自然从左到右 ✓
   *     sin(angle) <  0 时，local-x 指向 canvas 左侧，文字会倒写；
   *     额外旋转 180° 使文字重新从左到右展示。
   */
  #drawRotatedBox(pt, angle, roadW, perpH, text, color) {
    const ctx = this.ctx, o = this.opts;
    const rotAngle = (angle - 90) * Math.PI / 180;
    /* 文字方向判断：cos(rotAngle) = sin(angle)
     *   sin(angle) ≥ 0 时，文字从左到右展示（≈ 0 的 0° 方向除外，保留上读方向）
     *   sin(angle) < 0（含 180° 的浮点近似 ≈ 0）且 angle > 0 时翻转 180° 保持可读  */
    const textFlip = Math.sin(angle * Math.PI / 180) < 1e-10 && angle > 0.1 ? Math.PI : 0;

    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(rotAngle);

    ctx.fillStyle   = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.rect(-roadW / 2, -perpH / 2, roadW, perpH);
    ctx.fill();
    ctx.stroke();

    /* 文字随框旋转，按需额外翻转 180° 确保从左到右展示 */
    if (textFlip !== 0) ctx.rotate(textFlip);
    const fontSize = Math.round(this.#px(o.labelFontSize ?? 14));
    ctx.fillStyle    = o.labelColor;
    ctx.font         = `${fontSize}px Arial, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);

    ctx.restore();
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
  /* fromDist：曲线入口距中心的距离（默认 innerRadius，可传入框内边缘距离消除间隙） */
  #drawCurve(fromAngle, toAngle, flow, color, fromPerpOff, toPerpOff, fromDist) {
    const o   = this.opts, ctx = this.ctx;
    const ir  = this.#px(o.innerRadius);

    const start = this.#pt(fromAngle, fromDist ?? ir, fromPerpOff);
    const end   = this.#pt(toAngle,   ir,             toPerpOff);

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