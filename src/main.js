import {
  ELECTION_TYPE_LABELS,
  STATUS_LABELS,
  normalizeText,
} from "./member-schema.js";
import {
  buildFilterOptions,
  formatElectionType,
  getMemberLocationLabel,
  groupMembersByBlock,
  groupMembersByPrefecture,
  loadMember,
  loadMemberIndex,
  normalizeMember,
  sortMembersByBrowseOrder,
} from "./member-store.js";
import { registerPwaServiceWorker, setupInstallBanner, setupNetworkBanner } from "./pwa.js";

const SEARCH_PAGE_SIZE = 60;
const UI_STATE_STORAGE_KEY = "hiko-ui-state-v1";
const TAB_LABELS = {
  single: "小選挙区",
  proportional: "比例代表",
  search: "検索",
};

const elements = {
  heroCopy: document.querySelector("#hero-copy"),
  heroCurrentPhase: document.querySelector("#hero-current-phase"),
  heroTargetMembers: document.querySelector("#hero-target-members"),
  heroSingleMembers: document.querySelector("#hero-single-members"),
  heroProportionalMembers: document.querySelector("#hero-proportional-members"),
  tabButtons: Array.from(document.querySelectorAll("[data-tab]")),
  browseTitle: document.querySelector("#browse-title"),
  browseMeta: document.querySelector("#browse-meta"),
  browseToolbar: document.querySelector("#browse-toolbar"),
  browseSubnav: document.querySelector("#browse-subnav"),
  browseSummary: document.querySelector("#browse-summary"),
  memberGrid: document.querySelector("#member-grid"),
  loadMoreButton: document.querySelector("#load-more-button"),
  detailTitle: document.querySelector("#detail-title"),
  detailMeta: document.querySelector("#detail-meta"),
  flashcard: document.querySelector("#flashcard"),
  cardStatus: document.querySelector("#card-status"),
  prevButton: document.querySelector("#prev-button"),
  nextButton: document.querySelector("#next-button"),
  flipButton: document.querySelector("#flip-button"),
  installBanner: document.querySelector("#install-banner"),
  installCopy: document.querySelector("#install-copy"),
  installButton: document.querySelector("#install-button"),
  installDismissButton: document.querySelector("#install-dismiss-button"),
  networkBanner: document.querySelector("#network-banner"),
  networkCopy: document.querySelector("#network-copy"),
};

const state = {
  members: [],
  selectedTab: "single",
  selectedId: null,
  selectedSummary: null,
  selectedMember: null,
  isMemberLoading: false,
  side: "front",
  searchVisibleLimit: SEARCH_PAGE_SIZE,
  searchDebounceId: null,
  cache: new Map(),
  filters: {
    single: {
      prefecture: "",
      district: "all",
    },
    proportional: {
      block: "",
    },
    search: {
      query: "",
      party: "all",
      prefecture: "all",
      electionType: "all",
    },
  },
  directory: {
    prefectures: [],
    blocks: [],
    parties: [],
  },
};

bindEvents();
await initialize();

async function initialize() {
  try {
    const index = await loadMemberIndex();
    state.members = sortMembersByBrowseOrder(index.members ?? []);

    const singleGroups = groupMembersByPrefecture(state.members);
    const blockGroups = groupMembersByBlock(state.members);

    state.directory.prefectures = Array.from(singleGroups.keys()).filter(Boolean);
    state.directory.blocks = Array.from(blockGroups.keys()).filter(Boolean);
    state.directory.parties = buildFilterOptions(state.members, "party");
    state.filters.single.prefecture = state.directory.prefectures[0] ?? "";
    state.filters.proportional.block = state.directory.blocks[0] ?? "";
    hydrateUiStateFromStorage();

    renderHero(index);
    setupInstallBanner({
      banner: elements.installBanner,
      copy: elements.installCopy,
      installButton: elements.installButton,
      dismissButton: elements.installDismissButton,
    });
    setupNetworkBanner({
      banner: elements.networkBanner,
      copy: elements.networkCopy,
    });
    void registerPwaServiceWorker();

    await syncVisibleSelection();
  } catch (error) {
    renderLoadError(error);
  }
}

