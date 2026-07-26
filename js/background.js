const PROFILE_KEYS = ['profiles', 'customRules'];
const LEGACY_ENCRYPTED_KEY = 'secureVault';
const LEGACY_SESSION_KEY = 'secureVaultSessionKey';
const BACKUP_SETTING_KEYS = [
    'autofillEnabled',
    'activeProfile',
    'autofillOption',
    'whitelistDomains',
    'blacklistDomains',
    'darkMode'
];
const PASSWORD_PROFILE_KEYS = [
    'password',
    'passwd',
    'paypalPasswd',
    'paypalPassword'
];
const CVC_PROFILE_KEYS = [
    'creditcardCVC',
    'creditCardCvc',
    'cardCvc',
    'cvc',
    'cvv'
];
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64ToBytes(value) {
    const binary = atob(String(value || ''));
    return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function sanitizeProfileData(data) {
    return {
        profiles: (Array.isArray(data?.profiles) ? data.profiles : []).map(profile => {
            const clean = { ...profile };
            PASSWORD_PROFILE_KEYS.forEach(key => delete clean[key]);
            const cvc = CVC_PROFILE_KEYS
                .map(key => clean[key])
                .find(value => String(value || '').trim())
                ?.toString()
                .replace(/\D/g, '');
            CVC_PROFILE_KEYS.forEach(key => delete clean[key]);
            if (/^\d{3,4}$/.test(cvc || '')) clean.creditcardCVC = cvc;
            if (!clean.email && clean.paypalEmail) clean.email = clean.paypalEmail;
            delete clean.paypalEmail;
            return clean;
        }),
        customRules: Array.isArray(data?.customRules) ? data.customRules : []
    };
}

function stripCvcProfileData(data) {
    return {
        profiles: (Array.isArray(data?.profiles) ? data.profiles : []).map(profile => {
            const clean = { ...profile };
            CVC_PROFILE_KEYS.forEach(key => delete clean[key]);
            return clean;
        }),
        customRules: Array.isArray(data?.customRules) ? data.customRules : []
    };
}

function profileDataForAutofill(data, reason) {
    return reason === 'user-action' ? data : stripCvcProfileData(data);
}

function restrictProfileStorageAccess() {
    const request = chrome.storage?.local?.setAccessLevel?.({ accessLevel: 'TRUSTED_CONTEXTS' });
    request?.catch?.(() => {});
}

restrictProfileStorageAccess();

async function deriveLegacyKey(password, salt, iterations = 310000) {
    const material = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
        material,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );
}

async function importLegacyKey(value) {
    return crypto.subtle.importKey(
        'raw',
        base64ToBytes(value),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );
}

async function decryptLegacyData(store, key) {
    const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToBytes(store.cipher.iv) },
        key,
        base64ToBytes(store.cipher.ciphertext)
    );
    return sanitizeProfileData(JSON.parse(decoder.decode(plaintext)));
}

function mergeProfileData(older, newer) {
    const profileMap = new Map();
    for (const profile of [...(older.profiles || []), ...(newer.profiles || [])]) {
        if (profile?.title) profileMap.set(profile.title, profile);
    }
    const ruleMap = new Map();
    for (const rule of [...(older.customRules || []), ...(newer.customRules || [])]) {
        ruleMap.set(rule?.id || JSON.stringify(rule), rule);
    }
    return sanitizeProfileData({
        profiles: [...profileMap.values()],
        customRules: [...ruleMap.values()]
    });
}

async function readProfileData() {
    const stored = await chrome.storage.local.get(PROFILE_KEYS);
    return sanitizeProfileData(stored);
}

async function saveProfileData(data) {
    const normalized = sanitizeProfileData(data);
    await chrome.storage.local.set(normalized);
    await chrome.storage.sync.remove(PROFILE_KEYS);
    return normalized;
}

async function readLegacyEncryptedStore() {
    const stored = await chrome.storage.local.get(LEGACY_ENCRYPTED_KEY);
    return stored[LEGACY_ENCRYPTED_KEY] || null;
}

