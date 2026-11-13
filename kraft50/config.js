/*
  Kraft-50-Warteliste — die einzige Einstellung.

  Leer lassen, bis der Brevo-Endpunkt steht. Solange der Wert leer ist
  (oder keine gültige Brevo-Formular-Adresse), speichert die Seite nichts
  und bietet nach dem Absenden einen E-Mail-Link an info@ay-tea.de an.

  Erlaubt ist nur eine https-Adresse eines Brevo-Formulars:
  Host sibforms.com (oder eine Subdomain) und Pfad /serve/…
  Andere Adressen werden absichtlich ignoriert, damit die
  Datenschutzerklärung zutrifft. Keinen API-Schlüssel eintragen.

  Beispiel (die echte Adresse aus Brevo einsetzen):
  window.KRAFT50_FORM_ENDPOINT = "https://abc12345.sibforms.com/serve/DEIN_TOKEN";

  Einrichtung (kurz):
  1. Konto bei Brevo (EU) mit info@ay-tea.de, Auftragsverarbeitung akzeptieren.
  2. Kontakt-Attribute als Text anlegen: NAME, ALTERSGRUPPE, FEHLT,
     EINWILLIGUNG, QUELLE. EMAIL gibt es bereits.
  3. Liste „Kraft 50 Warteliste“ und ein Formular darauf.
     Feldnamen exakt: EMAIL, NAME, ALTERSGRUPPE, FEHLT, EINWILLIGUNG, QUELLE.
     Nur EMAIL bei Brevo als Pflichtfeld markieren.
  4. Benachrichtigung an info@ay-tea.de einschalten.
     Domain ay-tea.de erlauben. Kein Brevo-Tracking-Skript auf die Seite kopieren.
  5. Die action-URL des Formulars hier einsetzen, committen, veröffentlichen.
  6. Einmal selbst testen, Testeintrag wieder löschen.
  7. Nach Testende löschen, spätestens sechs Monate nach Eingang.
     Widerruf an info@ay-tea.de genauso löschen.
*/
window.KRAFT50_FORM_ENDPOINT = "";