function bindEvents() {
  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const nextTab = button.dataset.tab;
      if (!nextTab || nextTab === state.selectedTab) {
        return;
      }

      state.selectedTab = nextTab;
      state.searchVisibleLimit = SEARCH_PAGE_SIZE;
      persistUiState();
      await syncVisibleSelection();
    });
  });

  elements.prevButton.addEventListener("click", () => {
    moveSelection(-1);
  });

  elements.nextButton.addEventListener("click", () => {
    moveSelection(1);
  });

  elements.flipButton.addEventListener("click", () => {
    toggleCard();
  });

  elements.flashcard.addEventListener("click", () => {
    if (state.selectedMember) {
      toggleCard();
    }
  });

  elements.browseToolbar.addEventListener("change", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
      return;
    }

    await handleBrowseControlChange(target);
  });

  elements.browseToolbar.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (target.dataset.control !== "search-query") {
      return;
    }

    window.clearTimeout(state.searchDebounceId);
    state.searchDebounceId = window.setTimeout(async () => {
      state.filters.search.query = target.value;
      state.searchVisibleLimit = SEARCH_PAGE_SIZE;
      await syncVisibleSelection();
    }, 120);
  });

  elements.browseSubnav.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest("button[data-district]");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    state.filters.single.district = button.dataset.district || "all";
    await syncVisibleSelection();
  });

  elements.memberGrid.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest("button[data-member-id]");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const memberId = button.dataset.memberId;
    if (memberId) {
      await selectMember(memberId);
    }
  });

  elements.loadMoreButton.addEventListener("click", () => {
    state.searchVisibleLimit += SEARCH_PAGE_SIZE;
    renderBrowse();
  });
}

async function handleBrowseControlChange(target) {
  switch (target.dataset.control) {
    case "single-prefecture":
      state.filters.single.prefecture = target.value;
      state.filters.single.district = "all";
      break;
    case "proportional-block":
      state.filters.proportional.block = target.value;
      break;
    case "search-party":
      state.filters.search.party = target.value;
      break;
    case "search-prefecture":
      state.filters.search.prefecture = target.value;
      break;
    case "search-election":
      state.filters.search.electionType = target.value;
      break;
    default:
      return;
  }

  state.searchVisibleLimit = SEARCH_PAGE_SIZE;
  persistUiState();
  await syncVisibleSelection();
}

async function syncVisibleSelection() {
  const visibleMembers = getVisibleMembers();

  if (visibleMembers.length === 0) {
    state.selectedId = null;
    state.selectedSummary = null;
    state.selectedMember = null;
    state.isMemberLoading = false;
    state.side = "front";
    persistUiState();
    render();
    return;
  }

  if (!visibleMembers.some((member) => member.id === state.selectedId)) {
    await selectMember(visibleMembers[0].id);
    return;
  }

  state.selectedSummary = visibleMembers.find((member) => member.id === state.selectedId) ?? state.selectedSummary;
  state.selectedMember = state.cache.get(state.selectedId) ?? state.selectedSummary;
  ensureSearchLimitIncludesSelected(visibleMembers);
  persistUiState();
  render();

  if (!state.cache.has(state.selectedId) && state.selectedSummary?.memberPath) {
    void hydrateSelectedMember(state.selectedSummary);
  }
}

async function selectMember(id, options = {}) {
  const summary = state.members.find((member) => member.id === id);
  if (!summary) {
    return;
  }

  state.selectedId = id;
  state.selectedSummary = summary;
  state.selectedMember = state.cache.get(id) ?? summary;
  state.isMemberLoading = !state.cache.has(id);
  state.side = options.preserveSide ? state.side : "front";
  ensureSearchLimitIncludesSelected(getVisibleMembers());
  persistUiState();
  render();

  if (state.isMemberLoading && summary.memberPath) {
    await hydrateSelectedMember(summary);
    return;
  }

  warmMemberCache(getVisibleMembers(), id);
}

