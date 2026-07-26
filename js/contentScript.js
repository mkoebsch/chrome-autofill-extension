/* contentScript.js - rewritten generic autofill engine */

const COUNTRY_LABELS = {
  AF:'Afghanistan', AL:'Albania', DZ:'Algeria', AS:'American Samoa', AD:'Andorra', AO:'Angola', AI:'Anguilla', AQ:'Antarctica', AG:'Antigua and Barbuda',
  AR:'Argentina', AM:'Armenia', AW:'Aruba', AU:'Australia', AT:'Austria', AZ:'Azerbaijan', BS:'Bahamas', BH:'Bahrain', BD:'Bangladesh', BB:'Barbados',
  BY:'Belarus', BE:'Belgium', BZ:'Belize', BJ:'Benin', BM:'Bermuda', BT:'Bhutan', BO:'Bolivia', BA:'Bosnia and Herzegovina', BW:'Botswana', BR:'Brazil',
  BN:'Brunei Darussalam', BG:'Bulgaria', BF:'Burkina Faso', BI:'Burundi', KH:'Cambodia', CM:'Cameroon', CA:'Canada', CV:'Cape Verde', KY:'Cayman Islands',
  CF:'Central African Republic', TD:'Chad', CL:'Chile', CN:'China', CO:'Colombia', KM:'Comoros', CG:'Congo', CD:'Congo (Democratic Republic)', CR:'Costa Rica',
  CI:"Côte d'Ivoire", HR:'Croatia', CU:'Cuba', CW:'Curaçao', CY:'Cyprus', CZ:'Czech Republic', DK:'Denmark', DJ:'Djibouti', DM:'Dominica', DO:'Dominican Republic',
  EC:'Ecuador', EG:'Egypt', SV:'El Salvador', GQ:'Equatorial Guinea', ER:'Eritrea', EE:'Estonia', ET:'Ethiopia', FJ:'Fiji', FI:'Finland', FR:'France',
  GA:'Gabon', GM:'Gambia', GE:'Georgia', DE:'Germany', GH:'Ghana', GI:'Gibraltar', GR:'Greece', GL:'Greenland', GD:'Grenada', GP:'Guadeloupe', GU:'Guam', GT:'Guatemala',
  GG:'Guernsey', GN:'Guinea', GW:'Guinea-Bissau', GY:'Guyana', HT:'Haiti', HN:'Honduras', HK:'Hong Kong', HU:'Hungary', IS:'Iceland', IN:'India', ID:'Indonesia',
  IR:'Iran', IQ:'Iraq', IE:'Ireland', IL:'Israel', IT:'Italy', JM:'Jamaica', JP:'Japan', JE:'Jersey', JO:'Jordan', KZ:'Kazakhstan', KE:'Kenya', KI:'Kiribati',
  KW:'Kuwait', KG:'Kyrgyzstan', LA:'Laos', LV:'Latvia', LB:'Lebanon', LS:'Lesotho', LR:'Liberia', LY:'Libya', LI:'Liechtenstein', LT:'Lithuania', LU:'Luxembourg',
  MO:'Macau', MK:'North Macedonia', MG:'Madagascar', MW:'Malawi', MY:'Malaysia', MV:'Maldives', ML:'Mali', MT:'Malta', MH:'Marshall Islands', MQ:'Martinique',
  MR:'Mauritania', MU:'Mauritius', YT:'Mayotte', MX:'Mexico', FM:'Micronesia', MD:'Moldova', MC:'Monaco', MN:'Mongolia', ME:'Montenegro', MS:'Montserrat',
  MA:'Morocco', MZ:'Mozambique', MM:'Myanmar', NA:'Namibia', NR:'Nauru', NP:'Nepal', NL:'Netherlands', NC:'New Caledonia', NZ:'New Zealand', NI:'Nicaragua',
  NE:'Niger', NG:'Nigeria', NU:'Niue', NO:'Norway', OM:'Oman', PK:'Pakistan', PW:'Palau', PS:'Palestinian Territory', PA:'Panama', PG:'Papua New Guinea',
  PY:'Paraguay', PE:'Peru', PH:'Philippines', PL:'Poland', PT:'Portugal', PR:'Puerto Rico', QA:'Qatar', RE:'Réunion', RO:'Romania', RU:'Russia', RW:'Rwanda',
  SA:'Saudi Arabia', SN:'Senegal', RS:'Serbia', SC:'Seychelles', SL:'Sierra Leone', SG:'Singapore', SK:'Slovakia', SI:'Slovenia', SO:'Somalia', ZA:'South Africa',
  KR:'South Korea', SS:'South Sudan', ES:'Spain', LK:'Sri Lanka', SD:'Sudan', SR:'Suriname', SE:'Sweden', CH:'Switzerland', SY:'Syria', TW:'Taiwan', TJ:'Tajikistan',
  TZ:'Tanzania', TH:'Thailand', TG:'Togo', TO:'Tonga', TT:'Trinidad and Tobago', TN:'Tunisia', TR:'Turkey', TM:'Turkmenistan', UG:'Uganda', UA:'Ukraine',
  AE:'United Arab Emirates', GB:'United Kingdom', US:'United States', UY:'Uruguay', UZ:'Uzbekistan', VA:'Vatican City', VE:'Venezuela', VN:'Vietnam', YE:'Yemen', ZM:'Zambia', ZW:'Zimbabwe'
};