async function removeLegacyEncryptedStore() {
    await Promise.all([
        chrome.storage.local.remove(LEGACY_ENCRYPTED_KEY),
        chrome.storage.session.remove(LEGACY_SESSION_KEY)
    ]);
}

async function migrateLegacySyncData() {
    const [local, synced] = await Promise.all([
        chrome.storage.local.get(PROFILE_KEYS),
        chrome.storage.sync.get(PROFILE_KEYS)
    ]);
    const localExists = PROFILE_KEYS.some(key => Object.hasOwn(local, key));
    if (!localExists && (Array.isArray(synced.profiles) || Array.isArray(synced.customRules))) {
        await saveProfileData(synced);
    } else if (Array.isArray(synced.profiles) || Array.isArray(synced.customRules)) {
        await chrome.storage.sync.remove(PROFILE_KEYS);
    }
}

async function migrateUnlockedLegacyStore() {
    const [store, session] = await Promise.all([
        readLegacyEncryptedStore(),
        chrome.storage.session.get(LEGACY_SESSION_KEY)
    ]);
    if (!store || !session[LEGACY_SESSION_KEY]) return false;
    try {
        const key = await importLegacyKey(session[LEGACY_SESSION_KEY]);
        const legacyData = await decryptLegacyData(store, key);
        const currentData = await readProfileData();
        await saveProfileData(mergeProfileData(legacyData, currentData));
        await removeLegacyEncryptedStore();
        return true;
    } catch {
        return false;
    }
}

async function restoreLegacyProfiles(password) {
    const store = await readLegacyEncryptedStore();
    if (!store) throw new Error('No previous encrypted profiles were found.');
    try {
        const key = await deriveLegacyKey(
            String(password || ''),
            base64ToBytes(store.kdf.salt),
            store.kdf.iterations
        );
        const legacyData = await decryptLegacyData(store, key);
        const currentData = await readProfileData();
        const merged = await saveProfileData(mergeProfileData(legacyData, currentData));
        await removeLegacyEncryptedStore();
        return merged;
    } catch {
        throw new Error('That password did not restore the previous profiles.');
    }
}

async function getProfileStore() {
    await migrateUnlockedLegacyStore();
    await migrateLegacySyncData();
    const [data, legacyStore] = await Promise.all([
        readProfileData(),
        readLegacyEncryptedStore()
    ]);
    return {
        ...data,
        legacyEncryptedData: Boolean(legacyStore)
    };
}

function isExtensionPage(sender) {
    return String(sender?.url || '').startsWith(chrome.runtime.getURL(''));
}