async function hydrateSelectedMember(summary) {
  try {
    const member = await loadMember(summary.memberPath);
    state.cache.set(summary.id, member);

    if (state.selectedId === summary.id) {
      state.selectedMember = member;
      state.isMemberLoading = false;
      renderDetail();
      warmMemberCache(getVisibleMembers(), summary.id);
    }
  } catch (error) {
    console.error(error);

    if (state.selectedId === summary.id) {
      state.isMemberLoading = false;
      elements.cardStatus.textContent = `詳細データの読み込みに失敗しました: ${error.message}`;
    }
  }
}

function moveSelection(step) {
  const visibleMembers = getVisibleMembers();

  if (visibleMembers.length === 0 || !state.selectedId) {
    return;
  }

  const currentIndex = visibleMembers.findIndex((member) => member.id === state.selectedId);
  const nextIndex = (currentIndex + step + visibleMembers.length) % visibleMembers.length;
  void selectMember(visibleMembers[nextIndex].id);
}

function toggleCard() {
  state.side = state.side === "front" ? "back" : "front";
  renderDetail();
}

function render() {
  renderTabs();
  renderBrowse();
  renderDetail();
}

function renderHero(index) {
  const totalMembers = Number.isInteger(index.totalMembers) ? index.totalMembers : state.members.length;
  const targetMembers = Number.isInteger(index.targetMembers) ? index.targetMembers : 465;
  const singleMembers = state.members.filter((member) => member.electionType === "single").length;
  const proportionalMembers = state.members.filter((member) => member.electionType === "proportional").length;

  if (elements.heroCurrentPhase) {
    elements.heroCurrentPhase.textContent = `${totalMembers}名運用`;
  }

  if (elements.heroTargetMembers) {
    elements.heroTargetMembers.textContent = `${targetMembers}名`;
  }

  if (elements.heroSingleMembers) {
    elements.heroSingleMembers.textContent = `${singleMembers}名`;
  }

  if (elements.heroProportionalMembers) {
    elements.heroProportionalMembers.textContent = `${proportionalMembers}名`;
  }

  if (elements.heroCopy) {
    elements.heroCopy.textContent =
      "iPhone での見やすさを優先しつつ、顔写真と氏名の対応を壊さないまま、小選挙区・比例代表・検索の3導線で学べる PWA に整理する。";
  }
}

function renderTabs() {
  elements.tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === state.selectedTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });
}

function renderBrowse() {
  const visibleMembers = getVisibleMembers();
  const renderedMembers = getRenderedMembers(visibleMembers);
  const heading = TAB_LABELS[state.selectedTab];

  elements.browseTitle.textContent = heading;
  elements.browseMeta.textContent = getBrowseMetaText(visibleMembers);
  elements.browseToolbar.innerHTML = renderBrowseToolbar();
  elements.browseSubnav.innerHTML = renderBrowseSubnav(visibleMembers);
  elements.browseSummary.innerHTML = renderBrowseSummary(visibleMembers, renderedMembers.length);
  elements.memberGrid.innerHTML = renderMemberGrid(renderedMembers, visibleMembers.length);
  elements.loadMoreButton.hidden = !(state.selectedTab === "search" && visibleMembers.length > renderedMembers.length);
}

function renderDetail() {
  elements.flashcard.dataset.side = state.side;
  renderDetailHeader();
  renderCard();
  updateControls();
}

function renderDetailHeader() {
  if (!state.selectedMember) {
    elements.detailTitle.textContent = "議員を選択してください";
    elements.detailMeta.textContent = "該当データなし";
    return;
  }

  const visibleMembers = getVisibleMembers();
  const currentIndex = visibleMembers.findIndex((member) => member.id === state.selectedMember.id);
  const prefix = currentIndex >= 0 ? `${currentIndex + 1} / ${visibleMembers.length}` : `${visibleMembers.length}件`;

  elements.detailTitle.textContent = state.selectedMember.name || "議員詳細";
  elements.detailMeta.textContent = state.isMemberLoading ? `${prefix} ・ 詳細読み込み中` : prefix;
}