const FIELD_DEFS = {
  salutation: {
    positive: [/salutation|anrede|title|honorific/, /gender|sex/],
    negative: [/first|last|name|mail|card|company/],
    autocomplete: ['honorific-prefix', 'sex'],
    min: 50
  },
  companyName: {
    positive: [/company|firma|organisation|organization|business|firm|societe|empresa|azienda|bedrijf/],
    negative: [/first|last|full|your|customer|card|mail|address/],
    autocomplete: ['organization'],
    min: 50
  },
  vatId: {
    positive: [/vat|ust.?id|ustid|tax.?id|tax.?number|mwst/],
    negative: [/phone|mail|name/],
    min: 50
  },
  firstName: {
    positive: [/first.?name|firstname|given.?name|forename|vorname|prenom|nombre|nome|voornaam|imie/],
    negative: [/last|family|surname|nachname|company|address|mail|password|gender|salutation|anrede/],
    autocomplete: ['given-name'],
    min: 42
  },
  middleName: {
    positive: [/middle.?name|additional.?name|second.?name|middle.?initial|zweiter.?vorname|deuxieme.?prenom|segundo.?nombre/],
    negative: [/first|last|family|surname|company|address|mail|password/],
    autocomplete: ['additional-name'],
    min: 46
  },
  lastName: {
    positive: [/last.?name|lastname|family.?name|surname|nachname|apellido|apellidos|sobrenome|cognome|nom.?de.?famille|achternaam|nazwisko/],
    negative: [/first|given|vorname|company|address|mail|password|gender|salutation|anrede/],
    autocomplete: ['family-name'],
    min: 42
  },
  fullName: {
    positive: [/full.?name|customer.?name|name.?surname|name$/],
    negative: [/company|card|first|last|given|family|surname|vorname|nachname|user|mail/],
    autocomplete: ['name'],
    min: 50
  },
  email: {
    positive: [/e.?mail|mail.?address|correo/],
    negative: [/password|passwort|male|female|gender|card|company/],
    autocomplete: ['email', 'username'],
    type: ['email'],
    min: 42
  },
  phoneCode: {
    positive: [/country.?code|dial.?code|phone.?code|prefix|vorwahl|indicatif|prefisso|lada/],
    negative: [/^(country|land)$/],
    autocomplete: ['tel-country-code'],
    min: 48
  },
  telephone: {
    positive: [/phone|mobile|telephone|telefono|\btel\b|handy|rufnummer|contact.?number|movil|cellulare|mobiel/],
    negative: [/fax|password|postcode|zip|vat|country\b/],
    autocomplete: ['tel', 'tel-national'],
    type: ['tel'],
    min: 42
  },
  streetCombined: {
    positive: [/street.?address|address.?line.?1|address1|address$|delivery.?address|billing.?address|stra(?:ss|\u00df)e|street|road|anschrift|adresse|direccion|indirizzo|straat|ulica|calle|\bvia\b|\brue\b|address line 1|address.?lines?.?(0|1)/],
    negative: [/email|mail|city|postcode|postal|zip|country|state|province|region|company|name|password/],
    autocomplete: ['street-address', 'address-line1'],
    min: 42
  },
  street: {
    positive: [/street(?!.*number)|stra(?:ss|\u00df)e|road|address.?line.?1|address1|street.?name|anschrift|adresse|direccion|indirizzo|straat|ulica|calle|\bvia\b|\brue\b|address.?lines?.?(0|1)/],
    negative: [/house|number|nr\b|no\b|postcode|postal|zip|city|country|state|company|name|password/],
    autocomplete: ['address-line1'],
    min: 42
  },
  houseNumber: {
    positive: [/house.?number|house.?no|street.?number|street.?no|hausnummer|haus.?nr|numero.?civico|huisnummer|numer.?domu|portal|no\.?$|nr\.?$/],
    negative: [/phone|order|card|zip|postal|name/],
    min: 46
  },
  streetAddition: {
    positive: [/address.?line.?2|address2|addr2|addition|zusatz|complemento|address.?lines?.?2/],
    negative: [/mail|email|name|address.?line.?3|apartment|unit|floor|building/],
    autocomplete: ['address-line2'],
    min: 42
  },
  addressLine3: {
    positive: [/address.?line.?3|address3|addr3|address.?lines?.?3/],
    negative: [/mail|email|name|address.?line.?2/],
    autocomplete: ['address-line3'],
    min: 42
  },
  apartment: {
    positive: [/apartment|apartamento|appartamento|wohnung|unit|suite|\bapt\b/],
    negative: [/address.?line|floor|building|house.?number/],
    min: 46
  },
  floor: {
    positive: [/\bfloor\b|etage|stockwerk|piso|piano/],
    negative: [/address.?line|apartment|unit|building/],
    min: 48
  },
  building: {
    positive: [/\bbuilding\b|gebaude|gebaeude|edificio|immeuble|block|tower/],
    negative: [/address.?line|apartment|unit|floor/],
    min: 48
  },
  postcode: {
    positive: [/postcode|postal.?code|post.?code|code.?postal|codigo.?postal|zip|plz|\bcap\b/],
    negative: [/city|town|state|country|password|phone/],
    autocomplete: ['postal-code'],
    min: 42
  },
  city: {
    positive: [/city|town|ort|stadt|locality|suburb|ville|ciudad|citta|gemeente|miejscowosc/],
    negative: [/postcode|postal|zip|state|province|country|password/],
    autocomplete: ['address-level2'],
    min: 42
  },
  district: {
    positive: [/district|suburb|neighbou?rhood|borough|quarter|stadtteil|bezirk|ortsteil|quartier|barrio|frazione/],
    negative: [/state|province|country|postcode|postal|zip|password/],
    autocomplete: ['address-level3'],
    min: 44
  },
  state: {
    positive: [/state|province|region|county|bundesland/],
    negative: [/country.?code|phone|dial|mail|password/],
    autocomplete: ['address-level1'],
    min: 42
  },
  country: {
    positive: [/country|land|nation|pays|pais|paese/],
    negative: [/code|dial|phone|prefix/],
    autocomplete: ['country', 'country-name'],
    min: 42
  },
  birthDate: {
    positive: [/date.?of.?birth|birth.?date|birthday|geburtsdatum|dob\b/],
    negative: [/card|expir|valid|delivery|shipping/],
    autocomplete: ['bday'],
    type: ['date'],
    min: 50
  },
  dobDay: {
    positive: [/birth.*day|day.*birth|date.?of.?birth.*(?:dd|day)|dob.*(?:dd|day)|geburt.*tag/],
    negative: [/card|expir|delivery/],
    autocomplete: ['bday-day'],
    min: 50
  },
  dobMonth: {
    positive: [/birth.*month|month.*birth|date.?of.?birth.*(?:mm|month)|dob.*(?:mm|month)|geburt.*monat/],
    negative: [/card|expir|delivery/],
    autocomplete: ['bday-month'],
    min: 50
  },
  dobYear: {
    positive: [/birth.*year|year.*birth|date.?of.?birth.*(?:yyyy|year)|dob.*(?:yyyy|year)|geburt.*jahr/],
    negative: [/card|expir|delivery/],
    autocomplete: ['bday-year'],
    min: 50
  },
  password: {
    positive: [/password|passwort|passwd/],
    autocomplete: ['current-password', 'new-password'],
    type: ['password'],
    min: 50
  },
  ccName: {
    positive: [/cardholder|card.?holder|name.?on.?card|card.?owner/],
    negative: [/first|last|company/],
    autocomplete: ['cc-name'],
    min: 50
  },
  ccNumber: {
    positive: [/card.?number|credit.?card|debit.?card|cc.?number/],
    negative: [/gift|voucher|member/],
    autocomplete: ['cc-number'],
    min: 50
  },
  ccMonth: {
    positive: [/exp.*month|expiry.*month|expiration.*month/],
    autocomplete: ['cc-exp-month'],
    min: 50
  },
  ccYear: {
    positive: [/exp.*year|expiry.*year|expiration.*year/],
    autocomplete: ['cc-exp-year'],
    min: 50
  },
  ccExp: {
    positive: [/exp.*date|expiry|expiration|valid.*thru|valid.*until/],
    autocomplete: ['cc-exp'],
    min: 50
  },
  ccCVC: {
    positive: [
      /\b(?:cvc|cvv|csc|cvn|cid|cav2|cv2)\b/,
      /card.?(?:verification|security).?(?:code|value|number)/,
      /(?:verification|security).?(?:code|value).?card/,
      /karten.?prufnummer|sicherheitscode.?karte/
    ],
    negative: [/password|passwort|pin|postal|coupon|gift|one.?time|otp/],
    autocomplete: ['cc-csc'],
    min: 50
  },
  iban: { positive: [/iban/], min: 42 },
  bic: { positive: [/bic|swift/], min: 42 }
};

const autofilledValues = new WeakMap();
const userTouched = new WeakSet();
const customClicks = new WeakMap();
let mutationObserver = null;
let uiInjected = false;
let activeProfileSnapshot = null;
let profilesSnapshot = [];
let customRulesSnapshot = [];
let focusFillEnabled = false;
const FIELD_CONTAINER_SELECTOR = [
  'label',
  'fieldset',
  '.field',
  '.field-wrapper',
  '.form-group',
  '.form-field',
  '.form-row',
  '.input-group',
  '.input-wrapper',
  '.input-container',
  '.control',
  '.controls',
  '[class*="field"]',
  '[class*="input"]',
  '[class*="address"]',
  'li',
  'td',
  'th',
  'section',
  'article'
].join(', ');

function n(v) {
  return String(v ?? '')
    .normalize('NFD')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[\[\](){}]+/g, ' ')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_./:-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueTexts(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const raw = String(value || '').replace(/\s+/g, ' ').trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(raw);
  }
  return out.join(' ');
}

function getSemanticAttributeText(el) {
  if (!el?.attributes) return '';
  return uniqueTexts(Array.from(el.attributes)
    .filter(attr => /^(data-|itemprop$)/.test(attr.name) && !/^data-(react|vue|ng|v)-/.test(attr.name))
    .slice(0, 24)
    .map(attr => `${attr.name} ${attr.value}`));
}

function normalizePredial(value) {
  const compact = String(value || '').trim().replace(/[^\d+]/g, '');
  if (!compact) return '';
  if (compact.startsWith('+')) return `+${compact.slice(1).replace(/\D/g, '')}`;
  const digits = compact.replace(/\D/g, '');
  return digits.startsWith('00') ? `+${digits.slice(2)}` : `+${digits}`;
}

function isVisible(el) {
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  if (!el.getClientRects().length && style.position !== 'fixed') return false;
  return true;
}

function isEditable(el) {
  if (!el || el.disabled || el.readOnly) return false;
  const tag = el.tagName;
  const contentEditable = el.getAttribute?.('contenteditable') === 'true';
  if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(tag) && !contentEditable) return false;
  if (!isVisible(el)) return false;
  const type = (el.type || '').toLowerCase();
  if (['hidden', 'submit', 'button', 'reset', 'image', 'file'].includes(type)) return false;
  return true;
}

function getFieldRoot(el) {
  const root = el?.getRootNode?.();
  return root && typeof root.querySelector === 'function' ? root : document;
}

function getSearchRoots(el) {
  const root = getFieldRoot(el);
  return root === document ? [document] : [root, document];
}

function queryNodeById(root, id) {
  if (!root || !id) return null;
  try {
    return root.querySelector(`#${CSS.escape(id)}`);
  } catch {
    return null;
  }
}

function getIdRefsText(value, el) {
  const texts = [];
  const ids = String(value || '').split(/\s+/).filter(Boolean);
  ids.forEach(id => {
    for (const root of getSearchRoots(el)) {
      const node = queryNodeById(root, id);
      if (node) {
        texts.push(node.textContent || '');
        break;
      }
    }
  });
  return uniqueTexts(texts);
}

function getClosestContainer(el) {
  return el.closest(FIELD_CONTAINER_SELECTOR) || el.parentElement;
}

function getLabelText(el) {
  const texts = [];
  if (el.labels?.length) {
    Array.from(el.labels).forEach(label => texts.push(label.textContent || ''));
  }
  if (el.id) {
    for (const root of getSearchRoots(el)) {
      const lbl = root.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (lbl) {
        texts.push(lbl.textContent || '');
        break;
      }
    }
  }
  const wrapLabel = el.closest('label');
  if (wrapLabel) texts.push(wrapLabel.textContent || '');
  texts.push(getIdRefsText(el.getAttribute('aria-labelledby'), el));

  const nearby = getClosestContainer(el);
  if (nearby) {
    const controls = nearby.querySelectorAll('input, select, textarea, [contenteditable="true"]');
    if (controls.length <= 1) {
      nearby.querySelectorAll('label, .label, .form-label, .field__label, .input-label, legend').forEach((node, index) => {
        if (index > 3) return;
        if (node === el || node.contains(el)) return;
        texts.push(node.textContent || '');
      });
    }
  }

  return n(uniqueTexts(texts));
}

function getFieldContextText(el) {
  const texts = [];
  texts.push(getIdRefsText(el.getAttribute('aria-describedby'), el));

  const fieldset = el.closest('fieldset');
  if (fieldset) {
    const legend = fieldset.querySelector('legend');
    if (legend) texts.push(legend.textContent || '');
  }

  [el.previousElementSibling, el.nextElementSibling].forEach(node => {
    if (!node || node.matches?.('input, select, textarea, label, legend')) return;
    texts.push(node.textContent || '');
  });

  const container = getClosestContainer(el);
  if (container) {
    texts.push(container.id || '');
    texts.push(container.className || '');
    texts.push(getSemanticAttributeText(container));
    container.querySelectorAll('small, .hint, .help, .description, .note, .caption').forEach((node, index) => {
      if (index > 5) return;
      if (node === el || node.contains(el)) return;
      if (node.querySelector('input, select, textarea')) return;
      texts.push(node.textContent || '');
    });
  }

  return n(uniqueTexts(texts));
}

