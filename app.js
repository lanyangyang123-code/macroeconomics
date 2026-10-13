/* 宏观经济学自学课程 · 交互脚本（无外部依赖，可离线使用） */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var num = function (id, d) {
    var el = $(id);
    if (!el) return d;
    var v = parseFloat(el.value);
    return isFinite(v) ? v : d;
  };
  var fmt = function (v, d) {
    if (!isFinite(v)) return '—';
    if (Math.abs(v) >= 1000) return v.toLocaleString('zh-CN', { maximumFractionDigits: d === undefined ? 2 : d });
    return v.toFixed(d === undefined ? 2 : d);
  };
  var pct = function (v) { return isFinite(v) ? (v * 100).toFixed(1) + '%' : '—'; };

  /* ---------- ① 乘数与均衡收入 ---------- */
  function calcMultiplier() {
    var out = $('c-out');
    if (!out) return;
    var beta = Math.min(Math.max(num('c-beta', 0.8), 0), 0.999);
    var alpha = num('c-alpha', 0), inv = num('c-inv', 0), g = num('c-g', 0);
    var t = num('c-t', 0), tr = num('c-tr', 0);
    var gam = Math.min(Math.max(num('c-gamma', 0), 0), 0.95);
    var k = 1 / (1 - beta);
    var kt = -beta / (1 - beta);
    var ktr = beta / (1 - beta);
    var kf = 1 / (1 - beta + gam);
    var y3 = (alpha + inv + g - beta * t) / (1 - beta);
    var delta = (alpha + inv + g + beta * tr - beta * t);
    out.innerHTML =
      '三部门均衡收入 y = (α+i+g−βt)/(1−β) = <span class="v">' + fmt(y3) + '</span><br>' +
      '投资乘数 k = 1/(1−β) = <span class="v">' + fmt(k) + '</span>　' +
      '政府购买乘数 k_g = <span class="v">' + fmt(k) + '</span><br>' +
      '税收乘数 k_t = −β/(1−β) = <span class="v">' + fmt(kt) + '</span>　' +
      '转移支付乘数 k_tr = <span class="v">' + fmt(ktr) + '</span><br>' +
      '平衡预算乘数 k_b = <span class="v">1.00</span>　' +
      '对外贸易乘数 = 1/(1−β+γ) = <span class="v">' + fmt(kf) + '</span><br>' +
      '（含转移支付的支出合计 α+i+g−βt+βt<sub>r</sub> = ' + fmt(delta) + '，除以 (1−β) 即均衡收入）';
  }

  /* ---------- ② IS-LM 均衡 ---------- */
  function calcISLM() {
    var out = $('is-out');
    if (!out) return;
    var beta = Math.min(Math.max(num('is-beta', 0.75), 0), 0.999);
    var alpha = num('is-alpha', 100), e = num('is-e', 200), d = num('is-d', 30);
    var g = num('is-g', 300), t = num('is-t', 200);
    var k = num('is-k', 0.5), h = num('is-h', 30), M = num('is-m', 1200), P = num('is-p', 1);
    if (h === 0) h = 0.0001;
    var m = M / P;
    var A = alpha + e + g - beta * t;
    var y = (A + d * m / h) / (1 - beta + d * k / h);
    var r = (k * y - m) / h;
    var trapped = r < 0;
    if (trapped) r = 0;
    var i = e - d * r;
    var c = alpha + beta * (y - t);
    var s = y - t - c;
    var yZero = (alpha + e + g - beta * t) / (1 - beta);
    out.innerHTML =
      'IS 方程：y = (α+e+g−βt−dr)/(1−β)　　LM 方程：r = (ky−m)/h<br>' +
      '实际货币供给 m = M/P = <span class="v">' + fmt(m) + '</span><br>' +
      '均衡收入 y* = <span class="v">' + fmt(y) + '</span>　均衡利率 r* = <span class="v">' + fmt(r, 2) + '</span><br>' +
      '均衡时 投资 i = e−dr = <span class="v">' + fmt(i) + '</span>，消费 c = ' + fmt(c) + '，储蓄 s = ' + fmt(s) + '（i ≈ s ✓）<br>' +
      '对比：若利率为 0，投资就等于自主投资 e = ' + fmt(e) + '，收入 y₀ = (α+e+g−βt)/(1−β) = <span class="v">' + fmt(yZero) + '</span>；' +
      '当前利率 r* 使投资减少 ' + fmt(e - i) + '，收入因此减少 ' + fmt(yZero - y) + '。这就是"利率↑→投资↓→收入↓"的传导；若扩张性财政政策使 IS 右移并推高利率，就表现为<b>挤出效应</b>。' +
      (trapped ? '<br><b>提示：</b>当前参数下货币市场要求的利率为负，已按 0 处理——相当于流动性陷阱，利率不能继续下降，此时增加货币供给对产出无效。' : '');
  }

  /* ---------- ③ 名义/实际 GDP 与平减指数 ---------- */
  function calcGDP() {
    var out = $('g-out');
    if (!out) return;
    var a1p = num('g-a1p', 0), a1q = num('g-a1q', 0), b1p = num('g-b1p', 0), b1q = num('g-b1q', 0);
    var a2p = num('g-a2p', 0), a2q = num('g-a2q', 0), b2p = num('g-b2p', 0), b2q = num('g-b2q', 0);
    var n1 = a1p * a1q + b1p * b1q;
    var n2 = a2p * a2q + b2p * b2q;
    var r2 = a1p * a2q + b1p * b2q;
    var def1 = 100, def2 = r2 ? n2 / r2 * 100 : NaN;
    var infl = def2 / def1 - 1;
    var growthNom = n1 ? n2 / n1 - 1 : NaN;
    var growthReal = n1 ? r2 / n1 - 1 : NaN;
    out.innerHTML =
      '第 2 年名义 GDP = <span class="v">' + fmt(n2) + '</span>（增长 ' + pct(growthNom) + '）<br>' +
      '第 2 年实际 GDP（第 1 年价格）= <span class="v">' + fmt(r2) + '</span>（增长 ' + pct(growthReal) + '）<br>' +
      '第 2 年平减指数 = 名义÷实际×100 = <span class="v">' + fmt(def2) + '</span><br>' +
      '用平减指数算的通货膨胀率 = <span class="v">' + pct(infl) + '</span>';
  }

  /* ---------- ④ CPI 与通胀校正 ---------- */
  function calcCPI() {
    var out = $('p-out');
    if (out) {
      var qa = num('p-qa', 0), qb = num('p-qb', 0);
      var a1 = num('p-a1', 0), b1 = num('p-b1', 0), a2 = num('p-a2', 0), b2 = num('p-b2', 0);
      var c1 = qa * a1 + qb * b1, c2 = qa * a2 + qb * b2;
      var cpi2 = c1 ? c2 / c1 * 100 : NaN;
      out.innerHTML =
        '第 1 年篮子费用 = <span class="v">' + fmt(c1) + '</span>（基年 CPI = 100）<br>' +
        '第 2 年篮子费用 = <span class="v">' + fmt(c2) + '</span>　→　CPI₂ = <span class="v">' + fmt(cpi2) + '</span><br>' +
        '通货膨胀率 = <span class="v">' + pct(cpi2 / 100 - 1) + '</span>';
    }
    var out2 = $('p-out2');
    if (out2) {
      var amt = num('p-amt', 0), cpiA = num('p-cpi1', 1), cpiB = num('p-cpi2', 1);
      var today = cpiA ? amt * (cpiB / cpiA) : NaN;
      out2.innerHTML = '按今天物价水平折算：<span class="v">' + fmt(today) + '</span>' +
        '　（即 T 年的 ' + fmt(amt) + ' 相当于今天的 ' + fmt(today) + '）';
    }
  }

  /* ---------- ⑤ 货币乘数 ---------- */
  function calcBank() {
    var out = $('b-out');
    if (!out) return;
    var R = Math.min(Math.max(num('b-r', 0.1), 0.01), 1);
    var dep = num('b-dep', 0);
    var fromCash = $('b-cash') ? $('b-cash').checked : true;
    var mult = 1 / R;
    var deposits = dep * mult;
    var net = fromCash ? deposits - dep : deposits;
    out.innerHTML =
      '货币乘数 = 1/R = <span class="v">' + fmt(mult) + '</span><br>' +
      '银行体系创造的存款总额 = ' + fmt(dep) + ' × ' + fmt(mult) + ' = <span class="v">' + fmt(deposits) + '</span><br>' +
      (fromCash
        ? '因为你手上的通货减少了 ' + fmt(dep) + '，货币供给最大增加量 = ' + fmt(deposits) + ' − ' + fmt(dep) + ' = <span class="v">' + fmt(net) + '</span>'
        : '若这笔钱是新增加的准备金（不减少公众持有的通货），货币供给增加 <span class="v">' + fmt(net) + '</span>') +
      '<br>若银行保留超额准备金、不发放贷款，则货币供给增加 <span class="v">0</span>（这是最小量）。';
  }

  /* ---------- ⑥ 费雪方程与税率 ---------- */
  function calcFisher() {
    var out = $('f-out');
    if (!out) return;
    var i = num('f-i', 0) / 100, pi = num('f-pi', 0) / 100, tax = num('f-tax', 0) / 100;
    var r = i - pi;
    var afterTaxNom = i * (1 - tax);
    var afterTaxReal = afterTaxNom - pi;
    out.innerHTML =
      '税前实际利率 r = i − π = <span class="v">' + pct(r) + '</span><br>' +
      '税后名义利率 = i×(1−税率) = <span class="v">' + pct(afterTaxNom) + '</span><br>' +
      '税后实际利率 = 税后名义利率 − π = <span class="v">' + pct(afterTaxReal) + '</span><br>' +
      '结论：通胀提高了名义利率（费雪效应），却没有提高实际利率，但由于按名义利息纳税，<b>税后实际利率被压低</b>——这就是通货膨胀造成的税收扭曲。';
  }

  function bindCalc(ids, fn) {
    ids.forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener('input', fn);
      el.addEventListener('change', fn);
    });
  }

  function initCalculators() {
    bindCalc(['c-beta', 'c-alpha', 'c-inv', 'c-g', 'c-t', 'c-tr', 'c-gamma'], calcMultiplier);
    bindCalc(['is-beta', 'is-alpha', 'is-e', 'is-d', 'is-g', 'is-t', 'is-k', 'is-h', 'is-m', 'is-p'], calcISLM);
    bindCalc(['g-a1p', 'g-a1q', 'g-b1p', 'g-b1q', 'g-a2p', 'g-a2q', 'g-b2p', 'g-b2q'], calcGDP);
    bindCalc(['p-qa', 'p-qb', 'p-a1', 'p-b1', 'p-a2', 'p-b2'], calcCPI);
    bindCalc(['p-amt', 'p-cpi1', 'p-cpi2'], calcCPI);
    bindCalc(['b-r', 'b-dep', 'b-cash'], calcBank);
    bindCalc(['f-i', 'f-pi', 'f-tax'], calcFisher);
    calcMultiplier(); calcISLM(); calcGDP(); calcCPI(); calcBank(); calcFisher();
  }

  /* ---------- 闪卡 ---------- */
  var CARDS = [
    ['GDP 的定义（六个限定词）', '经济社会（一国或一地区）在一定时期内运用生产要素所生产的全部最终产品（物品和劳务）的市场价值。口诀：市场价、只最终、看生产、是流量、按地域、要市场。'],
    ['最终产品与中间产品', '最终产品是在一定时期内生产的、由其最后使用者购买的产品和劳务；中间产品是用于再出售或供生产别种产品用的产品。GDP 只计最终产品，否则重复计算。'],
    ['增加值', '企业产出的价值减去该企业购买的中间产品的价值。GDP 也等于经济中所有企业增加值之和。'],
    ['三面等值', '产出（增加值）＝收入（要素报酬）＝支出（C+I+G+NX）。同一笔交易从生产、分配、使用三个角度看，数值必然相等。'],
    ['支出法的四个组成部分', 'Y = C + I + G + (X − M)。注意：住宅建设算投资、转移支付不算政府购买、买股票债券不算投资、进口要从支出中扣除。'],
    ['收入法的五项内容', '工资、利息和租金等要素报酬；非公司企业主收入；公司税前利润；企业转移支付及企业间接税；资本折旧。'],
    ['NDP / NI / PI / DPI 的链条', 'NDP = GDP − 折旧；NI = NDP − 间接税 − 企业转移支付 + 政府补助金；PI = NI − 公司未分配利润 − 公司所得税 − 社会保险税 + 政府转移支付；DPI = PI − 个人所得税 = 消费 + 储蓄。'],
    ['GDP 与 GNP 的区别', 'GDP 是地域概念（一国境内生产的最终产品市场价值）；GNP 是国民概念（一国国民拥有的全部生产要素所生产的最终产品市场价值）。GNP = GDP + 来自国外的要素净支付。'],
    ['名义 GDP、实际 GDP、平减指数', '名义 GDP 用当年价格计算；实际 GDP 用基年不变价格计算，只反映产量变化；GDP 平减指数 = 名义 GDP ÷ 实际 GDP × 100，是衡量总价格水平的指标之一。'],
    ['储蓄-投资恒等式', '两部门 I = S；三部门 I = S + (T − G)；四部门 I = S + (T − G) + (M − X + Kr)。公开经济中投资等于私人储蓄加公共储蓄。'],
    ['国民储蓄与公共储蓄', '私人储蓄 = Y − T − C；公共储蓄 = T − G；国民储蓄 = 私人储蓄 + 公共储蓄 = Y − C − G。封闭经济中等于投资。'],
    ['挤出效应', '政府预算赤字 → 国民储蓄与可贷资金供给减少 → 均衡利率上升 → 投资减少。政府借款挤占了私人投资，进而降低长期增长率。'],
    ['失业率与参工率', '失业率 = 失业者人数 ÷ 劳动力 × 100%；劳动力参工率 = 劳动力 ÷ 成年人口 × 100%。劳动力 = 就业者 + 失业者。'],
    ['丧失信心的工人', '想工作但已放弃寻找工作的人，属于"非劳动力"而不是"失业者"。他们放弃寻找会使失业率下降，但劳动力市场实际在恶化。'],
    ['失业率局限（三点）', '①排除了丧失信心的工人；②不区分全职与兼职；③存在谎报，且不反映失业持续时间结构。'],
    ['CPI 的计算', 'CPI = 当年一篮子物品与劳务的费用 ÷ 基年同一篮子的费用 × 100；通货膨胀率 = (今年 CPI − 去年 CPI) ÷ 去年 CPI × 100%。'],
    ['CPI 的三个问题', '替代偏向、新产品的引进、无法衡量的质量变动。三者都使 CPI **高估**生活费用的上升（每年约 0.5%）。'],
    ['CPI 与 GDP 平减指数的三点差别', '①平减指数含全部国内生产的产品，CPI 只含消费者购买的；②平减指数只含国内产品，CPI 含进口消费品；③CPI 用固定权重（拉氏指数），平减指数用变动权重（帕氏指数）。'],
    ['通胀校正', '今天的美元数量 = T 年的美元数量 × (今天的物价水平 ÷ T 年的物价水平)。用于比较不同年份金额的实际购买力。'],
    ['货币的三种职能', '交换媒介、计价单位、价值储藏手段。'],
    ['商品货币与法定货币', '商品货币以有内在价值的商品充当（如黄金）；法定货币没有内在价值，靠政府法令作为通货使用（如美元）。'],
    ['M1 与 M2', 'M1 = 通货 + 活期存款 + 旅行支票 + 其他支票性存款；M2 = M1 + 储蓄存款 + 小额定期存款 + 货币市场共同基金余额等。'],
    ['货币乘数', '货币乘数 = 1/R（R 为准备金率）。部分准备金制度下银行发放贷款就是创造货币；货币乘数创造货币但不创造财富。'],
    ['美联储控制货币的三大工具', '公开市场操作（买卖政府债券，最常用）、法定准备金率、贴现率。美联储还充当"最后贷款人"。'],
    ['数量方程与货币流通速度', 'M × V = P × Y；V = PY ÷ M，表示一张钞票在给定时期内转手的次数（货币的收入流通速度）。它是恒等式。'],
    ['货币数量论', '在 V 不变、货币中性的假设下，货币量决定名义 GDP，进而价格水平与货币供给成比例：通货膨胀率 = 货币增长率 − 产出增长率。'],
    ['货币铸造税与通货膨胀税', '政府发行货币筹集的收入叫货币铸造税；它相当于对持有货币的人征收通货膨胀税，因为价格上升使他们手中货币的实际价值下降。'],
    ['费雪方程与费雪效应', 'i = r + π（更准确为 i = r + Eπ）。货币增长率的提高一对一地提高名义利率而不改变实际利率，这种关系称为费雪效应。'],
    ['事前与事后实际利率', '事前实际利率 = i − Eπ（签约时预期的）；事后实际利率 = i − π（实际实现的）。只有未预期到的通胀才会造成债权人与债务人之间任意的财富再分配。'],
    ['古典二分法与货币中性', '古典二分法是名义变量与真实变量在理论上的分离；货币中性指货币供给变动不影响真实变量。多数经济学家认为它只近似描述长期。'],
    ['通货膨胀的六种成本', '鞋底成本、菜单成本、相对价格变动与资源配置不当、税收扭曲、混乱与不方便、未预期通胀造成的任意财富再分配。'],
    ['凯恩斯定律', '当社会总需求变动时，只会引起产量和收入变动使供求相等，而不会引起价格变动。适用于短期分析，是收入-支出模型的基本假设。'],
    ['边际消费倾向与平均消费倾向', 'MPC = Δc/Δy（消费曲线的斜率），0 < MPC < 1 且递减；APC = c/y（曲线上点与原点连线的斜率）。同一收入水平上 APC > MPC。'],
    ['消费函数与储蓄函数的关系', 'c = α + βy；s = −α + (1 − β)y；二者互为补数，和恒等于收入：APC + APS = 1，MPC + MPS = 1。'],
    ['资本边际效率 MEC', '一种贴现率，正好使一项资本品在使用期内各期预期收益的现值之和等于它的供给价格（重置成本）。若 MEC > 市场利率则投资值得。'],
    ['MEC 与 MEI 的区别', '投资增加会抬高资本品价格，使实际实现的收益率缩小，这个缩小了的值就是投资边际效率 MEI。MEI < MEC，故 MEI 曲线更陡峭，也更精确地表示利率与投资量的关系。'],
    ['托宾的 q', 'q = 企业的股票市场价值 ÷ 新建造企业的成本。q > 1 会有新投资；q < 1 不会有新投资。'],
    ['两部门与三部门均衡收入', '两部门 y = (α + i)/(1 − β)；三部门 y = (α + i + g − βt)/(1 − β)，均衡条件 i + g = s + t。'],
    ['五种乘数', '投资乘数 = 政府购买乘数 = 1/(1 − β)；税收乘数 = −β/(1 − β)；转移支付乘数 = β/(1 − β)；平衡预算乘数 = 1；对外贸易乘数 = 1/(1 − β + γ)。'],
    ['乘数发挥作用的条件', '只有在资源没有得到充分利用时，总需求的增加才会产生乘数作用；若已充分就业，需求增加只会推高价格。'],
    ['IS 曲线的含义与方程', '产品市场均衡（i = s）时的利率—收入组合轨迹，向右下方倾斜。y = (α + e − dr)/(1 − β)，斜率由 (1 − β)/d 决定；d 越大 IS 越平缓。'],
    ['IS 曲线移动', '投资增加、政府购买增加、减税 → IS 右移；储蓄增加、增税 → IS 左移。移动幅度取决于支出增量与支出乘数的大小。'],
    ['货币需求的三个动机', '交易动机（与收入成正比）、谨慎（预防）动机（与收入成正比）、投机动机（与利率反方向变动）。L = ky − hr。'],
    ['流动性陷阱', '利率极低时人们认为利率不会再降、债券价格只会跌，于是不管有多少货币都愿意持有，流动性偏好趋于无限大。此时增加货币供给也不能降低利率——货币政策失效，财政政策有效。'],
    ['LM 曲线的方程与斜率', '货币市场均衡 m = L = ky − hr，即 r = (k/h)y − m/h，斜率 k/h。M 增加或 P 下降 → LM 右移；交易需求或投机需求增加 → LM 左移。'],
    ['LM 曲线的三个区域', '凯恩斯区域（h→∞，水平，货币政策无效、财政政策最有效）、中间区域（正斜率，两者都有效）、古典区域（h=0，垂直，财政政策无效、货币政策有效）。'],
    ['IS-LM 四区域的非均衡', 'Ⅰ：i<s，L<M；Ⅱ：i<s，L>M；Ⅲ：i>s，L>M；Ⅳ：i>s，L<M。调整规则：i>s 收入上升、i<s 收入下降；L>M 利率上升、L<M 利率下降。'],
    ['总需求曲线向右下方倾斜的原因', '利率效应（P↑ → 货币需求↑ → 利率↑ → 投资↓ → 收入↓）与实际余额效应（P↑ → 货币与固定价值资产实际价值↓ → 消费↓）；另有税负效应与进出口效应。'],
    ['宏观生产函数', 'y = f(N, K)，表示总量投入与总产出的关系。短期资本存量与技术不变，产出取决于就业量；受边际报酬递减规律影响，曲线越来越平缓。'],
    ['三种总供给曲线', '古典 AS：垂直（价格工资完全伸缩、产量处于充分就业水平，需求政策只推高价格）；凯恩斯 AS：水平（价格工资刚性，增加需求可增加产出）；常规 AS：向右上方倾斜（价格黏性，黏性价格模型）。'],
    ['短期总供给曲线移动的七个因素', '劳动供给增加、资本增加、自然资源增加、技术进步、预期价格水平下降、投入品价格下降、名义工资下降 → 全部使 AS 向右移动。'],
    ['需求冲击的短期与长期影响', '不利需求冲击：AD 左移 → 短期衰退（产出低于自然率）→ 工资物价下降、SRAS 右移 → 长期回到潜在产出但价格更低。结论：长期中需求变动只影响价格。'],
    ['滞胀', '不利的供给冲击（如石油涨价）使 SRAS 左移，产出下降与价格上升同时发生。政策两难：用扩张政策保产出就要接受更高通胀。'],
    ['三个模型的比较', '收入-支出模型只看产品市场（价格与利率不变、投资外生），只决定产出；IS-LM 加货币市场（价格不变、利率可变），决定产出与利率、引入挤出效应；AD-AS 加劳动市场（价格可变），决定产出与价格水平。']
  ];

  var fcIndex = -1;
  function showCard(i) {
    var q = $('fc-q'), a = $('fc-a'), c = $('fc-count');
    if (!q || !a) return;
    fcIndex = i;
    q.textContent = '【第 ' + (i + 1) + ' 张】' + CARDS[i][0];
    a.textContent = CARDS[i][1];
    a.hidden = true;
    if (c) c.textContent = '共 ' + CARDS.length + ' 张';
  }
  function initFlashcards() {
    var next = $('fc-next'), show = $('fc-show');
    if (!next) return;
    next.addEventListener('click', function () {
      var i = Math.floor(Math.random() * CARDS.length);
      if (CARDS.length > 1 && i === fcIndex) i = (i + 1) % CARDS.length;
      showCard(i);
    });
    if (show) show.addEventListener('click', function () {
      var a = $('fc-a');
      if (a && fcIndex >= 0) a.hidden = !a.hidden;
    });
    showCard(0);
    var a = $('fc-a');
    if (a) a.hidden = true;
  }

  /* ---------- 进度保存 ---------- */
  var STORE_KEY = 'macro-course-progress-v1';
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveProgress(obj) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) { /* 忽略 */ }
  }
  function initProgress() {
    var boxes = document.querySelectorAll('input[type="checkbox"][data-ck]');
    var state = loadProgress();
    var fill = $('progressFill'), text = $('progressText');
    function refresh() {
      var done = 0;
      boxes.forEach(function (b) { if (b.checked) done++; });
      if (fill) fill.style.width = boxes.length ? (done / boxes.length * 100) + '%' : '0%';
      if (text) text.textContent = done + ' / ' + boxes.length;
    }
    boxes.forEach(function (b) {
      b.checked = !!state[b.getAttribute('data-ck')];
      b.addEventListener('change', function () {
        state[b.getAttribute('data-ck')] = b.checked;
        saveProgress(state);
        refresh();
      });
    });
    refresh();
  }

  /* ---------- 侧栏高亮 ---------- */
  function initNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.sidebar a'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').replace('#', '');
      map[id] = a;
    });
    var targets = Object.keys(map).map(function (id) { return $(id); }).filter(Boolean);
    var current = null;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var link = map[e.target.id];
        if (!link) return;
        if (current) current.classList.remove('active');
        link.classList.add('active');
        current = link;
      });
    }, { rootMargin: '-70px 0px -70% 0px', threshold: 0 });
    targets.forEach(function (t) { obs.observe(t); });
  }

  /* ---------- 启动 ---------- */
  function init() {
    initCalculators();
    initFlashcards();
    initProgress();
    initNav();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
