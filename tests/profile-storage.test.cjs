const test = require('node:test');
const assert = require('node:assert/strict');

const noopEvent = { addListener() {} };
global.chrome = {
  runtime: {
    onInstalled: noopEvent,
    onMessage: noopEvent,
    getURL: value => `chrome-extension://test/${value}`
  },
  action: { onClicked: noopEvent },
  contextMenus: { onClicked: noopEvent },
  tabs: {}
};

const {
  sanitizeProfileData,
  stripCvcProfileData,
  profileDataForAutofill,
  mergeProfileData,
  canExposeProfileDataToPage
} = require('../js/background.js');

test('profile storage keeps a valid CVC locally but strips passwords', () => {
  const clean = sanitizeProfileData({
    profiles: [{
      title: 'Private',
      creditcardCVC: '123',
      cvv: '456',
      password: 'never-store-this',
      paypalPasswd: 'never-store-this-either'
    }],
    customRules: []
  });

  assert.equal(clean.profiles[0].creditcardCVC, '123');
  assert.equal(clean.profiles[0].cvv, undefined);
  assert.equal(clean.profiles[0].password, undefined);
  assert.equal(clean.profiles[0].paypalPasswd, undefined);
});

test('CVC is exposed only for a manual fill and omitted from backups', () => {
  const data = sanitizeProfileData({
    profiles: [{ title: 'Card', creditcardCVC: '1234' }]
  });

  assert.equal(profileDataForAutofill(data, 'bootstrap').profiles[0].creditcardCVC, undefined);
  assert.equal(profileDataForAutofill(data, 'user-action').profiles[0].creditcardCVC, '1234');
  assert.equal(stripCvcProfileData(data).profiles[0].creditcardCVC, undefined);
});

test('legacy PayPal email becomes the regular profile email', () => {
  const clean = sanitizeProfileData({
    profiles: [{ title: 'Legacy', paypalEmail: 'checkout@example.com' }]
  });

  assert.equal(clean.profiles[0].email, 'checkout@example.com');
  assert.equal(clean.profiles[0].paypalEmail, undefined);
});

test('legacy and current profile data merge without duplicates', () => {
  const merged = mergeProfileData(
    {
      profiles: [{ title: 'Home', city: 'Old city' }],
      customRules: [{ id: 'rule-1', fixedValue: 'old' }]
    },
    {
      profiles: [{ title: 'Home', city: 'New city' }, { title: 'Work' }],
      customRules: [{ id: 'rule-1', fixedValue: 'new' }]
    }
  );

  assert.equal(merged.profiles.length, 2);
  assert.equal(merged.profiles.find(profile => profile.title === 'Home').city, 'New city');
  assert.equal(merged.customRules.length, 1);
  assert.equal(merged.customRules[0].fixedValue, 'new');
});

test('profile data is exposed only to enabled and allowed web pages', () => {
  const base = {
    autofillEnabled: true,
    autofillOption: 'blacklisted-websites',
    whitelistDomains: [],
    blacklistDomains: ['private.example']
  };

  assert.equal(canExposeProfileDataToPage('https://shop.example/checkout', base), true);
  assert.equal(canExposeProfileDataToPage('https://sub.private.example/checkout', base), false);
  assert.equal(canExposeProfileDataToPage('chrome://settings/', base), false);
  assert.equal(canExposeProfileDataToPage('https://shop.example/', { ...base, autofillEnabled: false }), false);
  assert.equal(canExposeProfileDataToPage('https://shop.example/', {
    ...base,
    autofillOption: 'whitelisted-websites',
    whitelistDomains: ['example.org']
  }), false);
});