function getDescriptorParts(el) {
  const direct = uniqueTexts([
    el.id,
    el.name,
    el.placeholder,
    el.title,
    el.getAttribute('aria-label'),
    el.getAttribute('autocomplete'),
    getSemanticAttributeText(el),
    el.getAttribute('data-testid'),
    el.getAttribute('data-test'),
    el.getAttribute('data-qa'),
    el.getAttribute('data-label'),
    el.getAttribute('role'),
    el.getAttribute('inputmode'),
    el.className
  ]);
  const label = getLabelText(el);
  const context = getFieldContextText(el);
  return {
    directText: n(direct),
    labelText: label,
    contextText: context,
    descriptor: n(`${direct} ${label} ${context}`)
  };
}

function getDescriptor(el) {
  return getDescriptorParts(el).descriptor;
}

function nativeSet(el, value) {
  if (el.getAttribute?.('contenteditable') === 'true') {
    el.textContent = value;
    return;
  }
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype :
    el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
}

function fireEvents(el, value = '') {
  el.dispatchEvent(new FocusEvent('focus', { bubbles: true, cancelable: true }));

  if (typeof InputEvent === 'function') {
    const payload = { bubbles: true, cancelable: true, data: String(value ?? ''), inputType: 'insertReplacementText' };
    el.dispatchEvent(new InputEvent('beforeinput', payload));
    el.dispatchEvent(new InputEvent('input', payload));
  } else {
    el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  }

  el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new FocusEvent('blur', { bubbles: true, cancelable: true }));
}

function isManuallyOverridden(el) {
  return userTouched.has(el);
}

function shouldSkip(el, { overwrite = false, allowPassword = false } = {}) {
  if (!isEditable(el)) return true;
  if (isManuallyOverridden(el)) return true;
  if (el.type === 'password' && !allowPassword) return true;
  if (!overwrite && !autofilledValues.has(el) && !isEffectivelyEmpty(el)) return true;
  return false;
}

function isEffectivelyEmpty(el) {
  const type = String(el.type || '').toLowerCase();
  if (type === 'checkbox' || type === 'radio') return !el.checked;
  if (el.getAttribute?.('contenteditable') === 'true') return !String(el.textContent || '').trim();
  if (el.tagName === 'SELECT') {
    if (el.selectedIndex < 0) return true;
    const option = el.options[el.selectedIndex];
    const value = String(option?.value || '').trim();
    const text = n(option?.textContent || '');
    return el.selectedIndex === 0 || !value || option?.disabled ||
      /^(select|choose|please select|country|land|staat|state|region)[ .-]*$/.test(text);
  }
  const value = String(el.value || '').trim();
  return !value || /^[\s_()+./-]+$/.test(value);
}

function attachUserTracking() {
  const mark = (e) => {
    if (!e.isTrusted) return;
    const el = e.composedPath?.()[0] || e.target;
    if (!el || !(el instanceof HTMLElement)) return;
    userTouched.add(el);
  };
  const triggerFocusedFill = (e) => {
    if (!focusFillEnabled || !activeProfileSnapshot) return;
    const el = e.composedPath?.()[0] || e.target;
    if (!el || !(el instanceof HTMLElement)) return;
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return;
    if (userTouched.has(el)) return;
    setTimeout(() => processProfile(activeProfileSnapshot).catch(() => {}), 30);
  };
  document.addEventListener('input', mark, true);
  document.addEventListener('change', mark, true);
  document.addEventListener('keydown', mark, true);
  document.addEventListener('focusin', triggerFocusedFill, true);
}

function metaFor(el, index) {
  const { descriptor, directText, labelText, contextText } = getDescriptorParts(el);
  const autocompleteRaw = String(el.getAttribute('autocomplete') || '');
  const autocompleteTokens = autocompleteRaw.split(/\s+/).map(n).filter(Boolean);
  const type = n(el.type || '');
  const optionsText = el.tagName === 'SELECT' ? n(Array.from(el.options).map(o => `${o.value} ${o.textContent}`).join(' ')) : '';
  const rect = el.getBoundingClientRect();
  const streetArrayMatch = String(el.name || '').match(/(?:street|address)\[(\d+)\]/i);
  const addressLineMatch = n(`${el.name || ''} ${el.id || ''} ${el.getAttribute('autocomplete') || ''} ${labelText}`)
    .match(/(?:address|street)(?: line)?\s*([123])\b/);
  const addressLine = streetArrayMatch
    ? Number(streetArrayMatch[1]) + 1
    : (addressLineMatch ? Number(addressLineMatch[1]) : null);
  return {
    el,
    index,
    descriptor,
    directText,
    labelText,
    contextText,
    autocomplete: n(autocompleteRaw),
    autocompleteTokens,
    type,
    tag: el.tagName.toLowerCase(),
    optionsText,
    inputMode: n(el.getAttribute('inputmode') || ''),
    pattern: String(el.getAttribute('pattern') || ''),
    placeholder: String(el.getAttribute('placeholder') || ''),
    minLength: Number(el.minLength) > 0 ? Number(el.minLength) : null,
    maxLength: Number(el.maxLength) > 0 ? Number(el.maxLength) : null,
    addressLine,
    rect,
    group: getClosestContainer(el),
    form: el.form || el.closest?.('form') || null,
    section: el.closest?.('fieldset, [class*="shipping"], [class*="billing"], [class*="delivery"], [data-address-type]') || null
  };
}

function getMetaAddressScope(meta) {
  if (hasAutocompleteToken(meta, 'billing')) return 'billing';
  if (hasAutocompleteToken(meta, 'shipping')) return 'shipping';

  const section = meta.section;
  const sectionHint = section ? [
    section.id,
    section.className,
    section.getAttribute?.('name'),
    section.getAttribute?.('data-address-type'),
    section.getAttribute?.('aria-label'),
    section.querySelector?.('legend, h1, h2, h3, h4')?.textContent
  ].join(' ') : '';
  const hint = n(`${meta.descriptor} ${sectionHint}`);
  if (/billing|invoice|invoicing|rechnung|rechnungs|facturation|factura/.test(hint)) return 'billing';
  if (/shipping|delivery|deliver|liefer|versand|expedition|spedizione/.test(hint)) return 'shipping';
  return '';
}

function patternScore(text, regexes, weight) {
  let score = 0;
  (regexes || []).forEach(rx => { if (rx.test(text)) score += weight; });
  return score;
}

function hasAutocompleteToken(meta, token) {
  return meta.autocompleteTokens.includes(n(token));
}

