const test = require('node:test');
const assert = require('node:assert/strict');

const {
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
  matchesRuleUrl
} = require('../js/contentScript.js');

function meta(text, index = 0, overrides = {}) {
  return {
    el: {},
    index,
    descriptor: text.toLowerCase(),
    directText: text.toLowerCase(),
    labelText: '',
    contextText: '',
    autocompleteTokens: [],
    type: 'text',
    tag: 'input',
    optionsText: '',
    inputMode: '',
    pattern: '',
    placeholder: '',
    minLength: null,
    maxLength: null,
    rect: { top: index * 48, left: 0, width: 300, height: 40 },
    group: null,
    form: null,
    section: null,
    ...overrides
  };
}

function profile(overrides = {}) {
  return normalizeProfile({
    type: 'Private',
    firstName: 'Ada',
    lastName: 'Lovelace',
    street: 'Example Street',
    houseNumber: '12a',
    postcode: '10115',
    city: 'Berlin',
    state: 'Berlin',
    country: 'DE',
    email: 'ada@example.test',
    preDial: '+49',
    telephone: '0151 2345678',
    dateOfBirth: { day: '10', month: '12', year: '1990' },
    ...overrides
  });
}

test('normalizes national and international telephone variants without duplicating prefix', () => {
  const result = profile();
  assert.equal(result.telephoneNational, '01512345678');
  assert.equal(result.telephoneNationalSignificant, '1512345678');
  assert.equal(result.telephoneIntl, '+491512345678');
  assert.equal(result.telephoneFull, '+491512345678');
  assert.equal(profile({ preDial: '0049' }).preDial, '+49');
});

test('keeps separate shipping and billing addresses plus extended address data', () => {
  const result = profile({
    middleName: 'Byron',
    shipping: {
      street: 'Shipping Road',
      houseNumber: '1',
      addressLine2: 'Care of Example',
      addressLine3: 'West wing',
      apartment: '4B',
      floor: '4',
      building: 'Tower A',
      postcode: '10115',
      city: 'Berlin',
      district: 'Mitte',
      state: 'Berlin',
      country: 'DE'
    },
    billingSameAsShipping: false,
    billing: {
      street: 'Invoice Lane',
      houseNumber: '9',
      postcode: '20095',
      city: 'Hamburg',
      district: 'Altstadt',
      state: 'Hamburg',
      country: 'DE'
    }
  });

  assert.equal(result.fullName, 'Ada Byron Lovelace');
  assert.equal(buildValueMap(result, 'shipping').streetCombined, 'Shipping Road 1');
  assert.equal(buildValueMap(result, 'shipping').district, 'Mitte');
  assert.equal(buildValueMap(result, 'billing').streetCombined, 'Invoice Lane 9');
  assert.equal(buildValueMap(result).billingCity, 'Hamburg');
  assert.equal(buildValueMap(result).addressLine3, 'West wing');
  assert.equal(buildValueMap(result).apartment, '4B');
  assert.equal(buildValueMap(result).ccCVC, undefined);
});

test('recognizes shipping and billing autocomplete scopes', () => {
  assert.equal(getMetaAddressScope(meta('address', 0, { autocompleteTokens: ['section-a', 'shipping', 'street-address'] })), 'shipping');
  assert.equal(getMetaAddressScope(meta('address', 0, { autocompleteTokens: ['section-b', 'billing', 'street-address'] })), 'billing');
  assert.equal(getMetaAddressScope(meta('Rechnungsadresse Straße')), 'billing');
});

test('recognizes extended identity and address fields', () => {
  const values = buildValueMap(profile({
    middleName: 'Byron',
    addressLine3: 'West wing',
    apartment: '4B',
    floor: '4',
    building: 'Tower A',
    district: 'Mitte'
  }));

  assert.equal(bestRepeatableKey(meta('middle name'), [], values)?.key, 'middleName');
  assert.equal(bestRepeatableKey(meta('address line 3', 0, { addressLine: 3 }), [], values)?.key, 'addressLine3');
  assert.equal(bestRepeatableKey(meta('apartment unit'), [], values)?.key, 'apartment');
  assert.equal(bestRepeatableKey(meta('district suburb'), [], values)?.key, 'district');
});

test('recognizes CVC fields without enabling general password autofill', () => {
  const values = buildValueMap(profile({ creditcardCVC: '123' }));
  const cvc = meta('card cvc', 0, {
    autocompleteTokens: ['cc-csc'],
    type: 'password',
    maxLength: 4,
    inputMode: 'numeric'
  });

  assert.equal(values.ccCVC, '123');
  assert.equal(bestRepeatableKey(cvc, [cvc], values)?.key, 'ccCVC');
  assert.equal(coreFillOptions('ccCVC').allowPassword, true);
  assert.equal(Boolean(coreFillOptions('password').allowPassword), false);
});

