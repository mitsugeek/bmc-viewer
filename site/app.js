const companies = Array.isArray(window.BMC_COMPANIES) ? window.BMC_COMPANIES : [];
const businesses = Array.isArray(window.BMC_BUSINESSES) ? window.BMC_BUSINESSES : [];
const assetVersion = "business-quality-v1";

const bmcOrder = [
  "顧客セグメント",
  "価値提案",
  "チャネル",
  "顧客関係",
  "収益の流れ",
  "主要リソース",
  "主要活動",
  "主要パートナー",
  "コスト構造",
];

const state = {
  selectedCode: companies[0]?.code ?? "",
  search: "",
  industry: "",
  sort: "priority",
};

const elements = {
  metrics: document.querySelector("#metrics"),
  search: document.querySelector("#search"),
  industry: document.querySelector("#industry"),
  sort: document.querySelector("#sort"),
  resultCount: document.querySelector("#result-count"),
  companyList: document.querySelector("#company-list"),
  detail: document.querySelector("#detail"),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function weightNumber(company) {
  return Number.parseFloat(String(company.index_weight).replace("%", "")) || 0;
}

function fileHref(path, cacheBust = false) {
  const href = `../${path}`;
  return cacheBust ? `${href}?v=${assetVersion}` : href;
}

function sourceLabel(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("jpx.co.jp")) return "JPX";
    if (parsed.hostname.includes("edinet")) return "EDINET API";
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function brandStyle(company) {
  const primary = company.brand?.primary ?? "#0f766e";
  const secondary = company.brand?.secondary ?? "#334155";
  return `--company-primary:${escapeHtml(primary)};--company-secondary:${escapeHtml(secondary)};`;
}

function statusLabel(status) {
  const labels = {
    candidate: "候補",
    scoping: "範囲確認",
    template_only: "テンプレート初期案",
    needs_research: "要深掘り",
    drafting: "作成中",
    source_review: "根拠確認中",
    ready_for_image: "画像化可",
    done: "完了",
  };
  return labels[status] ?? status;
}

function statusClass(status) {
  if (status === "template_only" || status === "needs_research") return "warn";
  if (status === "source_review" || status === "drafting") return "neutral";
  if (status === "done" || status === "ready_for_image") return "ok";
  return "";
}

function renderMetrics() {
  const industryCount = new Set(companies.map((company) => company.industry)).size;
  const imagesReady = companies.filter((company) => company.image_path).length;
  const markdownReady = companies.filter((company) => company.bmc_md_path).length;
  const templateOnly = businesses.filter((business) => business.status === "template_only").length;
  const sourceReview = businesses.filter((business) => business.status === "source_review").length;
  elements.metrics.innerHTML = [
    ["対象企業", `${companies.length}社`],
    ["業種", `${industryCount}分類`],
    ["事業候補", `${businesses.length}件`],
    ["テンプレ案", `${templateOnly}件`],
    ["根拠確認", `${sourceReview}件`],
    ["Markdown", `${markdownReady}/${companies.length}`],
    ["画像", `${imagesReady}/${companies.length}`],
  ]
    .map(
      ([label, value]) => `
        <div class="metric">
          <span class="metric-label">${label}</span>
          <span class="metric-value">${value}</span>
        </div>
      `,
    )
    .join("");
}

function renderIndustryOptions() {
  const industries = [...new Set(companies.map((company) => company.industry))].sort((a, b) =>
    a.localeCompare(b, "ja"),
  );
  elements.industry.innerHTML =
    '<option value="">すべて</option>' +
    industries
      .map((industry) => `<option value="${escapeHtml(industry)}">${escapeHtml(industry)}</option>`)
      .join("");
}

function filteredCompanies() {
  const query = state.search.trim().toLowerCase();
  const result = companies.filter((company) => {
    const matchesIndustry = !state.industry || company.industry === state.industry;
    const haystack = [
      company.company_name,
      company.code,
      company.industry,
      company.summary,
      ...(company.segments ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return matchesIndustry && (!query || haystack.includes(query));
  });

  return result.sort((a, b) => {
    if (state.sort === "weight") return weightNumber(b) - weightNumber(a);
    if (state.sort === "industry") {
      const byIndustry = a.industry.localeCompare(b.industry, "ja");
      return byIndustry || a.priority - b.priority;
    }
    return a.priority - b.priority;
  });
}

function renderList() {
  const list = filteredCompanies();
  elements.resultCount.textContent = `${list.length}社を表示`;

  if (!list.some((company) => company.code === state.selectedCode) && list.length > 0) {
    state.selectedCode = list[0].code;
  }

  elements.companyList.innerHTML = list
    .map(
      (company) => `
        <button class="company-button" type="button" data-code="${escapeHtml(company.code)}" style="${brandStyle(
          company,
        )}" aria-selected="${company.code === state.selectedCode}">
          <span class="company-row">
            <span class="company-name">${escapeHtml(company.priority)}. ${escapeHtml(company.company_name)}</span>
            <span class="company-code">${escapeHtml(company.code)}</span>
          </span>
          <span class="company-meta">
            <span class="pill">${escapeHtml(company.industry)}</span>
            <span class="pill">${escapeHtml(company.index_weight)}</span>
            <span class="pill warn">要レビュー</span>
          </span>
        </button>
      `,
    )
    .join("");

  elements.companyList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCode = button.dataset.code;
      render();
    });
  });
}