function score(meta, key) {
  const def = FIELD_DEFS[key];
  if (!def) return 0;
  if (meta.type === 'checkbox') return 0;
  if (meta.type === 'radio' && key !== 'salutation') return 0;
  const direct = meta.directText;
  const label = meta.labelText;
  const context = meta.contextText;
  const text = meta.descriptor;
  const strongText = n(`${direct} ${label}`);
  let s = 0;

  s += patternScore(direct, def.positive, 52);
  s += patternScore(label, def.positive, 46);
  s += patternScore(context, def.positive, 12);
  s -= patternScore(direct, def.negative, 72);
  s -= patternScore(label, def.negative, 56);
  s -= patternScore(context, def.negative, 4);

  if (def.autocomplete?.some(ac => hasAutocompleteToken(meta, ac))) s += 82;
  if (def.type?.includes(meta.type)) s += 40;

  if (meta.tag === 'select') {
    if (['country', 'state', 'salutation', 'phoneCode', 'ccMonth', 'ccYear'].includes(key)) s += 12;
    else s -= 6;
  }
  if (meta.tag === 'textarea') {
    if (key === 'streetCombined') s += 16;
    else if (key === 'streetAddition') s += 6;
    else s -= 8;
  }

  if (key === 'email' && meta.type === 'tel') s -= 200;
  if (key === 'telephone' && meta.type === 'email') s -= 200;

  if (key === 'country') {
    if (/de germany deutschland usa united states france italy spain/.test(meta.optionsText)) s += 30;
    if (/phone|dial|prefix/.test(strongText)) s -= 120;
  }
  if (key === 'state' && /region.?id|region_id/.test(text)) s += 32;
  if (key === 'streetCombined') {
    if (hasAutocompleteToken(meta, 'street-address')) s += 40;
    if (hasAutocompleteToken(meta, 'address-line1')) s += 22;
    if (/house.?number|hausnummer|street.?number|nr\b|no\b/.test(strongText)) s -= 26;
    if (/address.?line.?2|address2|suite|unit|apartment|apt\b|floor|building|zusatz|address.?lines?.?2/.test(strongText)) s -= 90;
    if (meta.maxLength && meta.maxLength >= 24) s += 10;
  }
  if (key === 'street') {
    if (/address/.test(strongText)) s += 14;
    if (/house.?number|hausnummer|street.?number/.test(strongText)) s -= 60;
    if (meta.maxLength && meta.maxLength >= 20) s += 8;
  }
  if (key === 'houseNumber') {
    if (/street.?address|address.?line.?1|address1|address$/.test(strongText)) s -= 48;
    if (/suite|unit|apartment|apt\b|floor|building|zusatz/.test(strongText)) s -= 80;
    if (meta.maxLength && meta.maxLength <= 10) s += 20;
    if (meta.inputMode === 'numeric' || meta.type === 'number') s += 22;
    if (meta.rect.width && meta.rect.width < 220) s += 12;
  }
  if (key === 'streetAddition') {
    if (hasAutocompleteToken(meta, 'address-line2')) s += 34;
    if (!meta.addressLine && /address.?line.?1|address1|street.?address|address.?lines?.?(0|1)/.test(strongText)) s -= 70;
  }
  if (key === 'addressLine3' && /address.?line.?2|address2/.test(strongText)) s -= 100;
  if (key === 'district') {
    if (/\bdistrict\b|neighbou?rhood|borough|stadtteil|bezirk|ortsteil|quartier|barrio/.test(strongText)) s += 28;
    if (/state|province|region|country/.test(strongText)) s -= 90;
  }
  if (key === 'city' && /\bdistrict\b|neighbou?rhood|borough|stadtteil|bezirk|ortsteil/.test(strongText)) s -= 90;
  if (key === 'middleName' && /first|given|last|family|surname/.test(strongText)) s -= 90;
  if (key === 'firstName' && /male\b|female\b|gender|salutation|anrede/.test(strongText)) s -= 200;
  if (key === 'email' && /male\b|female\b|gender|salutation|anrede/.test(strongText)) s -= 200;
  if (key === 'postcode' && /city|stadt|town|ort/.test(strongText)) s -= 160;
  if (key === 'city' && /zip|postal|postcode|plz/.test(strongText)) s -= 160;
  if (key === 'postcode') {
    if (meta.maxLength && meta.maxLength <= 12) s += 18;
    if (meta.inputMode === 'numeric' || meta.type === 'number') s += 10;
  }
  if (key === 'city' && meta.maxLength && meta.maxLength >= 20) s += 6;
  if ((key === 'firstName' || key === 'lastName') && meta.type === 'password') s -= 500;
  if ((key === 'firstName' || key === 'lastName') && /password|passwort/.test(strongText)) s -= 500;
  if ((key === 'street' || key === 'streetCombined') && /first.?name|last.?name|company/.test(strongText)) s -= 300;
  if (key === 'fullName' && /first.?name|last.?name|given.?name|family.?name|surname|nachname/.test(strongText)) s -= 120;
  if (key === 'fullName' && /cardholder|card.?holder|name.?on.?card/.test(strongText)) s -= 120;
  if (key === 'ccName' && /first.?name|last.?name/.test(strongText)) s -= 120;
  if (key === 'telephone' && /country\b/.test(strongText) && !/phone|tel|mobile/.test(strongText)) s -= 80;
  if (key === 'phoneCode' && /country\b/.test(strongText) && !/code|dial|prefix/.test(strongText)) s -= 80;
  if (key === 'telephone') {
    if (hasAutocompleteToken(meta, 'tel-national')) s += 24;
    if (hasAutocompleteToken(meta, 'tel')) s += 12;
    if (meta.inputMode === 'tel') s += 20;
  }
  if (key === 'phoneCode') {
    if (hasAutocompleteToken(meta, 'tel-country-code')) s += 36;
    if (meta.maxLength && meta.maxLength <= 6) s += 14;
  }
  if (meta.addressLine && meta.addressLine >= 2 && ['streetCombined', 'street'].includes(key)) s = 0;
  if (meta.addressLine === 1 && key === 'streetAddition') s = 0;
  if (meta.addressLine === 2 && key === 'addressLine3') s = 0;
  if (meta.addressLine >= 3 && key === 'streetAddition') s = 0;
  if (key === 'birthDate') {
    if (meta.type === 'date') s += 36;
    if (hasAutocompleteToken(meta, 'bday')) s += 36;
  }
  if (key === 'dobDay' && meta.maxLength && meta.maxLength <= 2) s += 14;
  if (key === 'dobMonth' && meta.maxLength && meta.maxLength <= 2) s += 14;
  if (key === 'dobYear' && meta.maxLength && meta.maxLength >= 4) s += 14;
  if (['birthDate', 'dobDay', 'dobMonth', 'dobYear'].includes(key) && /card|expir|valid.?thru/.test(strongText)) s -= 180;
  if (['ccMonth', 'ccYear', 'ccExp'].includes(key) && /birth|birthday|dob\b|geburt/.test(strongText)) s -= 180;

  return Math.max(0, s);
}

function normalizeValueForCompare(value) {
  return n(String(value || '')).replace(/\s+/g, ' ').trim();
}

function valuesMatch(actual, expected) {
  return normalizeValueForCompare(actual) === normalizeValueForCompare(expected);
}

function fieldValuesMatch(actual, expected, key) {
  if (['telephone', 'phoneCode', 'ccNumber', 'iban'].includes(key)) {
    const actualCompact = String(actual || '').replace(/[\s()+./-]/g, '').toLowerCase();
    const expectedCompact = String(expected || '').replace(/[\s()+./-]/g, '').toLowerCase();
    return actualCompact === expectedCompact;
  }
  return valuesMatch(actual, expected);
}

function tryFocus(el) {
  try { el.focus({ preventScroll: true }); }
  catch {
    try { el.focus(); } catch {}
  }
}

function tryBlur(el) {
  try { el.blur(); } catch {}
}

function getCountryNames(countryCode) {
  const code = String(countryCode || '').trim().toUpperCase();
  const labels = [code, COUNTRY_LABELS[code]];
  const pageLocale = typeof document !== 'undefined' ? document.documentElement?.lang : '';
  const browserLocales = typeof navigator !== 'undefined' ? navigator.languages : [];
  const locales = uniqueTexts([pageLocale, ...(browserLocales || []), 'en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt'])
    .split(/\s+/)
    .filter(Boolean);

  if (typeof Intl?.DisplayNames === 'function' && /^[A-Z]{2}$/.test(code)) {
    for (const locale of locales) {
      try {
        labels.push(new Intl.DisplayNames([locale], { type: 'region' }).of(code));
      } catch {}
    }
  }
  return Array.from(new Set(labels.filter(Boolean).map(n)));
}

function numericOptionValue(option) {
  const valueMatch = String(option.value || '').match(/\d{1,4}/);
  const textMatch = String(option.textContent || '').match(/\d{1,4}/);
  return Number(valueMatch?.[0] || textMatch?.[0] || NaN);
}

function findSelectOption(el, value, key) {
  const opts = Array.from(el.options).filter(option => !option.disabled);
  const target = String(value || '').trim();
  const targetNorm = n(target);
  if (!targetNorm) return null;

  let option = opts.find(o => n(o.value) === targetNorm || n(o.textContent) === targetNorm);
  if (!option && key === 'country') {
    const countryNames = getCountryNames(target);
    option = opts.find(o => {
      const optionValue = n(o.value);
      const optionText = n(o.textContent);
      return countryNames.some(name =>
        optionValue === name ||
        optionText === name ||
        (name.length >= 4 && optionText.includes(name))
      );
    });
  }
  if (!option && key === 'state') {
    option = opts.find(o =>
      n(o.value) === targetNorm ||
      n(o.textContent) === targetNorm ||
      (targetNorm.length >= 4 && n(o.textContent).includes(targetNorm))
    );
  }
  if (!option && key === 'salutation') {
    const female = /^(female|frau|mrs|ms|miss|woman|weiblich)$/.test(targetNorm);
    const male = /^(male|herr|mr|mister|man|mannlich)$/.test(targetNorm);
    option = opts.find(o => {
      const candidate = n(`${o.value} ${o.textContent}`);
      if (female) return /(?:^|\s)(female|frau|mrs|ms|miss|woman|weiblich)(?:\s|$)/.test(candidate);
      if (male) return /(?:^|\s)(male|herr|mr|mister|man|mannlich)(?:\s|$)/.test(candidate) && !/(?:^|\s)female(?:\s|$)/.test(candidate);
      return false;
    });
  }
  if (!option && ['ccMonth', 'dobMonth'].includes(key)) {
    const month = Number(target);
    if (month >= 1 && month <= 12) option = opts.find(o => numericOptionValue(o) === month);
  }
  if (!option && ['ccYear', 'dobYear'].includes(key)) {
    const year = Number(target);
    option = opts.find(o => {
      const candidate = numericOptionValue(o);
      return candidate === year || candidate === year % 100;
    });
  }
  if (!option && key === 'phoneCode') {
    const dialDigits = target.replace(/\D/g, '');
    if (dialDigits) {
      option = opts.find(o => {
        const valueDigits = String(o.value || '').replace(/\D/g, '');
        const text = String(o.textContent || '');
        return valueDigits === dialDigits || new RegExp(`\\+\\s*${dialDigits}(?:\\D|$)`).test(text);
      });
    }
  }
  return option || null;
}

function nativeSetChecked(el, checked) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked')?.set;
  if (setter) setter.call(el, checked);
  else el.checked = checked;
}

function choiceMatches(el, value, key) {
  const desired = n(value);
  const candidate = n(`${el.value || ''} ${getLabelText(el)} ${el.getAttribute('aria-label') || ''}`);
  if (key === 'salutation') {
    const female = /^(female|frau|mrs|ms|miss|woman|weiblich)$/.test(desired);
    if (female) return /(?:^|\s)(female|frau|mrs|ms|miss|woman|weiblich)(?:\s|$)/.test(candidate);
    const male = /^(male|herr|mr|mister|man|mannlich)$/.test(desired);
    if (male) return /(?:^|\s)(male|herr|mr|mister|man|mannlich)(?:\s|$)/.test(candidate) && !/(?:^|\s)female(?:\s|$)/.test(candidate);
  }
  return candidate === desired || candidate.split(' ').includes(desired);
}

function fillChoice(el, value, key, options) {
  const type = String(el.type || '').toLowerCase();
  let checked;
  if (type === 'radio') {
    if (!choiceMatches(el, value, key)) return false;
    checked = true;
  } else {
    const normalized = n(value);
    checked = !['', '0', 'false', 'no', 'off', 'unchecked'].includes(normalized);
  }
  if (el.checked === checked) return true;
  if (shouldSkip(el, options) && el.checked !== checked) return false;
  tryFocus(el);
  nativeSetChecked(el, checked);
  autofilledValues.set(el, String(checked));
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  tryBlur(el);
  return true;
}