function renderCard() {
  if (!state.selectedMember) {
    elements.flashcard.innerHTML = `
      <section class="card-face card-face-front">
        <div class="empty-state">
          条件に合う議員がありません。検索条件や表示タブを切り替えてください。
        </div>
      </section>
      <section class="card-face card-face-back" aria-hidden="true">
        <div class="empty-state">
          表示対象がないため、裏面も空です。
        </div>
      </section>
    `;
    elements.cardStatus.textContent = "カードを表示できません。";
    return;
  }

  const member = normalizeMember(state.selectedMember);
  const locationLabel = getMemberLocationLabel(member);
  const prefectureLabel = member.prefecture || "未設定";
  const noteLabel = member.notes || "補足メモは未設定です。";
  const careerItems = member.career.length
    ? member.career.slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "<li>補助情報なし</li>";

  elements.flashcard.innerHTML = `
    <section class="card-face card-face-front">
      <div class="front-photo-shell">
        <img
          class="card-photo card-photo-front"
          src="${escapeHtml(member.image)}"
          alt="${escapeHtml(member.name)} の写真"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
      </div>
      <div class="front-meta">
        <p class="front-label">${escapeHtml(member.electionLabel)}</p>
        <h3 class="card-name">${escapeHtml(member.name)}</h3>
        ${member.nameKana ? `<p class="name-kana">${escapeHtml(member.nameKana)}</p>` : ""}
        <p class="front-location">${escapeHtml(locationLabel)}</p>
        <p class="party-chip">${escapeHtml(member.party)}</p>
      </div>
    </section>

    <section class="card-face card-face-back">
      <div class="back-header">
        <p class="status-pill">${escapeHtml(STATUS_LABELS[member.status] ?? member.status)}</p>
        <h3 class="card-name">${escapeHtml(member.name)}</h3>
        <p class="meta-note">${escapeHtml(locationLabel)}</p>
      </div>
      <div class="back-grid">
        <section class="detail-block">
          <p class="detail-label">所属政党</p>
          <p class="detail-value">${escapeHtml(member.party)}</p>
        </section>
        <section class="detail-block">
          <p class="detail-label">都道府県</p>
          <p class="detail-value">${escapeHtml(prefectureLabel)}</p>
        </section>
        <section class="detail-block">
          <p class="detail-label">区分</p>
          <p class="detail-value">${escapeHtml(formatElectionType(member.districtType))}</p>
        </section>
        <section class="detail-block">
          <p class="detail-label">選挙区 / 比例ブロック</p>
          <p class="detail-value">${escapeHtml(locationLabel)}</p>
        </section>
        <section class="detail-block">
          <p class="detail-label">当選回数</p>
          <p class="detail-value">${escapeHtml(String(member.wins))} 回</p>
        </section>
        <section class="detail-block detail-block-wide">
          <p class="detail-label">主な経歴</p>
          <ol class="career-list">${careerItems}</ol>
        </section>
        <section class="detail-block detail-block-wide">
          <p class="detail-label">補足情報</p>
          <p class="detail-value">${escapeHtml(noteLabel)}</p>
        </section>
      </div>
    </section>
  `;

  elements.cardStatus.textContent = state.side === "front"
    ? "表面は写真・氏名・選挙区情報を表示しています。カードをタップすると裏面に切り替わります。"
    : "裏面は所属政党、都道府県、区分、補助情報を表示しています。";
}

function updateControls() {
  const visibleMembers = getVisibleMembers();
  const hasMembers = visibleMembers.length > 0;

  elements.prevButton.disabled = !hasMembers;
  elements.nextButton.disabled = !hasMembers;
  elements.flipButton.disabled = !state.selectedMember;
}

function getVisibleMembers() {
  switch (state.selectedTab) {
    case "single":
      return getSingleMembers();
    case "proportional":
      return getProportionalMembers();
    case "search":
      return getSearchMembers();
    default:
      return [];
  }
}

