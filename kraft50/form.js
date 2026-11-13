(function () {
  "use strict";

  function isBrevoFormUrl(value) {
    var raw = String(value == null ? "" : value).trim();
    if (!raw) return "";
    var url;
    try {
      url = new URL(raw);
    } catch (error) {
      return "";
    }
    if (url.protocol !== "https:") return "";
    if (url.username || url.password) return "";
    if (url.port && url.port !== "443") return "";
    var host = url.hostname.toLowerCase();
    if (host !== "sibforms.com" && host.slice(-13) !== ".sibforms.com") return "";
    if (url.pathname.indexOf("/serve/") !== 0) return "";
    return url.toString();
  }

  window.KRAFT50_isBrevoFormUrl = isBrevoFormUrl;

  var form = document.getElementById("waitlist");
  if (!form) return;

  var endpoint = isBrevoFormUrl(window.KRAFT50_FORM_ENDPOINT);
  var note = document.getElementById("form-unconfigured");
  var thanks = document.getElementById("thanks");
  var fallback = document.getElementById("fallback");
  var fallbackText = document.getElementById("fallback-text");
  var fallbackMail = document.getElementById("fallback-mail");
  var alertBox = document.getElementById("form-alert");
  var button = document.getElementById("submit-waitlist");
  var sourceInput = document.getElementById("quelle");

  var source = "";
  try {
    var params = new URLSearchParams(window.location.search);
    var rawSource = params.get("von") || "";
    if (/^[A-Za-z0-9_-]{1,40}$/.test(rawSource)) source = rawSource;
  } catch (error) {
    source = "";
  }
  if (sourceInput) sourceInput.value = source;

  if (note) note.hidden = Boolean(endpoint);

  function field(id) {
    return document.getElementById(id);
  }

  function setFieldError(input, messageId, message) {
    var messageEl = document.getElementById(messageId);
    if (messageEl) {
      messageEl.textContent = message || "";
      messageEl.hidden = !message;
    }
    if (input) {
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (message) input.setAttribute("aria-describedby", messageId);
    }
  }

  function clearErrors() {
    setFieldError(field("email"), "email-error", "");
    setFieldError(field("dsgvo"), "dsgvo-error", "");
    if (alertBox) {
      alertBox.textContent = "";
      alertBox.hidden = true;
    }
  }

  function isEmail(value) {
    return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function clip(value, max) {
    var text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > max ? text.slice(0, max) : text;
  }

  function readEntry() {
    var age = field("age");
    return {
      email: clip(field("email").value, 254),
      name: clip(field("name").value, 120),
      age: age ? clip(age.value, 40) : "",
      missing: clip(field("missing").value, 1000),
      source: source
    };
  }

  function mailtoFor(entry) {
    var lines = [
      "Ich willige ein, dass AY-TEA meine Angaben für die Warteliste „Krafttraining ab 50“ speichert und mich dazu per E-Mail kontaktiert. Den Widerruf schicke ich an info@ay-tea.de.",
      "",
      "Name: " + (entry.name || "–"),
      "E-Mail: " + entry.email,
      "Altersgruppe: " + (entry.age || "–"),
      "Was fehlt: " + (entry.missing || "–")
    ];
    if (entry.source) lines.push("Herkunft: " + entry.source);
    var href = "mailto:info@ay-tea.de?subject=" +
      encodeURIComponent("Warteliste Krafttraining ab 50") +
      "&body=" + encodeURIComponent(lines.join("\n"));
    return href.length > 1800 ? "mailto:info@ay-tea.de?subject=" + encodeURIComponent("Warteliste Krafttraining ab 50") : href;
  }

  function showThanks() {
    form.hidden = true;
    if (note) note.hidden = true;
    if (fallback) fallback.hidden = true;
    if (thanks) {
      thanks.hidden = false;
      thanks.focus();
    }
  }

  function showFallback(entry, failedSend) {
    if (!fallback || !fallbackText || !fallbackMail) return;
    fallbackText.textContent = failedSend
      ? "Die Angaben konnten gerade nicht übermittelt werden. Es wurde nichts gespeichert. Schick sie bitte selbst per E-Mail – der Link enthält, was du eingetragen hast."
      : "Die Online-Warteliste ist noch nicht verbunden. Es wurde nichts gespeichert. Schick die Angaben bitte selbst per E-Mail – der Link enthält, was du eingetragen hast.";
    fallbackMail.href = mailtoFor(entry);
    fallback.hidden = false;
    fallback.focus();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (form.getAttribute("data-sending") === "1") return;

    var trap = field("k50_hp");
    var brevoTrap = field("email_address_check");
    if ((trap && trap.value) || (brevoTrap && brevoTrap.value)) {
      showThanks();
      return;
    }

    clearErrors();
    var emailInput = field("email");
    var consent = field("dsgvo");
    var email = clip(emailInput.value, 254);
    var valid = true;
    var focusTarget = null;

    if (!email) {
      setFieldError(emailInput, "email-error", "Bitte eine E-Mail-Adresse eintragen.");
      valid = false;
      focusTarget = emailInput;
    } else if (!isEmail(email)) {
      setFieldError(emailInput, "email-error", "Diese E-Mail-Adresse sieht unvollständig aus.");
      valid = false;
      focusTarget = emailInput;
    }

    if (!consent.checked) {
      setFieldError(consent, "dsgvo-error", "Bitte die Einwilligung ankreuzen. Ohne sie speichern wir nichts.");
      valid = false;
      if (!focusTarget) focusTarget = consent;
    }

    if (!valid) {
      if (alertBox) {
        alertBox.textContent = "Bitte prüfe die markierten Felder. Es wurde nichts abgeschickt.";
        alertBox.hidden = false;
      }
      if (focusTarget) focusTarget.focus();
      return;
    }

    var entry = readEntry();

    if (!endpoint) {
      showFallback(entry, false);
      return;
    }

    var body = new URLSearchParams();
    body.set("EMAIL", entry.email);
    body.set("NAME", entry.name);
    body.set("ALTERSGRUPPE", entry.age);
    body.set("FEHLT", entry.missing);
    body.set("EINWILLIGUNG", "ja");
    body.set("QUELLE", entry.source);
    body.set("locale", "de");
    body.set("html_type", "simple");
    body.set("email_address_check", "");

    form.setAttribute("data-sending", "1");
    if (button) button.disabled = true;

    fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      credentials: "omit",
      cache: "no-store",
      body: body
    }).then(function () {
      showThanks();
    }).catch(function () {
      form.setAttribute("data-sending", "0");
      if (button) button.disabled = false;
      showFallback(entry, true);
    });
  });
})();