function reinforceValue(el, value, key, attempt = 0) {
  if (!el?.isConnected || userTouched.has(el)) return;
  const current = el.getAttribute?.('contenteditable') === 'true' ? String(el.textContent || '') : String(el.value || '');
  if (fieldValuesMatch(current, value, key)) return;

  if (el.tagName === 'SELECT') {
    const option = findSelectOption(el, value, key);
    if (!option) return;
    tryFocus(el);
    nativeSet(el, option.value);
    if ('setAttribute' in el) el.setAttribute('value', option.value);
    autofilledValues.set(el, option.value);
    fireEvents(el, option.value);
    tryBlur(el);
  } else {
    tryFocus(el);
    nativeSet(el, value);
    if ('setAttribute' in el && el.getAttribute?.('contenteditable') !== 'true') el.setAttribute('value', String(value));
    autofilledValues.set(el, String(value));
    fireEvents(el, String(value));
    tryBlur(el);
  }

  if (attempt >= 2) return;
  setTimeout(() => reinforceValue(el, value, key, attempt + 1), attempt === 0 ? 80 : 220);
}

function fillSelect(el, value, key, options) {
  if (shouldSkip(el, options)) return false;
  const option = findSelectOption(el, value, key);
  if (!option) return false;
  if (String(el.value) === String(option.value)) return true;
  tryFocus(el);
  nativeSet(el, option.value);
  if ('setAttribute' in el) el.setAttribute('value', option.value);
  autofilledValues.set(el, option.value);
  fireEvents(el, option.value);
  tryBlur(el);
  setTimeout(() => reinforceValue(el, option.value, key, 1), 80);
  return true;
}

function fillField(el, value, key, options = {}) {
  if (!el || value == null || String(value).trim() === '' || shouldSkip(el, options)) return false;
  const type = String(el.type || '').toLowerCase();
  if (type === 'checkbox' || type === 'radio') return fillChoice(el, value, key, options);
  if (el.tagName === 'SELECT') return fillSelect(el, value, key, options);
  const current = el.getAttribute?.('contenteditable') === 'true' ? el.textContent : el.value;
  if (fieldValuesMatch(current, value, key)) return true;
  tryFocus(el);
  nativeSet(el, value);
  if ('setAttribute' in el && el.getAttribute?.('contenteditable') !== 'true') el.setAttribute('value', String(value));
  autofilledValues.set(el, String(value));
  fireEvents(el, String(value));
  tryBlur(el);
  setTimeout(() => reinforceValue(el, String(value), key, 0), 80);
  return true;
}

function normalizeAddress(raw = {}, fallback = {}) {
  const source = { ...fallback, ...(raw || {}) };
  const country = /^(country|land)$/i.test(String(source.country || '').trim()) ? '' : String(source.country || '').trim();
  const address = {
    street: String(source.street || '').trim(),
    houseNumber: String(source.houseNumber || '').trim(),
    addressLine2: String(source.addressLine2 ?? source.streetAddition ?? '').trim(),
    addressLine3: String(source.addressLine3 || '').trim(),
    apartment: String(source.apartment || '').trim(),
    floor: String(source.floor || '').trim(),
    building: String(source.building || '').trim(),
    postcode: String(source.postcode || '').trim(),
    city: String(source.city || '').trim(),
    district: String(source.district || '').trim(),
    state: String(source.state || '').trim(),
    country
  };
  address.streetLine1 = [address.street, address.houseNumber].filter(Boolean).join(' ').trim();
  return address;
}