function getSingleMembers() {
  return state.members.filter((member) => {
    if (member.electionType !== "single") {
      return false;
    }

    if (state.filters.single.prefecture && member.prefecture !== state.filters.single.prefecture) {
      return false;
    }

    if (state.filters.single.district !== "all" && member.districtName !== state.filters.single.district) {
      return false;
    }

    return true;
  });
}

function getProportionalMembers() {
  return state.members.filter((member) => {
    if (member.electionType !== "proportional") {
      return false;
    }

    if (state.filters.proportional.block && member.proportionalBlock !== state.filters.proportional.block) {
      return false;
    }

    return true;
  });
}

function getSearchMembers() {
  const query = normalizeText(state.filters.search.query).toLowerCase();

  return state.members.filter((member) => {
    if (state.filters.search.party !== "all" && member.party !== state.filters.search.party) {
      return false;
    }

    if (state.filters.search.prefecture !== "all" && member.prefecture !== state.filters.search.prefecture) {
      return false;
    }

    if (state.filters.search.electionType !== "all" && member.electionType !== state.filters.search.electionType) {
      return false;
    }

    if (!query) {
      return true;
    }

    return member.searchText.includes(query);
  });
}

function getRenderedMembers(visibleMembers) {
  if (state.selectedTab !== "search") {
    return visibleMembers;
  }

  return visibleMembers.slice(0, state.searchVisibleLimit);
}

function getBrowseMetaText(visibleMembers) {
  if (state.selectedTab === "single") {
    const districts = new Set(visibleMembers.map((member) => member.districtName)).size;
    return `${visibleMembers.length}名 / ${districts}選挙区`;
  }

  if (state.selectedTab === "proportional") {
    return `${visibleMembers.length}名 / ${state.filters.proportional.block || "比例ブロック未選択"}`;
  }

  return `${visibleMembers.length}件ヒット`;
}

function renderBrowseToolbar() {
  if (state.selectedTab === "single") {
    return `
      <label class="control-field">
        <span>都道府県</span>
        <select data-control="single-prefecture">
          ${state.directory.prefectures.map((prefecture) => `
            <option value="${escapeHtml(prefecture)}" ${prefecture === state.filters.single.prefecture ? "selected" : ""}>
              ${escapeHtml(prefecture)}
            </option>
          `).join("")}
        </select>
      </label>
    `;
  }

  if (state.selectedTab === "proportional") {
    return `
      <label class="control-field">
        <span>比例ブロック</span>
        <select data-control="proportional-block">
          ${state.directory.blocks.map((block) => `
            <option value="${escapeHtml(block)}" ${block === state.filters.proportional.block ? "selected" : ""}>
              ${escapeHtml(block)}
            </option>
          `).join("")}
        </select>
      </label>
    `;
  }

  return `
    <div class="filter-grid">
      <label class="control-field control-field-search">
        <span>氏名検索</span>
        <input
          type="search"
          inputmode="search"
          autocapitalize="off"
          autocomplete="off"
          spellcheck="false"
          placeholder="氏名を入力"
          value="${escapeHtml(state.filters.search.query)}"
          data-control="search-query"
        />
      </label>
      <label class="control-field">
        <span>区分</span>
        <select data-control="search-election">
          ${renderOptions([
            { value: "all", label: "すべて" },
            { value: "single", label: ELECTION_TYPE_LABELS.single },
            { value: "proportional", label: ELECTION_TYPE_LABELS.proportional },
          ], state.filters.search.electionType)}
        </select>
      </label>
      <label class="control-field">
        <span>政党</span>
        <select data-control="search-party">
          ${renderOptions([{ value: "all", label: "すべての政党" }, ...state.directory.parties], state.filters.search.party)}
        </select>
      </label>
      <label class="control-field">
        <span>都道府県</span>
        <select data-control="search-prefecture">
          ${renderOptions(
            [{ value: "all", label: "すべての都道府県" }, ...buildFilterOptions(state.members, "prefecture")],
            state.filters.search.prefecture,
          )}
        </select>
      </label>
    </div>
  `;
}

