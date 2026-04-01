const DISMISS_STORAGE_KEY = "hiko-pwa-banner-dismissed";

export async function registerPwaServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.register("./sw.js", { scope: "./" });
  } catch (error) {
    console.warn("Service worker registration failed.", error);
    return null;
  }
}

export function setupInstallBanner(elements) {
  const state = {
    deferredPrompt: null,
    dismissed: window.sessionStorage.getItem(DISMISS_STORAGE_KEY) === "1",
  };

  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function render() {
    if (!elements.banner || !elements.copy || !elements.installButton || !elements.dismissButton) {
      return;
    }

    if (state.dismissed || isStandalone()) {
      elements.banner.hidden = true;
      return;
    }

    elements.banner.hidden = false;

    if (state.deferredPrompt) {
      elements.copy.textContent = "ホーム画面に追加すると、次回以降は iPhone のアプリ感覚で開けます。";
      elements.installButton.hidden = false;
      elements.installButton.textContent = "インストール";
      return;
    }

    if (isIos) {
      elements.copy.textContent = "iPhone では Safari の共有メニューから「ホーム画面に追加」を選ぶと PWA として使えます。";
      elements.installButton.hidden = false;
      elements.installButton.textContent = "追加手順を表示";
      return;
    }

    elements.copy.textContent = "この端末ではブラウザメニューからホーム画面追加できる場合があります。";
    elements.installButton.hidden = true;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
    render();
  });

  window.addEventListener("appinstalled", () => {
    state.dismissed = true;
    window.sessionStorage.setItem(DISMISS_STORAGE_KEY, "1");
    render();
  });

  elements.installButton?.addEventListener("click", async () => {
    if (state.deferredPrompt) {
      state.deferredPrompt.prompt();
      await state.deferredPrompt.userChoice;
      state.deferredPrompt = null;
      render();
      return;
    }

    if (isIos) {
      elements.copy.textContent = "Safari 下部の共有ボタンを押して、「ホーム画面に追加」を選んでください。";
    }
  });

  elements.dismissButton?.addEventListener("click", () => {
    state.dismissed = true;
    window.sessionStorage.setItem(DISMISS_STORAGE_KEY, "1");
    render();
  });

  render();

  return {
    render,
    isStandalone,
  };
}

export function setupNetworkBanner(elements) {
  if (!elements.banner || !elements.copy) {
    return null;
  }

  function render() {
    const online = window.navigator.onLine;
    elements.banner.hidden = online;
    elements.banner.dataset.state = online ? "online" : "offline";
    elements.copy.textContent = online
      ? "通信は安定しています。"
      : "現在オフラインです。保存済みデータだけ利用できる場合があります。";
  }

  window.addEventListener("online", render);
  window.addEventListener("offline", render);
  render();

  return { render };
}