function joinUnique(values) {
  const seen = new Set();
  return values
    .map(value => String(value || '').trim())
    .filter(value => {
      const key = n(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(', ');
}

function normalizeProfile(raw) {
  const p = { ...(raw || {}) };
  const isCompany = n(p.type) === 'company';
  if (!isCompany) {
    p.companyName = '';
    p.vatId = '';
  }
  p.preDial = normalizePredial(p.preDial || p.predial || '');
  p.fullName = [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim();

  const legacyAddress = {
    street: p.street,
    houseNumber: p.houseNumber,
    addressLine2: p.streetAddition,
    addressLine3: p.addressLine3,
    apartment: p.apartment,
    floor: p.floor,
    building: p.building,
    postcode: p.postcode,
    city: p.city,
    district: p.district,
    state: p.state,
    country: p.country
  };
  p.shipping = normalizeAddress(p.shipping, legacyAddress);
  p.billingSameAsShipping = p.billingSameAsShipping !== false;
  p.billing = p.billingSameAsShipping
    ? { ...p.shipping }
    : normalizeAddress(p.billing, p.shipping);
  p.streetLine1 = p.shipping.streetLine1;
  p.streetLine2 = p.shipping.addressLine2;

  const telRaw = String(p.telephone || '').trim();
  const digits = telRaw.replace(/\D/g, '');
  const dialDigits = p.preDial.replace(/\D/g, '');
  let nationalDigits = digits;
  if (dialDigits && digits.startsWith(dialDigits) && (/^\s*\+/.test(telRaw) || !/^0/.test(telRaw))) {
    nationalDigits = digits.slice(dialDigits.length);
  }
  p.telephoneRaw = telRaw;
  p.telephoneNational = nationalDigits || telRaw;
  p.telephoneNationalSignificant = String(nationalDigits || '').replace(/^0+/, '');
  p.telephoneIntl = p.preDial && (nationalDigits || digits)
    ? `${p.preDial}${String(nationalDigits || digits).replace(/^0+/, '')}`
    : (/^\s*\+/.test(telRaw) ? `+${digits}` : '');
  p.telephoneFull = p.telephoneIntl || telRaw || p.telephoneNational;

  const dob = p.dateOfBirth || {};
  if (dob.year && dob.month && dob.day) {
    p.birthDate = `${String(dob.year).padStart(4, '0')}-${String(dob.month).padStart(2, '0')}-${String(dob.day).padStart(2, '0')}`;
  } else {
    p.birthDate = '';
  }
  return p;
}

function addressValues(address, prefix = '') {
  const key = name => prefix ? `${prefix}${name[0].toUpperCase()}${name.slice(1)}` : name;
  return {
    [key('streetCombined')]: address.streetLine1,
    [key('streetLine1')]: address.streetLine1,
    [key('street')]: address.street,
    [key('houseNumber')]: address.houseNumber,
    [key('streetAddition')]: address.addressLine2,
    [key('addressLine2')]: address.addressLine2,
    [key('addressLine3')]: address.addressLine3,
    [key('apartment')]: address.apartment,
    [key('floor')]: address.floor,
    [key('building')]: address.building,
    [key('postcode')]: address.postcode,
    [key('city')]: address.city,
    [key('district')]: address.district,
    [key('state')]: address.state,
    [key('country')]: address.country
  };
}

function buildValueMap(profile, addressType = 'shipping') {
  const dob = profile.dateOfBirth || {};
  const ccYearShort = profile.creditcardYear ? String(profile.creditcardYear).slice(-2) : '';
  const address = profile[addressType] || profile.shipping || normalizeAddress(profile);
  return {
    salutation: profile.salutation,
    companyName: profile.companyName,
    vatId: profile.vatId,
    firstName: profile.firstName,
    middleName: profile.middleName,
    lastName: profile.lastName,
    fullName: profile.fullName,
    email: profile.email,
    preDial: profile.preDial,
    phoneCode: profile.preDial,
    telephone: profile.telephoneFull,
    telephoneFull: profile.telephoneFull,
    telephoneRaw: profile.telephoneRaw,
    telephoneNational: profile.telephoneNational,
    telephoneNationalSignificant: profile.telephoneNationalSignificant,
    telephoneIntl: profile.telephoneIntl,
    ...addressValues(address),
    ...addressValues(profile.shipping || address, 'shipping'),
    ...addressValues(profile.billing || address, 'billing'),
    ccName: profile.fullName,
    ccNumber: profile.creditcardNumber,
    ccMonth: profile.creditcardMonth,
    ccYear: profile.creditcardYear,
    ccExp: profile.creditcardMonth && profile.creditcardYear ? `${String(profile.creditcardMonth).padStart(2, '0')}/${ccYearShort}` : '',
    ccCVC: profile.creditcardCVC,
    iban: profile.bankIban,
    bic: profile.bankBic,
    birthDate: profile.birthDate,
    dobDay: dob.day,
    dobMonth: dob.month,
    dobYear: dob.year,
    day: dob.day,
    month: dob.month,
    year: dob.year
  };
}

function getExtensionShadowRoot(element) {
  if (!element) return null;
  if (element.shadowRoot) return element.shadowRoot;
  try {
    return typeof chrome !== 'undefined' && chrome.dom?.openOrClosedShadowRoot
      ? chrome.dom.openOrClosedShadowRoot(element)
      : null;
  } catch {
    return null;
  }
}

function collectFormFields(root, collected = [], seen = new Set()) {
  if (!root || typeof root.querySelectorAll !== 'function') return collected;

  root.querySelectorAll('input, select, textarea, [contenteditable="true"]').forEach(el => {
    if (seen.has(el)) return;
    seen.add(el);
    collected.push(el);
  });

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node = walker.currentNode;
  while (node) {
    const shadowRoot = getExtensionShadowRoot(node);
    if (shadowRoot) collectFormFields(shadowRoot, collected, seen);
    node = walker.nextNode();
  }

  return collected;
}

function getMetas() {
  return collectFormFields(document)
    .filter(isEditable)
    .map(metaFor);
}

function rankCandidates(metas, key, used = new Set(), hardMin, limit = 6) {
  const min = hardMin ?? FIELD_DEFS[key]?.min ?? 80;
  return metas
    .filter(meta => !used.has(meta.el))
    .map(meta => ({ meta, score: score(meta, key) }))
    .filter(candidate => candidate.score >= min)
    .sort((a, b) => b.score - a.score || a.meta.index - b.meta.index)
    .slice(0, limit);
}

function best(metas, key, used, hardMin) {
  return rankCandidates(metas, key, used, hardMin, 1)[0] || null;
}

function fillAssigned(assignments, values, metas) {
  const filled = new Set();
  for (const [key, meta] of Object.entries(assignments)) {
    if (!meta) continue;
    const value = valueForMeta(meta, key, values, metas);
    if (fillField(meta.el, value, key, coreFillOptions(key))) filled.add(meta.el);
  }
  return filled;
}

function coreFillOptions(key) {
  const options = { overwrite: key === 'country' || key === 'state' };
  if (key === 'ccCVC') options.allowPassword = true;
  return options;
}

function metasAreRelated(a, b) {
  if (!a || !b || a.el === b.el) return false;
  if (a.form && b.form && a.form !== b.form) return false;
  if (a.section && b.section && a.section !== b.section) return false;
  const aScope = getMetaAddressScope(a);
  const bScope = getMetaAddressScope(b);
  if (aScope && bScope && aScope !== bScope) return false;
  if (a.section && b.section && a.section === b.section) return true;
  if (a.group && b.group && a.group === b.group) return true;
  const indexGap = Math.abs(a.index - b.index);
  const verticalGap = Math.abs((a.rect?.top || 0) - (b.rect?.top || 0));
  return indexGap <= 6 || verticalGap <= 360;
}

function hasRelatedField(metas, meta, key, min = FIELD_DEFS[key]?.min ?? 42) {
  return metas.some(candidate =>
    candidate.el !== meta.el &&
    metasAreRelated(meta, candidate) &&
    score(candidate, key) >= min
  );
}

function valueForMeta(meta, key, values, metas = []) {
  if (key === 'telephone') {
    const hasSeparateCode = Boolean(String(values.phoneCode || '').trim()) && (
      hasAutocompleteToken(meta, 'tel-national') ||
      hasRelatedField(metas, meta, 'phoneCode', FIELD_DEFS.phoneCode.min)
    );
    const placeholder = String(meta.placeholder || '');
    const wantsInternational = /\+\s*\d|country.?code|international/i.test(placeholder) ||
      /\\\+|\^\s*\+/.test(meta.pattern || '');
    const hintsLeadingZero = /(?:^|\D)0\d{2,}/.test(placeholder);

    if (wantsInternational) return values.telephoneIntl || values.telephoneRaw || values.telephone;
    if (hasSeparateCode) {
      if (hintsLeadingZero) return values.telephoneNational || values.telephoneRaw;
      return values.telephoneNationalSignificant || values.telephoneNational || values.telephoneRaw;
    }
    if (meta.maxLength) {
      const intlLength = String(values.telephoneIntl || '').replace(/\D/g, '').length;
      const nationalLength = String(values.telephoneRaw || values.telephoneNational || '').replace(/\D/g, '').length;
      if (intlLength > meta.maxLength && nationalLength <= meta.maxLength) {
        return values.telephoneRaw || values.telephoneNational;
      }
    }
    return values.telephoneIntl || values.telephoneRaw || values.telephone;
  }

  if (key === 'ccExp' && meta.type === 'month') {
    const year = String(values.ccYear || '');
    const month = String(values.ccMonth || '').padStart(2, '0');
    return year && month ? `${year}-${month}` : values.ccExp;
  }
  if (key === 'ccNumber' && (meta.inputMode === 'numeric' || meta.maxLength === 16)) {
    return String(values.ccNumber || '').replace(/\D/g, '');
  }
  if (key === 'ccCVC') {
    return String(values.ccCVC || '').replace(/\D/g, '').slice(0, 4);
  }
  if (key === 'iban' && meta.maxLength && meta.maxLength <= 34) {
    return String(values.iban || '').replace(/\s/g, '');
  }
  return values[key];
}

function proximityBonus(a, b) {
  const rowGap = Math.abs(a.rect.top - b.rect.top);
  const columnGap = Math.abs(a.rect.left - b.rect.left);
  let bonus = 0;

  if (rowGap <= (Math.max(a.rect.height || 0, b.rect.height || 0) * 1.3) + 6) bonus += 28;
  else if (rowGap <= 72) bonus += 8;

  if (columnGap <= 420) bonus += 14;
  if (Math.abs(a.index - b.index) <= 2) bonus += 18;
  else if (Math.abs(a.index - b.index) <= 5) bonus += 8;

  if (a.group && b.group && a.group === b.group) bonus += 24;
  if (a.rect.width && b.rect.width && b.rect.width < a.rect.width * 0.65) bonus += 10;

  return bonus;
}

function findBestPair(primaryCandidates, secondaryCandidates, bonusFn = () => 0) {
  let winner = null;
  let winnerScore = 0;
  for (const primary of primaryCandidates) {
    for (const secondary of secondaryCandidates) {
      if (primary.meta.el === secondary.meta.el) continue;
      const pairScore = primary.score + secondary.score + bonusFn(primary.meta, secondary.meta);
      if (pairScore > winnerScore) {
        winner = { primary, secondary, score: pairScore };
        winnerScore = pairScore;
      }
    }
  }
  return winner;
}

function assignSingleFields(metas, values, used, assignments, keys) {
  for (const key of keys) {
    if (!String(values[key] || '').trim()) continue;
    const found = best(metas, key, used);
    if (!found) continue;
    assignments[key] = found.meta;
    if (key !== 'phoneCode') used.add(found.meta.el);
  }
}

function assignNameFields(metas, values, used, assignments) {
  const firstCandidates = String(values.firstName || '').trim() ? rankCandidates(metas, 'firstName', used, 74, 5) : [];
  const middleCandidates = String(values.middleName || '').trim() ? rankCandidates(metas, 'middleName', used, 74, 5) : [];
  const lastCandidates = String(values.lastName || '').trim() ? rankCandidates(metas, 'lastName', used, 74, 5) : [];
  const fullCandidates = String(values.fullName || '').trim() ? rankCandidates(metas, 'fullName', used, 80, 5) : [];

  const pair = firstCandidates.length && lastCandidates.length
    ? findBestPair(firstCandidates, lastCandidates, proximityBonus)
    : null;

  if (pair && pair.primary.score >= 78 && pair.secondary.score >= 78) {
    assignments.firstName = pair.primary.meta;
    assignments.lastName = pair.secondary.meta;
    used.add(pair.primary.meta.el);
    used.add(pair.secondary.meta.el);
    const middle = middleCandidates.find(candidate => !used.has(candidate.meta.el));
    if (middle) {
      assignments.middleName = middle.meta;
      used.add(middle.meta.el);
    }
    return;
  }

  const first = firstCandidates[0];
  if (first) {
    assignments.firstName = first.meta;
    used.add(first.meta.el);
  }

  const last = lastCandidates.find(candidate => !used.has(candidate.meta.el));
  if (last) {
    assignments.lastName = last.meta;
    used.add(last.meta.el);
  }

  const middle = middleCandidates.find(candidate => !used.has(candidate.meta.el));
  if (middle) {
    assignments.middleName = middle.meta;
    used.add(middle.meta.el);
  }

  if ((!assignments.firstName || !assignments.lastName) && fullCandidates.length) {
    const full = fullCandidates.find(candidate => !used.has(candidate.meta.el));
    if (full) {
      assignments.fullName = full.meta;
      used.add(full.meta.el);
    }
  }
}

function assignAddressFields(metas, values, used, assignments) {
  if (!String(values.streetCombined || values.street || '').trim()) return;

  const combinedCandidates = rankCandidates(metas, 'streetCombined', used, 72, 6);
  const streetCandidates = rankCandidates(metas, 'street', used, 70, 6);
  const houseCandidates = rankCandidates(metas, 'houseNumber', used, 64, 6);
  const bestCombined = combinedCandidates[0];
  const bestStreet = streetCandidates[0];
  const pair = streetCandidates.length && houseCandidates.length
    ? findBestPair(streetCandidates, houseCandidates, proximityBonus)
    : null;

  const combinedLooksStrong = Boolean(bestCombined && bestCombined.score >= 86);
  const pairLooksStrong = Boolean(pair && pair.primary.score >= 78 && pair.secondary.score >= 68 && pair.score >= 172);
  const preferSplit = pairLooksStrong && (!combinedLooksStrong || pair.score >= bestCombined.score + 12);

  if (preferSplit) {
    assignments.street = pair.primary.meta;
    used.add(pair.primary.meta.el);
    if (String(values.houseNumber || '').trim()) {
      assignments.houseNumber = pair.secondary.meta;
      used.add(pair.secondary.meta.el);
    }
  } else if (bestCombined) {
    assignments.streetCombined = bestCombined.meta;
    used.add(bestCombined.meta.el);
  } else if (bestStreet) {
    assignments.streetCombined = bestStreet.meta;
    used.add(bestStreet.meta.el);
  }

  if (assignments.street && !assignments.houseNumber && String(values.streetCombined || '').trim()) {
    // Only one trustworthy street-like field was found: fill street + house number into that field.
    assignments.streetCombined = assignments.street;
    assignments.street = null;
  }

  if (assignments.streetCombined) assignments.houseNumber = null;

  assignSingleFields(metas, values, used, assignments, [
    'addressLine3', 'apartment', 'floor', 'building'
  ]);

  const explicitLine2 = String(values.addressLine2 || '').trim();
  values.streetAddition = joinUnique([
    explicitLine2,
    assignments.addressLine3 ? '' : values.addressLine3,
    assignments.apartment ? '' : values.apartment,
    assignments.floor ? '' : values.floor,
    assignments.building ? '' : values.building
  ]);
  const additionCandidates = String(values.streetAddition || '').trim()
    ? rankCandidates(metas, 'streetAddition', used, 74, 4)
    : [];
  const addition = additionCandidates.find(candidate => !used.has(candidate.meta.el));
  if (addition) {
    assignments.streetAddition = addition.meta;
    used.add(addition.meta.el);
  }
}

function assignCoreFields(metas, profile, addressType = 'shipping') {
  const values = buildValueMap(profile, addressType);
  const used = new Set();
  const assignments = {};

  assignSingleFields(metas, values, used, assignments, [
    'salutation', 'companyName', 'vatId', 'email', 'phoneCode', 'telephone'
  ]);
  assignNameFields(metas, values, used, assignments);
  assignAddressFields(metas, values, used, assignments);
  assignSingleFields(metas, values, used, assignments, [
    'postcode', 'city', 'district', 'country', 'state',
    'birthDate', 'dobDay', 'dobMonth', 'dobYear',
    'ccName', 'ccNumber', 'ccMonth', 'ccYear', 'ccExp', 'ccCVC', 'iban', 'bic'
  ]);

  return { assignments, values };
}

const REPEATABLE_KEYS = [
  'salutation', 'companyName', 'vatId',
  'firstName', 'middleName', 'lastName', 'fullName', 'email',
  'phoneCode', 'telephone',
  'streetCombined', 'street', 'houseNumber', 'streetAddition',
  'addressLine3', 'apartment', 'floor', 'building',
  'postcode', 'city', 'district', 'state', 'country',
  'birthDate', 'dobDay', 'dobMonth', 'dobYear',
  'ccName', 'ccNumber', 'ccMonth', 'ccYear', 'ccExp', 'ccCVC',
  'iban', 'bic'
];

function fieldFamily(key) {
  if (['streetCombined', 'street', 'houseNumber', 'streetAddition', 'addressLine3', 'apartment', 'floor', 'building'].includes(key)) return 'address-line';
  if (['firstName', 'middleName', 'lastName', 'fullName'].includes(key)) return 'name';
  if (['phoneCode', 'telephone'].includes(key)) return 'phone';
  if (['birthDate', 'dobDay', 'dobMonth', 'dobYear'].includes(key)) return 'birth';
  if (['ccMonth', 'ccYear', 'ccExp'].includes(key)) return 'card-expiry';
  return key;
}

function bestRepeatableKey(meta, metas, values) {
  const candidates = REPEATABLE_KEYS
    .filter(key => String(values[key] ?? '').trim())
    .map(key => ({ key, score: score(meta, key) }))
    .filter(candidate => candidate.score >= (FIELD_DEFS[candidate.key]?.min ?? 42))
    .sort((a, b) => b.score - a.score);

  if (!candidates.length) return null;
  let winner = candidates[0];

  if (['streetCombined', 'street'].includes(winner.key)) {
    const splitAddress = hasRelatedField(metas, meta, 'houseNumber', FIELD_DEFS.houseNumber.min);
    winner = {
      key: splitAddress ? 'street' : 'streetCombined',
      score: Math.max(score(meta, 'street'), score(meta, 'streetCombined'))
    };
  }

  const runnerUp = candidates.find(candidate => candidate.key !== winner.key);
  const hasMachineHint = (FIELD_DEFS[winner.key]?.autocomplete || []).some(token => hasAutocompleteToken(meta, token)) ||
    (FIELD_DEFS[winner.key]?.type || []).includes(meta.type);
  if (runnerUp &&
      fieldFamily(runnerUp.key) !== fieldFamily(winner.key) &&
      winner.score - runnerUp.score < 10 &&
      !hasMachineHint) {
    return null;
  }
  return winner;
}

function fallbackPass(metas, profile, filledSet = new Set(), addressType = 'shipping') {
  const values = buildValueMap(profile, addressType);
  for (const meta of metas) {
    if (filledSet.has(meta.el) && !isEffectivelyEmpty(meta.el)) continue;
    if (!isEditable(meta.el) || isManuallyOverridden(meta.el)) continue;
    const match = bestRepeatableKey(meta, metas, values);
    if (!match) continue;
    const options = coreFillOptions(match.key);
    if (shouldSkip(meta.el, options)) continue;
    const value = valueForMeta(meta, match.key, values, metas);
    if (fillField(meta.el, value, match.key, options)) {
      filledSet.add(meta.el);
    }
  }
  return filledSet;
}

function fillScope(metas, profile, addressType, filledSet) {
  if (!metas.length) return filledSet;
  const { assignments, values } = assignCoreFields(metas, profile, addressType);
  fillAssigned(assignments, values, metas).forEach(el => filledSet.add(el));
  return fallbackPass(metas, profile, filledSet, addressType);
}

async function delayedDynamicPass(profile, filledSet) {
  await new Promise(r => setTimeout(r, 400));
  const metas2 = getMetas();
  const billingMetas = metas2.filter(meta => getMetaAddressScope(meta) === 'billing');
  const shippingMetas = metas2.filter(meta => getMetaAddressScope(meta) !== 'billing');
  fillScope(shippingMetas, profile, 'shipping', filledSet);
  fillScope(billingMetas, profile, 'billing', filledSet);
}

function resolveCustomValue(rule, profile) {
  if (rule.action === 'click' || rule.type === 'click') return null;
  const sourceType = rule.sourceType || (rule.fixedValue != null ? 'fixed' : 'profile');
  const key = rule.valueKey || rule.value;
  if (sourceType === 'fixed') return rule.fixedValue ?? rule.value ?? '';
  if (key === 'telephone') return profile.telephone || '';
  const map = buildValueMap(profile);
  return map[key] ?? profile[key] ?? profile.dateOfBirth?.[key] ?? '';
}

function wildcardRegex(pattern) {
  const escaped = String(pattern).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

function matchesRuleUrl(pattern) {
  const patterns = String(pattern || '').split(/[\n,]+/).map(value => value.trim()).filter(Boolean);
  if (!patterns.length) return true;
  return patterns.some(value => {
    if (value === '*') return true;
    if (!/[/:]/.test(value)) {
      const host = location.hostname.toLowerCase();
      const domain = value.replace(/^\*\./, '').toLowerCase();
      return host === domain || host.endsWith(`.${domain}`);
    }
    try {
      return wildcardRegex(value).test(location.href);
    } catch {
      return false;
    }
  });
}

function querySelectorAllDeep(selector, root = document, found = [], seen = new Set()) {
  if (!selector || !root || typeof root.querySelectorAll !== 'function') return found;
  root.querySelectorAll(selector).forEach(node => {
    if (!seen.has(node)) {
      seen.add(node);
      found.push(node);
    }
  });
  root.querySelectorAll('*').forEach(node => {
    const shadowRoot = getExtensionShadowRoot(node);
    if (shadowRoot) querySelectorAllDeep(selector, shadowRoot, found, seen);
  });
  return found;
}

async function applyCustomRules(profile) {
  for (const rule of customRulesSnapshot) {
    if (rule.enabled === false || !matchesRuleUrl(rule.urlPattern)) continue;
    const targetProfile = rule.profile || 'All profiles';
    if (targetProfile !== 'All profiles' && targetProfile !== profile.title) continue;

    let nodes = [];
    try {
      nodes = querySelectorAllDeep(rule.cssSelector || '');
    } catch {
      continue;
    }
    if (!nodes.length) continue;

    const action = rule.action || rule.type;
    if (action === 'click') {
      const ruleKey = rule.id || `${rule.urlPattern || '*'}|${rule.cssSelector}`;
      nodes.forEach(node => {
        const previous = customClicks.get(node) || new Set();
        if (previous.has(ruleKey)) return;
        previous.add(ruleKey);
        customClicks.set(node, previous);
        node.click?.();
      });
      continue;
    }

    const value = resolveCustomValue(rule, profile);
    const overwrite = rule.fillMode === 'overwrite';
    nodes.forEach(node => fillField(node, value, 'custom', { overwrite }));
  }
}

async function processProfile(rawProfile) {
  const profile = normalizeProfile(rawProfile);
  const metas = getMetas();
  if (metas.length) {
    const billingMetas = metas.filter(meta => getMetaAddressScope(meta) === 'billing');
    const shippingMetas = metas.filter(meta => getMetaAddressScope(meta) !== 'billing');
    const filled = new Set();
    fillScope(shippingMetas, profile, 'shipping', filled);
    fillScope(billingMetas, profile, 'billing', filled);
    await delayedDynamicPass(profile, filled);
  }
  await applyCustomRules(profile);
}

function createSlimLauncher(profile) {
  if (uiInjected || !document.body) return;
  uiInjected = true;

  const host = document.createElement('div');
  host.id = 'ext-autofill-launcher';
  Object.assign(host.style, { position: 'fixed', right: '0', top: '42%', zIndex: '2147483647' });
  const shadow = host.attachShadow({ mode: 'open' });

  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  wrapper.innerHTML = `
    <div class="panel hidden" role="dialog" aria-label="Autofill">
      <div class="panel-head">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="m4.5 19.5 4.2-1 10-10a2.1 2.1 0 0 0-3-3l-10 10z"/><path d="m14.7 6.5 3 3M4.5 19.5l1-4"/></svg>
        </span>
        <strong>Autofill</strong>
      </div>
      <label class="profile-label" for="ext-autofill-profile">Profile</label>
      <select class="profile" id="ext-autofill-profile"></select>
      <button class="fill" type="button">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 3.2 3.2L16 4.8"/></svg>
        Fill this page
      </button>
    </div>
    <button class="tab" type="button" title="Open Autofill" aria-label="Open Autofill" aria-expanded="false">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 19.5 4.2-1 10-10a2.1 2.1 0 0 0-3-3l-10 10z"/><path d="m14.7 6.5 3 3M4.5 19.5l1-4"/></svg>
    </button>
  `;

  const style = document.createElement('style');
  style.textContent = `
    :host{
      --paper:oklch(98.5% .004 250);
      --paper-2:oklch(96% .007 250);
      --ink:oklch(21% .02 258);
      --ink-2:oklch(33% .018 258);
      --muted:oklch(43% .016 258);
      --rule:oklch(76% .012 252);
      --accent:oklch(51% .2 256);
      --accent-ink:oklch(98% .006 250);
      --focus:oklch(39% .18 256);
      --shadow:oklch(20% .02 258 / .12);
      --ease-out:cubic-bezier(.16,1,.3,1)
    }
    *{box-sizing:border-box}
    .wrapper{display:flex;align-items:flex-start;gap:8px;font-family:"Aptos","Segoe UI Variable Text","SF Pro Text",sans-serif;font-size:15px;line-height:1.45}
    .tab{display:grid;place-items:center;width:30px;height:36px;padding:0;border:1px solid var(--rule);border-right:0;border-radius:6px 0 0 6px;background:var(--ink);color:var(--accent-ink);cursor:pointer;opacity:.38;transform:translateX(5px);box-shadow:0 1px 2px var(--shadow);transition:opacity 150ms var(--ease-out),transform 150ms var(--ease-out),background-color 150ms var(--ease-out)}
    .tab:hover,.tab:focus-visible,.wrapper:has(.panel:not(.hidden)) .tab{opacity:1;transform:translateX(0);background:var(--ink-2)}
    .tab:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
    .tab:active{transform:translateY(1px)}
    .tab svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .panel{width:272px;background:var(--paper);color:var(--ink-2);border-radius:8px;box-shadow:0 1px 2px var(--shadow);padding:16px;display:flex;flex-direction:column;gap:12px;border:1px solid var(--rule)}
    .hidden{display:none}
    .panel-head{display:flex;align-items:center;gap:10px;margin-bottom:2px}
    .panel-head strong{color:var(--ink);font-family:"Bahnschrift","Aptos Display","Segoe UI Variable Display",sans-serif;font-size:17px;line-height:1.25;letter-spacing:-.02em}
    .brand-mark{display:grid;place-items:center;width:32px;height:32px;border-radius:6px;background:var(--paper-2);color:var(--accent);border:1px solid var(--rule)}
    .brand-mark svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
    .profile-label{font-size:13px;font-weight:700;color:var(--ink-2)}
    select,button{font:inherit}
    select{width:100%;min-height:44px;padding:9px 12px;border:1px solid var(--rule);border-radius:6px;background:var(--paper);color:var(--ink);font-size:15px;outline:2px solid transparent;outline-offset:1px}
    select:hover{background:var(--paper-2)}
    select:focus-visible{outline:2px solid var(--focus);outline-offset:1px}
    .fill{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:46px;padding:9px 14px;border:1px solid var(--ink);border-radius:6px;background:var(--ink);color:var(--accent-ink);font-size:16px;font-weight:700;cursor:pointer;transition:background-color 180ms var(--ease-out),transform 100ms var(--ease-out)}
    .fill:hover{background:var(--ink-2)}
    .fill:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
    .fill:active{transform:translateY(1px)}
    .fill svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    @media (prefers-reduced-motion:reduce){.tab,.fill{transition-duration:150ms;transform:none}}
  `;

  const profileSelect = wrapper.querySelector('.profile');
  const panel = wrapper.querySelector('.panel');
  const tab = wrapper.querySelector('.tab');
  const fillBtn = wrapper.querySelector('.fill');

  chrome.storage.sync.get(['activeProfile'], ({ activeProfile }) => {
    profilesSnapshot.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.title;
      opt.textContent = p.title;
      if (p.title === activeProfile) opt.selected = true;
      profileSelect.appendChild(opt);
    });
  });

  tab.addEventListener('click', () => {
    const opened = panel.classList.toggle('hidden') === false;
    tab.setAttribute('aria-expanded', String(opened));
    tab.title = opened ? 'Close Autofill' : 'Open Autofill';
    if (opened) profileSelect.focus({ preventScroll: true });
  });
  shadow.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || panel.classList.contains('hidden')) return;
    panel.classList.add('hidden');
    tab.setAttribute('aria-expanded', 'false');
    tab.title = 'Open Autofill';
    tab.focus({ preventScroll: true });
  });
  fillBtn.addEventListener('click', async () => {
    const envelope = await chrome.runtime.sendMessage({
      type: 'getAutofillSettings',
      reason: 'user-action'
    }).catch(() => null);
    const response = envelope?.ok ? envelope.result : envelope;
    if (response?.profiles) profilesSnapshot = response.profiles;
    if (response?.customRules) customRulesSnapshot = response.customRules;
    const selected = profilesSnapshot.find(p => p.title === profileSelect.value);
    if (!selected) return;
    await processProfile(selected);
    chrome.runtime.sendMessage({ type: 'trigger_iframe_fill' });
  });
  profileSelect.addEventListener('change', () => chrome.storage.sync.set({ activeProfile: profileSelect.value }));

  shadow.append(style, wrapper);
  document.body.appendChild(host);
}