function renderBrowseSubnav(visibleMembers) {
  if (state.selectedTab !== "single") {
    return "";
  }

  const districts = state.members
    .filter((member) =>
      member.electionType === "single"
      && member.prefecture === state.filters.single.prefecture)
    .map((member) => member.districtName)
    .filter(Boolean);

  return `
    <div class="chip-row" aria-label="選挙区一覧">
      <button
        class="filter-chip ${state.filters.single.district === "all" ? "is-active" : ""}"
        type="button"
        data-district="all"
      >
        すべて
      </button>
      ${districts.map((district) => `
        <button
          class="filter-chip ${state.filters.single.district === district ? "is-active" : ""}"
          type="button"
          data-district="${escapeHtml(district)}"
        >
          ${escapeHtml(district)}
        </button>
      `).join("")}
    </div>
  `;
}

function renderBrowseSummary(visibleMembers, renderedCount) {
  if (state.selectedTab === "single") {
    return `
      <p class="summary-copy">
        ${escapeHtml(state.filters.single.prefecture || "都道府県未選択")}の小選挙区を一覧できます。
        顔写真と氏名を見ながら、選挙区ごとに確認できます。
      </p>
    `;
  }

  if (state.selectedTab === "proportional") {
    return `
      <p class="summary-copy">
        ${escapeHtml(state.filters.proportional.block || "比例ブロック未選択")}の比例代表を表示中です。
        ブロック単位で連続して確認できます。
      </p>
    `;
  }

  if (visibleMembers.length === 0) {
    return `
      <div class="empty-state">
        条件に一致する議員が見つかりませんでした。氏名、政党、都道府県、区分の条件を緩めて再検索してください。
      </div>
    `;
  }

  return `
    <p class="summary-copy">
      ${visibleMembers.length}件の検索結果があります。
      まず ${renderedCount}件を表示し、必要なら続きも読み込めます。
    </p>
  `;
}

function renderMemberGrid(renderedMembers, totalCount) {
  if (renderedMembers.length === 0) {
    return `
      <div class="empty-state">
        表示できる議員がありません。条件を切り替えてください。
      </div>
    `;
  }

  const description = state.selectedTab === "search" && totalCount > renderedMembers.length
    ? `<p class="result-note">${renderedMembers.length} / ${totalCount} 件を表示中</p>`
    : "";

  return `
    ${description}
    <div class="member-grid-inner">
      ${renderedMembers.map((member) => renderMemberTile(member)).join("")}
    </div>
  `;
}

function renderMemberTile(member) {
  const isActive = member.id === state.selectedId;
  const locationLabel = getMemberLocationLabel(member);

  return `
    <button
      class="member-tile ${isActive ? "is-active" : ""}"
      type="button"
      data-member-id="${escapeHtml(member.id)}"
      aria-pressed="${isActive ? "true" : "false"}"
    >
      <span class="member-tile-photo">
        <img
          class="member-thumb"
          src="${escapeHtml(member.image)}"
          alt="${escapeHtml(member.name)} の写真"
          loading="lazy"
          decoding="async"
        />
      </span>
      <span class="member-tile-body">
        <span class="member-name">${escapeHtml(member.name)}</span>
        <span class="member-copy">${escapeHtml(locationLabel)}</span>
        <span class="member-copy">${escapeHtml(member.party)}</span>
      </span>
    </button>
  `;
}

function renderOptions(items, selectedValue) {
  return items.map((item) => {
    const value = typeof item.value === "string" ? item.value : item;
    const label = typeof item.label === "string" ? item.label : item.label ?? item.value;

    return `
      <option value="${escapeHtml(value)}" ${value === selectedValue ? "selected" : ""}>
        ${escapeHtml(label)}
      </option>
    `;
  }).join("");
}

function ensureSearchLimitIncludesSelected(visibleMembers) {
  if (state.selectedTab !== "search" || !state.selectedId) {
    return;
  }

  const selectedIndex = visibleMembers.findIndex((member) => member.id === state.selectedId);
  if (selectedIndex < 0) {
    return;
  }

  while (state.searchVisibleLimit <= selectedIndex) {
    state.searchVisibleLimit += SEARCH_PAGE_SIZE;
  }
}

