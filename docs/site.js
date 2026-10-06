(function () {
  var KEY = "hk-sms-csv-lang";

  function readLang() {
    try {
      var stored = localStorage.getItem(KEY);
      if (stored === "en" || stored === "zh") return stored;
    } catch (e) {
      /* private mode */
    }
    return "zh";
  }

  function apply(lang) {
    lang = lang === "en" ? "en" : "zh";
    document.documentElement.setAttribute("data-ui-lang", lang);
    document.documentElement.lang = lang === "en" ? "en" : "zh-Hant-HK";
    var blocks = document.querySelectorAll("[data-lang]");
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].hidden = blocks[i].getAttribute("data-lang") !== lang;
    }
    var zh = document.getElementById("lang-zh");
    var en = document.getElementById("lang-en");
    if (zh) zh.setAttribute("aria-pressed", lang === "zh" ? "true" : "false");
    if (en) en.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {
      /* ignore */
    }
  }

  function init() {
    apply(readLang());
    var zh = document.getElementById("lang-zh");
    var en = document.getElementById("lang-en");
    if (zh) {
      zh.addEventListener("click", function () {
        apply("zh");
      });
    }
    if (en) {
      en.addEventListener("click", function () {
        apply("en");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