function domainMatches(hostname, entry) {
    let domain = String(entry || '').trim().toLowerCase();
    try {
        if (/^https?:\/\//.test(domain)) domain = new URL(domain).hostname;
    } catch {}
    domain = domain.replace(/^www\./, '').replace(/^\*\./, '').replace(/\/.*$/, '');
    return Boolean(domain) && (hostname === domain || hostname.endsWith(`.${domain}`));
}

function canExposeProfileDataToPage(pageUrl, settings) {
    if (!settings.autofillEnabled) return false;
    let hostname;
    try {
        const url = new URL(pageUrl);
        if (!['http:', 'https:'].includes(url.protocol)) return false;
        hostname = url.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
        return false;
    }
    const whitelist = Array.isArray(settings.whitelistDomains) ? settings.whitelistDomains : [];
    const blacklist = Array.isArray(settings.blacklistDomains) ? settings.blacklistDomains : [];
    if (settings.autofillOption === 'whitelisted-websites') {
        return whitelist.some(entry => domainMatches(hostname, entry));
    }
    if (settings.autofillOption === 'blacklisted-websites') {
        return !blacklist.some(entry => domainMatches(hostname, entry));
    }
    return true;
}

async function getAutofillSettings(pageUrl, reason = 'runtime') {
    const settings = await chrome.storage.sync.get([
        'autofillEnabled',
        'activeProfile',
        'autofillOption',
        'whitelistDomains',
        'blacklistDomains'
    ]);
    if (!canExposeProfileDataToPage(pageUrl, settings)) {
        return { ...settings, profiles: [], customRules: [] };
    }
    const data = await getProfileStore();
    if (settings.autofillOption === 'autofill-button' && reason === 'bootstrap') {
        return {
            ...settings,
            profiles: data.profiles.map(profile => ({ title: profile.title })),
            customRules: []
        };
    }
    const exposedData = profileDataForAutofill(data, reason);
    return {
        ...settings,
        profiles: exposedData.profiles,
        customRules: exposedData.customRules
    };
}

async function exportBackup() {
    const [settings, data] = await Promise.all([
        chrome.storage.sync.get(BACKUP_SETTING_KEYS),
        readProfileData()
    ]);
    return {
        format: 'autofill-extension-backup',
        version: 3,
        exportedAt: new Date().toISOString(),
        settings,
        data: stripCvcProfileData(data)
    };
}

async function importBackup(backup) {
    if (backup?.format === 'autofill-extension-backup' && backup?.version === 2) {
        throw new Error('This encrypted v1.2 backup needs the old password flow. Restore it in v1.2, then export again.');
    }
    const isVersionThree = backup?.format === 'autofill-extension-backup' && backup?.version === 3;
    const data = isVersionThree ? backup.data : backup;
    if (!Array.isArray(data?.profiles) && !Array.isArray(data?.customRules)) {
        throw new Error('This is not a valid Autofill Extension backup.');
    }
    const settingsSource = isVersionThree ? backup.settings : backup;
    const settings = Object.fromEntries(
        BACKUP_SETTING_KEYS
            .filter(key => Object.hasOwn(settingsSource || {}, key))
            .map(key => [key, settingsSource[key]])
    );
    const normalized = await saveProfileData(stripCvcProfileData(data));
    await chrome.storage.sync.set({ ...settings, autofillEnabled: false });
    return normalized;
}

chrome.runtime.onInstalled.addListener(async details => {
    await chrome.contextMenus.removeAll();
    await migrateUnlockedLegacyStore();
    await migrateLegacySyncData();
    chrome.contextMenus.create({
        id: 'force-autofill',
        title: 'Fill this page now',
        contexts: ['all']
    });

    if (details.reason === 'install') {
        await Promise.all([
            chrome.storage.sync.set({
                autofillEnabled: false,
                autofillOption: 'autofill-button'
            }),
            chrome.storage.local.set({
                onboardingCompleted: false,
                onboardingDismissed: false,
                onboardingWelcomeSeen: false
            })
        ]);
        await chrome.tabs.create({ url: chrome.runtime.getURL('main.html?onboarding=1') });
    }
});

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL('main.html') });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'force-autofill' && tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'REALLY_FILL_NOW' });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'trigger_iframe_fill') {
        if (sender.tab?.id) chrome.tabs.sendMessage(sender.tab.id, { type: 'REALLY_FILL_NOW' });
        return;
    }

    const handlers = {
        getAutofillSettings: async () => {
            const pageUrl = /^https?:/i.test(String(sender.url || '')) ? sender.url : sender.tab?.url;
            return getAutofillSettings(pageUrl, message.reason);
        },
        getProfileStore,
        saveProfileStore: async () => saveProfileData(message.data),
        restoreLegacyProfiles: async () => restoreLegacyProfiles(message.password),
        exportBackup,
        importBackup: async () => importBackup(message.backup)
    };
    const handler = handlers[message.type];
    if (!handler) return;

    const extensionOnly = new Set([
        'getProfileStore',
        'saveProfileStore',
        'restoreLegacyProfiles',
        'exportBackup',
        'importBackup'
    ]);
    if (extensionOnly.has(message.type) && !isExtensionPage(sender)) {
        sendResponse({ ok: false, error: 'This action is only available from the extension settings.' });
        return;
    }

    handler()
        .then(result => sendResponse({ ok: true, result }))
        .catch(error => sendResponse({ ok: false, error: error.message || 'Extension request failed.' }));
    return true;
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sanitizeProfileData,
        stripCvcProfileData,
        profileDataForAutofill,
        mergeProfileData,
        canExposeProfileDataToPage,
        deriveLegacyKey,
        decryptLegacyData
    };
}