function warmMemberCache(visibleMembers, selectedId) {
  const selectedIndex = visibleMembers.findIndex((member) => member.id === selectedId);
  if (selectedIndex < 0) {
    return;
  }

  const warmTargets = [
    visibleMembers[selectedIndex + 1],
    visibleMembers[selectedIndex + 2],
    visibleMembers[selectedIndex - 1],
  ].filter((member) => member && member.memberPath && !state.cache.has(member.id));

  if (warmTargets.length === 0) {
    return;
  }

  const preload = () => {
    warmTargets.forEach((member) => {
      void loadMember(member.memberPath)
        .then((loaded) => {
          state.cache.set(member.id, loaded);
        })
        .catch((error) => {
          console.warn(`Failed to prefetch ${member.id}`, error);
        });
    });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(preload, { timeout: 800 });
    return;
  }

  window.setTimeout(preload, 180);
}

function renderLoadError(error) {
  console.error(error);
  elements.browseToolbar.innerHTML = "";
  elements.browseSubnav.innerHTML = "";
  elements.browseSummary.innerHTML = `
    <div class="empty-state">
      データの読み込みに失敗しました。ローカルサーバー経由で開いているか、JSON 配置を確認してください。
    </div>
  `;
  elements.memberGrid.innerHTML = `
    <div class="empty-state">
      一覧を表示できませんでした。詳細はコンソールを確認してください。
    </div>
  `;
  elements.flashcard.innerHTML = `
    <section class="card-face card-face-front">
      <div class="empty-state">
        カードも表示できません。JSON または画像への参照を確認してください。
      </div>
    </section>
    <section class="card-face card-face-back" aria-hidden="true">
      <div class="empty-state">
        エラーのため裏面も表示できません。
      </div>
    </section>
  `;
  elements.cardStatus.textContent = `読み込みエラー: ${error.message}`;
  elements.detailTitle.textContent = "読み込み失敗";
  elements.detailMeta.textContent = "エラー";
  elements.browseTitle.textContent = "読み込み失敗";
  elements.browseMeta.textContent = "エラー";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function hydrateUiStateFromStorage() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = window.localStorage.getItem(UI_STATE_STORAGE_KEY);
    if (!raw) {
      return;
    }

    const saved = JSON.parse(raw);
    if (saved.selectedTab && TAB_LABELS[saved.selectedTab]) {
      state.selectedTab = saved.selectedTab;
    }

    if (saved.selectedId && state.members.some((member) => member.id === saved.selectedId)) {
      state.selectedId = saved.selectedId;
    }

    if (saved.filters?.single?.prefecture && state.directory.prefectures.includes(saved.filters.single.prefecture)) {
      state.filters.single.prefecture = saved.filters.single.prefecture;
    }

    if (saved.filters?.single?.district) {
      state.filters.single.district = saved.filters.single.district;
    }

    if (saved.filters?.proportional?.block && state.directory.blocks.includes(saved.filters.proportional.block)) {
      state.filters.proportional.block = saved.filters.proportional.block;
    }

    if (saved.filters?.search?.query) {
      state.filters.search.query = saved.filters.search.query;
    }

    if (saved.filters?.search?.party) {
      state.filters.search.party = saved.filters.search.party;
    }

    if (saved.filters?.search?.prefecture) {
      state.filters.search.prefecture = saved.filters.search.prefecture;
    }

    if (saved.filters?.search?.electionType) {
      state.filters.search.electionType = saved.filters.search.electionType;
    }
  } catch (error) {
    console.warn("Failed to restore UI state.", error);
  }
}

function persistUiState() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(UI_STATE_STORAGE_KEY, JSON.stringify({
      selectedTab: state.selectedTab,
      selectedId: state.selectedId,
      filters: state.filters,
    }));
  } catch (error) {
    console.warn("Failed to persist UI state.", error);
  }
}
