import {
  ELECTION_TYPE_LABELS,
  STATUS_LABELS,
  getLocationLabel,
  normalizeText,
} from "./member-schema.js?v=20260330-photofix54";
import {
  buildFilterOptions,
  filterMemberSummaries,
  loadMember,
  loadMemberIndex,
} from "./member-store.js?v=20260330-photofix54";

const elements = {
  heroCopy: document.querySelector("#hero-copy"),
  heroCurrentPhase: document.querySelector("#hero-current-phase"),
  heroTargetMembers: document.querySelector("#hero-target-members"),
  flashcard: document.querySelector("#flashcard"),
  cardStatus: document.querySelector("#card-status"),
  memberCount: document.querySelector("#member-count"),
  memberList: document.querySelector("#member-list"),
  prevButton: document.querySelector("#prev-button"),
  nextButton: document.querySelector("#next-button"),
  flipButton: document.querySelector("#flip-button"),
  shuffleButton: document.querySelector("#shuffle-button"),
  masteredButton: document.querySelector("#mastered-button"),
  focusButton: document.querySelector("#focus-button"),
  filters: {
    party: document.querySelector("#filter-party"),
    electionType: document.querySelector("#filter-election"),
    prefecture: document.querySelector("#filter-prefecture"),
    block: document.querySelector("#filter-block"),
  },
};

const state = {
  members: [],
  filteredMembers: [],
  selectedId: null,
  selectedMember: null,
  side: "front",
  filters: {
    party: "all",
    electionType: "all",
    prefecture: "all",
    block: "all",
  },
  cache: new Map(),
};

bindEvents();
await initialize();

async function initialize() {
  try {
    const index = await loadMemberIndex();
    state.members = index.members ?? [];
    renderHero(index);

    populateSelect(elements.filters.party, buildFilterOptions(state.members, "party"), "すべての政党");
    populateSelect(
      elements.filters.electionType,
      buildFilterOptions(state.members, "electionType", ELECTION_TYPE_LABELS),
      "すべての区分",
    );
    populateSelect(elements.filters.prefecture, buildFilterOptions(state.members, "prefecture"), "すべての都道府県");
    populateSelect(elements.filters.block, buildFilterOptions(state.members, "block"), "すべての比例ブロック");

    await applyFilters();
  } catch (error) {
    renderLoadError(error);
  }
}

function renderHero(index) {
  const totalMembers = Number.isInteger(index.totalMembers) ? index.totalMembers : state.members.length;
  const targetMembers = Number.isInteger(index.targetMembers) ? index.targetMembers : 465;

  if (elements.heroCurrentPhase) {
    elements.heroCurrentPhase.textContent = `検証用 ${totalMembers}名`;
  }

  if (elements.heroTargetMembers) {
    elements.heroTargetMembers.textContent = `${targetMembers}名`;
  }

  if (elements.heroCopy) {
    elements.heroCopy.textContent =
      `${totalMembers}名の確認セットを基準に、50名単位でも崩れにくい単語帳アプリの土台を整える。`;
  }
}

function bindEvents() {
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

  elements.shuffleButton.addEventListener("click", preventFutureAction);
  elements.masteredButton.addEventListener("click", preventFutureAction);
  elements.focusButton.addEventListener("click", preventFutureAction);

  Object.entries(elements.filters).forEach(([key, element]) => {
    element.addEventListener("change", async () => {
      state.filters[key] = element.value;
      await applyFilters();
    });
  });
}

async function applyFilters() {
  state.filteredMembers = filterMemberSummaries(state.members, state.filters);

  if (state.filteredMembers.length === 0) {
    state.selectedId = null;
    state.selectedMember = null;
    state.side = "front";
    render();
    return;
  }

  const selectedStillVisible = state.filteredMembers.some((member) => member.id === state.selectedId);
  const nextId = selectedStillVisible ? state.selectedId : state.filteredMembers[0].id;
  await selectMember(nextId);
}

async function selectMember(id) {
  if (!id) {
    return;
  }

  const summary = state.filteredMembers.find((member) => member.id === id) ?? state.members.find((member) => member.id === id);

  if (!summary) {
    return;
  }

  if (!state.cache.has(id)) {
    const member = await loadMember(summary.memberPath);
    state.cache.set(id, member);
  }

  state.selectedId = id;
  state.selectedMember = state.cache.get(id);
  state.side = "front";
  render();
}

function moveSelection(step) {
  if (state.filteredMembers.length === 0 || !state.selectedId) {
    return;
  }

  const currentIndex = state.filteredMembers.findIndex((member) => member.id === state.selectedId);
  const nextIndex = (currentIndex + step + state.filteredMembers.length) % state.filteredMembers.length;
  void selectMember(state.filteredMembers[nextIndex].id);
}

function toggleCard() {
  state.side = state.side === "front" ? "back" : "front";
  render();
}

function render() {
  elements.flashcard.dataset.side = state.side;
  renderMemberCount();
  renderCard();
  renderList();
  updateControls();
}

function renderMemberCount() {
  const visible = state.filteredMembers.length;
  const total = state.members.length;
  elements.memberCount.textContent = `${visible} / ${total} 件を表示中`;
}