function shouldRunOnDomain(option, currentDomain, whitelistDomains = [], blacklistDomains = []) {
  const matches = (entry) => {
    let domain = String(entry || '').trim().toLowerCase();
    try {
      if (/^https?:\/\//.test(domain)) domain = new URL(domain).hostname;
    } catch {}
    domain = domain.replace(/^www\./, '').replace(/^\*\./, '').replace(/\/.*$/, '');
    return Boolean(domain) && (currentDomain === domain || currentDomain.endsWith(`.${domain}`));
  };
  if (option === 'whitelisted-websites') return whitelistDomains.some(matches);
  if (option === 'blacklisted-websites') return !blacklistDomains.some(matches);
  return true;
}

function scheduleProgressiveFill(profile) {
  [120, 400, 900, 1800, 3200, 5000, 8000].forEach(delay => {
    setTimeout(() => processProfile(profile).catch(() => {}), delay);
  });
}

function startDynamic(profile) {
  const run = () => processProfile(profile).catch(() => {});
  run();
  scheduleProgressiveFill(profile);
  if (mutationObserver || !document.body) return;
  let timer = null;
  const observedRoots = new WeakSet();
  const observeRoot = (root) => {
    if (!root || observedRoots.has(root)) return;
    observedRoots.add(root);
    mutationObserver.observe(root, { childList: true, subtree: true });
    root.querySelectorAll?.('*').forEach(node => {
      const shadowRoot = getExtensionShadowRoot(node);
      if (shadowRoot) observeRoot(shadowRoot);
    });
  };
  mutationObserver = new MutationObserver((records) => {
    records.forEach(record => {
      record.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const shadowRoot = getExtensionShadowRoot(node);
        if (shadowRoot) observeRoot(shadowRoot);
        node.querySelectorAll?.('*').forEach(child => {
          const childShadowRoot = getExtensionShadowRoot(child);
          if (childShadowRoot) observeRoot(childShadowRoot);
        });
      });
    });
    clearTimeout(timer);
    timer = setTimeout(run, 450);
  });
  observeRoot(document.body);
}