test('recognizes duplicate semantic fields independently', () => {
  const values = buildValueMap(profile());
  const shipping = meta('shipping first name', 0);
  const billing = meta('billing first name', 8);

  assert.equal(bestRepeatableKey(shipping, [shipping, billing], values)?.key, 'firstName');
  assert.equal(bestRepeatableKey(billing, [shipping, billing], values)?.key, 'firstName');
  assert.ok(score(shipping, 'firstName') >= 42);

  const emailConfirmation = meta('confirm email address', 9, { type: 'email' });
  assert.equal(bestRepeatableKey(emailConfirmation, [emailConfirmation], values)?.key, 'email');

  const paypalEmail = meta('paypal email', 10, { type: 'email' });
  assert.equal(bestRepeatableKey(paypalEmail, [paypalEmail], values)?.key, 'email');
});

test('uses associated labels when ids and names are opaque', () => {
  const values = buildValueMap(profile());
  const opaque = meta('', 0, {
    directText: 'field 17',
    labelText: 'vorname',
    descriptor: 'field 17 vorname'
  });
  assert.equal(bestRepeatableKey(opaque, [opaque], values)?.key, 'firstName');
});

test('uses split street value when a related house-number field exists', () => {
  const values = buildValueMap(profile());
  const street = meta('address line 1 street', 0);
  const house = meta('house number', 1, { maxLength: 8, inputMode: 'numeric' });

  assert.equal(bestRepeatableKey(street, [street, house], values)?.key, 'street');
  assert.equal(bestRepeatableKey(street, [street], values)?.key, 'streetCombined');
});

test('never duplicates street line 1 into an explicit address line 2', () => {
  const emptyAdditionValues = buildValueMap(profile());
  const line2 = meta('street address line 2', 1, {
    addressLine: 2,
    labelText: 'street address line 2'
  });
  assert.equal(bestRepeatableKey(line2, [line2], emptyAdditionValues), null);

  const additionValues = buildValueMap(profile({ streetAddition: 'Apartment 4' }));
  assert.equal(bestRepeatableKey(line2, [line2], additionValues)?.key, 'streetAddition');
});

test('combines unassigned address details into the available second line', () => {
  const result = profile({
    streetAddition: 'Care of Example',
    addressLine3: 'West wing',
    apartment: '4B',
    floor: '4',
    building: 'Tower A'
  });
  const line1 = meta('street address line 1', 0, { addressLine: 1 });
  const line2 = meta('street address line 2', 1, {
    addressLine: 2,
    labelText: 'street address line 2'
  });
  const { assignments, values } = assignCoreFields([line1, line2], result);

  assert.equal(assignments.streetAddition, line2);
  assert.equal(values.streetAddition, 'Care of Example, West wing, 4B, 4, Tower A');
});

test('country and state may replace untouched shop defaults', () => {
  assert.deepEqual(coreFillOptions('country'), { overwrite: true });
  assert.deepEqual(coreFillOptions('state'), { overwrite: true });
  assert.deepEqual(coreFillOptions('city'), { overwrite: false });
});

test('adapts telephone value to separate country-code field and placeholder', () => {
  const values = buildValueMap(profile());
  const phone = meta('phone number', 1);
  const countryCode = meta('phone country code', 0, { maxLength: 4 });

  assert.equal(valueForMeta(phone, 'telephone', values, [countryCode, phone]), '1512345678');
  phone.placeholder = '0151 1234567';
  assert.equal(valueForMeta(phone, 'telephone', values, [countryCode, phone]), '01512345678');
});

test('matches localized country select labels', () => {
  const select = {
    options: [
      { value: '', textContent: 'Bitte wählen', disabled: true },
      { value: '276', textContent: 'Deutschland', disabled: false }
    ]
  };
  assert.equal(findSelectOption(select, 'DE', 'country')?.value, '276');

  const shortCodeSelect = {
    options: [
      { value: '246', textContent: 'Finland', disabled: false },
      { value: '356', textContent: 'India', disabled: false }
    ]
  };
  assert.equal(findSelectOption(shortCodeSelect, 'IN', 'country')?.value, '356');
});

test('does not confuse female salutation with male substring', () => {
  const select = {
    options: [
      { value: 'male', textContent: 'Male', disabled: false },
      { value: 'female', textContent: 'Female', disabled: false }
    ]
  };
  assert.equal(findSelectOption(select, 'Female', 'salutation')?.value, 'female');
});

test('domain lists match exact domains and subdomains, not lookalikes', () => {
  assert.equal(shouldRunOnDomain('whitelisted-websites', 'checkout.example.com', ['example.com']), true);
  assert.equal(shouldRunOnDomain('whitelisted-websites', 'evil-example.com', ['example.com']), false);
  assert.equal(shouldRunOnDomain('blacklisted-websites', 'shop.example.com', [], ['example.com']), false);
});

test('custom rules may omit a website pattern', () => {
  assert.equal(matchesRuleUrl(''), true);
  assert.equal(matchesRuleUrl('  \n  '), true);
});

test('uses the Chrome extension API for closed shadow roots', () => {
  const closedRoot = { mode: 'closed' };
  global.chrome = {
    dom: {
      openOrClosedShadowRoot: () => closedRoot
    }
  };
  assert.equal(getExtensionShadowRoot({ shadowRoot: null }), closedRoot);
  delete global.chrome;
});