function renderCard() {
  if (!state.selectedMember) {
    elements.flashcard.innerHTML = `
      <section class="card-face card-face-front">
        <div class="empty-state">
          条件に一致する議員データがありません。絞り込み条件を見直してください。
        </div>
      </section>
      <section class="card-face card-face-back" aria-hidden="true">
        <div class="empty-state">
          表示対象がないため、カード裏面も空です。
        </div>
      </section>
    `;
    elements.cardStatus.textContent = "カードを表示できません。";
    return;
  }

  const member = state.selectedMember;
  const summaryIndex = state.filteredMembers.findIndex((item) => item.id === member.id);
  const locationLabel = getLocationLabel(member);
  const prefectureLabel = normalizeText(member.prefecture) || "未設定";
  const careerItems = member.career.length
    ? member.career.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "<li>TODO: 主な経歴を追加</li>";
  const nameKana = normalizeText(member.nameKana);
  const notes = normalizeText(member.notes) || "補足メモは未設定です。";

  elements.flashcard.innerHTML = `
    <section class="card-face card-face-front card-face-front-photo">
      <div class="front-photo-shell">
        <img class="card-photo card-photo-front" src="${escapeHtml(member.photo)}" alt="${escapeHtml(member.name)} の写真" />
      </div>
      <p class="front-location">${escapeHtml(locationLabel)}</p>
      <p class="front-position">${summaryIndex + 1} / ${state.filteredMembers.length}</p>
    </section>

    <section class="card-face card-face-back">
      <div class="back-header">
        <p class="status-pill">${escapeHtml(STATUS_LABELS[member.status] ?? member.status)}</p>
        <h3 class="card-name">${escapeHtml(member.name)}</h3>
        ${nameKana ? `<p class="name-kana">${escapeHtml(nameKana)}</p>` : ""}
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
          <p class="detail-label">選出区分</p>
          <p class="detail-value">${escapeHtml(ELECTION_TYPE_LABELS[member.electionType] ?? member.electionType)}</p>
        </section>
        <section class="detail-block">
          <p class="detail-label">選挙区または比例ブロック</p>
          <p class="detail-value">${escapeHtml(locationLabel)}</p>
        </section>
        <section class="detail-block">
          <p class="detail-label">当選回数</p>
          <p class="detail-value">${escapeHtml(String(member.wins))} 回</p>
        </section>
        <section class="detail-block">
          <p class="detail-label">主な経歴</p>
          <ol class="career-list">${careerItems}</ol>
        </section>
        <section class="detail-block">
          <p class="detail-label">補足メモ</p>
          <p class="notes-text">${escapeHtml(notes)}</p>
        </section>
        <section class="detail-block">
          <p class="detail-label">参照情報</p>
          <p class="detail-value">
            sourcePdf: ${escapeHtml(member.sourcePdf || "未設定")}<br />
            sourcePage: ${member.sourcePage ?? "未設定"}
          </p>
        </section>
      </div>
    </section>
  `;

  elements.cardStatus.textContent =
    state.side === "front"
      ? "表面を表示中です。写真だけで覚えて、答え合わせは「めくる」で確認できます。"
      : "裏面を表示中です。選出区分・経歴・メモを確認できます。";
}

function renderList() {
  if (state.filteredMembers.length === 0) {
    elements.memberList.innerHTML = `
      <div class="empty-state">
        条件に一致する一覧項目がありません。今後20名・50名追加時も、この一覧から同じ導線で詳細へ遷移します。
      </div>
    `;
    return;
  }

  elements.memberList.innerHTML = state.filteredMembers
    .map((member) => {
      const isActive = member.id === state.selectedId;
      const electionType = ELECTION_TYPE_LABELS[member.electionType] ?? member.electionType;
      const location = member.electionType === "single" ? member.district : member.block || "未設定";

      return `
        <article class="member-row ${isActive ? "is-active" : ""}">
          <img class="member-thumb" src="${escapeHtml(member.photo)}" alt="${escapeHtml(member.name)} のサムネイル" />
          <div class="member-meta">
            <p class="member-name">${escapeHtml(member.name)}</p>
            <p class="member-copy">${escapeHtml(member.party)} / ${escapeHtml(electionType)}</p>
            <p class="member-copy">${escapeHtml(location || "未設定")}</p>
          </div>
          <button class="member-open" type="button" data-member-id="${escapeHtml(member.id)}">
            詳細
          </button>
        </article>
      `;
    })
    .join("");

  elements.memberList.querySelectorAll("[data-member-id]").forEach((button) => {
    button.addEventListener("click", () => {
      void selectMember(button.dataset.memberId);
    });
  });
}

function updateControls() {
  const hasMembers = state.filteredMembers.length > 0;
  elements.prevButton.disabled = !hasMembers;
  elements.nextButton.disabled = !hasMembers;
  elements.flipButton.disabled = !state.selectedMember;
}

function populateSelect(select, items, placeholderLabel) {
  select.innerHTML = [
    `<option value="all">${escapeHtml(placeholderLabel)}</option>`,
    ...items.map((item) => `<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`),
  ].join("");
}

function preventFutureAction(event) {
  event.preventDefault();
  elements.cardStatus.textContent = "この操作は将来拡張用です。今回の実装ではUI上の配置だけ先に用意しています。";
}

function renderLoadError(error) {
  console.error(error);
  elements.flashcard.innerHTML = `
    <section class="card-face card-face-front">
      <div class="empty-state">
        データの読み込みに失敗しました。ローカルサーバー経由で開いているか、JSON の配置を確認してください。
      </div>
    </section>
    <section class="card-face card-face-back" aria-hidden="true">
      <div class="empty-state">
        エラーのため裏面も表示できません。
      </div>
    </section>
  `;
  elements.cardStatus.textContent = `読み込みエラー: ${error.message}`;
  elements.memberCount.textContent = "読み込み失敗";
  elements.memberList.innerHTML = `
    <div class="empty-state">
      一覧を表示できませんでした。詳細はコンソールを確認してください。
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