async function init() {
  attachUserTracking();
  const envelope = await chrome.runtime.sendMessage({
    type: 'getAutofillSettings',
    reason: 'bootstrap'
  }).catch(() => null);
  const response = envelope?.ok ? envelope.result : envelope;
  if (!response?.autofillEnabled) return;

  const { activeProfile, profiles = [], customRules = [], autofillOption, whitelistDomains = [], blacklistDomains = [] } = response;
  profilesSnapshot = profiles;
  customRulesSnapshot = customRules;
  focusFillEnabled = autofillOption !== 'autofill-button';
  const currentDomain = location.hostname.replace(/^www\./, '').toLowerCase();
  if (!shouldRunOnDomain(autofillOption, currentDomain, whitelistDomains, blacklistDomains)) return;
  const profile = profiles.find(p => p.title === activeProfile);
  if (!profile) return;
  activeProfileSnapshot = profile;

  const run = () => {
    if (autofillOption === 'autofill-button') {
      let topFrame = false;
      try { topFrame = window.top === window; } catch {}
      if (topFrame) createSlimLauncher(profile);
    }
    else startDynamic(profile);
  };

  if (document.readyState === 'loading' || !document.body) document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
}

if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'REALLY_FILL_NOW') {
      chrome.runtime.sendMessage({
        type: 'getAutofillSettings',
        reason: 'user-action'
      }).then(envelope => {
        const response = envelope?.ok ? envelope.result : envelope;
        const { activeProfile, profiles = [], customRules = [] } = response || {};
        profilesSnapshot = profiles;
        customRulesSnapshot = customRules;
        const profile = profiles.find(p => p.title === activeProfile);
        if (profile) {
          activeProfileSnapshot = profile;
          processProfile(profile);
        }
      }).catch(() => {});
    }
  });
  init();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FIELD_DEFS,
    n,
    normalizeProfile,
    buildValueMap,
    getMetaAddressScope,
    assignCoreFields,
    getExtensionShadowRoot,
    score,
    bestRepeatableKey,
    valueForMeta,
    coreFillOptions,
    findSelectOption,
    shouldRunOnDomain,
    wildcardRegex,
    matchesRuleUrl
  };
}