function renderDetail() {
  const company = companies.find((item) => item.code === state.selectedCode);
  if (!company) {
    elements.detail.innerHTML = '<div class="empty-state">該当する企業がありません。</div>';
    return;
  }

  const sourceLinks = (company.source_urls ?? [])
    .map(
      (url) => `
        <li><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(sourceLabel(url))}: ${escapeHtml(
          url,
        )}</a></li>
      `,
    )
    .join("");

  const segments = (company.segments ?? [])
    .map((segment) => `<li class="pill">${escapeHtml(segment)}</li>`)
    .join("");

  const bmcBlocks = bmcOrder
    .map((block) => {
      const items = company.bmc?.[block] ?? [];
      return `
        <article class="bmc-block">
          <h3>${escapeHtml(block)}</h3>
          <ul>
            ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>
      `;
    })
    .join("");

  const businessLinks = businesses
    .filter((business) => business.company_code === company.code)
    .sort((a, b) => Number(a.business_priority) - Number(b.business_priority))
    .map((business) => {
      const groupSize = Number(business.same_template_group_size || 1);
      const groupLabel =
        groupSize > 1 ? `<span class="pill neutral">同一原型 ${escapeHtml(groupSize)}件</span>` : "";
      return `
        <li class="business-link-item">
          <a class="business-thumb-link" href="${escapeHtml(fileHref(business.image_path, true))}" target="_blank">
            <img class="business-thumb" loading="lazy" src="${escapeHtml(
              fileHref(business.image_path, true),
            )}" alt="${escapeHtml(company.company_name)} / ${escapeHtml(business.business_name)} BMC画像">
          </a>
          <div class="business-link-body">
            <a class="business-title-link" href="${escapeHtml(fileHref(business.business_bmc_md_path))}">${escapeHtml(
              business.business_priority,
            )}. ${escapeHtml(business.business_name)}</a>
            <p>${escapeHtml(business.split_reason)}</p>
            <p class="quality-note">${escapeHtml(
              business.research_next_step || "公式資料で事業固有のBMCへ更新する",
            )}</p>
            <div class="business-link-actions">
              <a class="mini-link" href="${escapeHtml(fileHref(business.business_bmc_md_path))}">MD</a>
              <a class="mini-link" href="${escapeHtml(fileHref(business.image_path, true))}" target="_blank">PNG</a>
              ${groupLabel}
              <span class="pill ${statusClass(business.status)}">${escapeHtml(statusLabel(business.status))}</span>
            </div>
          </div>
        </li>
      `;
    })
    .join("");
  const templateOnlyCount = businesses.filter((business) => business.status === "template_only").length;
  const sourceReviewCount = businesses.filter((business) => business.status === "source_review").length;

  elements.detail.innerHTML = `
    <div class="detail-grid">
      <section class="hero-panel" style="${brandStyle(company)}">
        <div class="detail-title-row">
          <div>
            <h2 class="detail-title">${escapeHtml(company.company_name)} (${escapeHtml(company.code)})</h2>
            <div class="company-meta">
              <span class="pill">${escapeHtml(company.industry)}</span>
              <span class="pill">優先 ${escapeHtml(company.priority)}</span>
              <span class="pill">TOPIX ${escapeHtml(company.index_weight)}</span>
            </div>
          </div>
          <span class="status-chip">${escapeHtml(company.status)}</span>
        </div>
        <a class="image-frame" href="${escapeHtml(fileHref(company.image_path, true))}" target="_blank">
          <img class="bmc-image" src="${escapeHtml(fileHref(company.image_path, true))}" alt="${escapeHtml(
            company.company_name,
          )} BMC画像">
        </a>
        <div class="quick-links">
          <a class="button" href="${escapeHtml(fileHref(company.bmc_md_path))}">Markdown正本</a>
          <a class="button" href="${escapeHtml(fileHref(company.prompt_path))}">Imageプロンプト</a>
          <a class="button" href="${escapeHtml(fileHref(company.image_path, true))}" target="_blank">PNGを開く</a>
          <a class="button" href="${escapeHtml(company.official_ir_url)}" target="_blank" rel="noreferrer">公式IR</a>
        </div>
      </section>

      <section class="content-panel">
        <h2 class="section-title">企業概要</h2>
        <p class="summary-text">${escapeHtml(company.summary)}</p>
        <p class="design-note">デザイン方向: ${escapeHtml(
          company.design_theme?.concept ?? "企業の事業特性を表す控えめな構造モチーフ",
        )}</p>
        <h2 class="section-title">事業セグメント</h2>
        <ul class="segment-list">${segments}</ul>
        <h2 class="section-title">Business Model Canvas</h2>
        <div class="bmc-grid">${bmcBlocks}</div>
      </section>

      <section class="content-panel">
        <div class="section-title-row">
          <h2 class="section-title">事業別BMC候補</h2>
          <a class="button" href="../data/business_bmc_backlog.csv">事業別台帳</a>
        </div>
        <div class="quality-notice">
          <strong>事業別BMC候補は段階管理中です。</strong>
          <span>テンプレート初期案 ${escapeHtml(templateOnlyCount)}件 / 公式資料ベースで根拠確認中 ${escapeHtml(
            sourceReviewCount,
          )}件。同じ原型のテンプレート候補ではキャンバス本文が重複します。</span>
        </div>
        <ul class="business-link-list">
          ${businessLinks || '<li class="business-link-empty">候補はまだありません。</li>'}
        </ul>
      </section>

      <section class="content-panel">
        <h2 class="section-title">根拠URL</h2>
        <ul class="source-list">${sourceLinks}</ul>
      </section>
    </div>
  `;
}

function render() {
  renderList();
  renderDetail();
}

function bindEvents() {
  elements.search.addEventListener("input", (event) => {
    state.search = event.target.value;
    render();
  });
  elements.industry.addEventListener("change", (event) => {
    state.industry = event.target.value;
    render();
  });
  elements.sort.addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });
}

renderMetrics();
renderIndustryOptions();
bindEvents();
render();
