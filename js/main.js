document.addEventListener("DOMContentLoaded", function() {
    const toggle = document.getElementById("autofill-toggle");
    const activationControl = document.getElementById("activation-control");
    const activationTitle = document.getElementById("autofill-title");
    const autofillStatus = document.getElementById("autofill-status");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const settingsButton = document.getElementById("settings-button");
    const profilesButton = document.getElementById("profiles-button");
    const customButton = document.getElementById("custom-button");
    const settingsContent = document.getElementById("settings-content");
    const profilesContent = document.getElementById("profiles-content");
    const customContent = document.getElementById("custom-content");
    const profileSelection = document.getElementById('profile-selection');

    const profileActive = document.getElementById('profile-active');
    const importButton = document.getElementById("import-settings");
    const exportButton = document.getElementById("export-settings");
    const fileInput = document.getElementById("file-input");
    const profileTitleInput = document.getElementById('profile-title');
    const onboardingDialog = document.getElementById('onboarding-dialog');
    const onboardingTitle = document.getElementById('onboarding-title');
    const startOnboardingButton = document.getElementById('start-onboarding');
    const dismissOnboardingButton = document.getElementById('dismiss-onboarding');
    const restartOnboardingButton = document.getElementById('restart-onboarding');
    const extensionVersion = document.getElementById('extension-version');
    const setupGuide = document.getElementById('setup-guide');
    const setupGuideCopy = document.getElementById('setup-guide-copy');
    const dismissSetupGuideButton = document.getElementById('dismiss-setup-guide');
    const setupCreateProfileButton = document.getElementById('setup-create-profile');
    const setupChooseMethodButton = document.getElementById('setup-choose-method');
    const legacyRecovery = document.getElementById('legacy-recovery');
    const legacyPasswordInput = document.getElementById('legacy-password');
    const restoreLegacyButton = document.getElementById('restore-legacy');
    const legacyError = document.getElementById('legacy-error');
    const salutationInput = document.getElementById('salutation');
    const typeInput = document.getElementById('type');
    const companyNameInput = document.getElementById('company-name');
    const vatIdInput = document.getElementById('vat-id');
    const firstNameInput = document.getElementById('first-name');
    const middleNameInput = document.getElementById('middle-name');
    const lastNameInput = document.getElementById('last-name');
    const streetInput = document.getElementById('street');
    const houseNumberInput = document.getElementById('house-number');
    const streetAdditionInput = document.getElementById('street-addition');
    const addressLine3Input = document.getElementById('address-line-3');
    const apartmentInput = document.getElementById('apartment');
    const floorInput = document.getElementById('floor');
    const buildingInput = document.getElementById('building');
    const postcodeInput = document.getElementById('postcode');
    const cityInput = document.getElementById('city');
    const districtInput = document.getElementById('district');
    const stateInput = document.getElementById('state');
    const countrySelect = document.getElementById('country');
    const billingSameAsShippingInput = document.getElementById('billing-same-as-shipping');
    const billingAddressFields = document.getElementById('billing-address-fields');
    const billingStreetInput = document.getElementById('billing-street');
    const billingHouseNumberInput = document.getElementById('billing-house-number');
    const billingAddressLine2Input = document.getElementById('billing-address-line-2');
    const billingAddressLine3Input = document.getElementById('billing-address-line-3');
    const billingApartmentInput = document.getElementById('billing-apartment');
    const billingFloorInput = document.getElementById('billing-floor');
    const billingBuildingInput = document.getElementById('billing-building');
    const billingPostcodeInput = document.getElementById('billing-postcode');
    const billingCityInput = document.getElementById('billing-city');
    const billingDistrictInput = document.getElementById('billing-district');
    const billingStateInput = document.getElementById('billing-state');
    const billingCountrySelect = document.getElementById('billing-country');
    const emailInput = document.getElementById('e-mail');
    const preDialInput = document.getElementById('pre-dial');
    const telephoneInput = document.getElementById('telephone');
    const dobDayInput = document.getElementById('dob-day');
    const dobMonthInput = document.getElementById('dob-month');
    const dobYearInput = document.getElementById('dob-year');
    const creditcardNumberInput = document.getElementById('cc-number');
    const creditcardMonthInput = document.getElementById('cc-month');
    const creditcardYearInput = document.getElementById('cc-year');
    const creditcardCVCInput = document.getElementById('cc-cvc');
    const bankIbanInput = document.getElementById('iban');
    const bankBicInput = document.getElementById('bic');
    const addProfileButton = document.getElementById('save-profile');
    const deleteProfileButton = document.getElementById("delete-profile");
    const newProfileButton = document.getElementById("new-profile");
    const profileForm = document.getElementById("profile-form");
    const profileFormStatus = document.getElementById("profile-form-status");
    const profileIndexButtons = Array.from(document.querySelectorAll("[data-profile-target]"));
    const appNotice = document.getElementById("app-notice");
    const appNoticeMessage = document.getElementById("app-notice-message");
    const appNoticeAction = document.getElementById("app-notice-action");
    const appNoticeDismiss = document.getElementById("app-notice-dismiss");
    const confirmationDialog = document.getElementById("confirmation-dialog");
    const confirmationTitle = document.getElementById("confirmation-title");
    const confirmationCopy = document.getElementById("confirmation-copy");
    const confirmationSubmit = document.getElementById("confirmation-submit");
    const allWebsitesRadio = document.querySelector('input[value="all-websites"]');
	const buttonRadio = document.querySelector('input[value="autofill-button"]');
    const whitelistRadio = document.querySelector('input[value="whitelisted-websites"]');
    const blacklistRadio = document.querySelector('input[value="blacklisted-websites"]');
    const whitelistInput = document.getElementById('whitelist-input');
    const blacklistInput = document.getElementById('blacklist-input');
    const autofillOptionsForm = document.getElementById('autofill-settings-form');
    const addNewRuleButton = document.getElementById('add-new-rule');
    const rules = document.getElementById('rules');

    allWebsitesRadio.addEventListener('change', toggleTextboxes);
	buttonRadio.addEventListener('change', toggleTextboxes);
    whitelistRadio.addEventListener('change', toggleTextboxes);
    blacklistRadio.addEventListener('change', toggleTextboxes);

    // Initialize textboxes based on the default selection (All Websites)
    toggleTextboxes();

    var profiles = [];
    var profileData = { profiles: [], customRules: [] };
    var onboardingPreferences = {
        onboardingCompleted: false,
        onboardingDismissed: false,
        onboardingWelcomeSeen: false
    };
    var editingProfileTitle = '';
    var noticeTimer = 0;
    var noticeAction = null;

    const manifestVersion = globalThis.chrome?.runtime?.getManifest?.().version || '1.3.0';
    extensionVersion.textContent = `Version ${manifestVersion}`;

async function runtimeRequest(type, payload = {}) {
    const response = await chrome.runtime.sendMessage({ type, ...payload });
    if (!response?.ok) throw new Error(response?.error || 'Extension request failed.');
    return response.result;
}

function hideNotice() {
    window.clearTimeout(noticeTimer);
    noticeTimer = 0;
    noticeAction = null;
    appNotice.hidden = true;
    appNotice.removeAttribute('data-tone');
    appNoticeAction.hidden = true;
    appNoticeAction.textContent = '';
}

function showNotice(message, {
    tone = 'neutral',
    actionLabel = '',
    action = null,
    timeout = action ? 8000 : 5000
} = {}) {
    window.clearTimeout(noticeTimer);
    appNoticeMessage.textContent = message;
    appNotice.dataset.tone = tone;
    appNotice.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
    appNotice.hidden = false;
    noticeAction = action;
    appNoticeAction.hidden = !actionLabel || !action;
    appNoticeAction.textContent = actionLabel;
    if (timeout > 0) noticeTimer = window.setTimeout(hideNotice, timeout);
}

appNoticeDismiss.addEventListener('click', hideNotice);
appNoticeAction.addEventListener('click', async () => {
    const action = noticeAction;
    hideNotice();
    if (!action) return;
    try {
        await action();
    } catch (error) {
        showNotice(error.message, { tone: 'error' });
    }
});

function requestConfirmation({ title, message, confirmLabel }) {
    confirmationTitle.textContent = title;
    confirmationCopy.textContent = message;
    confirmationSubmit.textContent = confirmLabel;
    confirmationDialog.returnValue = 'cancel';
    confirmationDialog.showModal();
    confirmationDialog.querySelector('[value="cancel"]').focus({ preventScroll: true });
    return new Promise(resolve => {
        confirmationDialog.addEventListener('close', () => {
            resolve(confirmationDialog.returnValue === 'confirm');
        }, { once: true });
    });
}

function openOnboardingDialog() {
    if (!onboardingDialog.open) onboardingDialog.showModal();
    onboardingDialog.scrollTop = 0;
    onboardingTitle.focus({ preventScroll: true });
    window.requestAnimationFrame(() => {
        onboardingDialog.scrollTop = 0;
    });
}

confirmationDialog.addEventListener('click', event => {
    if (event.target === confirmationDialog) confirmationDialog.close('cancel');
});

function clearProfileFormError() {
    profileFormStatus.hidden = true;
    profileFormStatus.textContent = '';
    profileForm.querySelectorAll('[aria-invalid="true"]').forEach(control => {
        control.removeAttribute('aria-invalid');
        if (control.getAttribute('aria-describedby') === 'profile-form-status') {
            control.removeAttribute('aria-describedby');
        }
    });
}

function showProfileFormError(message, controls = []) {
    clearProfileFormError();
    profileFormStatus.textContent = message;
    profileFormStatus.hidden = false;
    controls.forEach(control => {
        control.setAttribute('aria-invalid', 'true');
        control.setAttribute('aria-describedby', 'profile-form-status');
    });
    const firstControl = controls[0];
    if (firstControl) {
        firstControl.focus({ preventScroll: true });
        firstControl.scrollIntoView({ block: 'center' });
    }
}

function updateProfileNavigation() {
    profileIndexButtons.forEach(button => {
        const section = document.getElementById(button.dataset.profileTarget);
        if (!section) return;

        const complete = section.id === 'profile-billing' && billingSameAsShippingInput.checked
            ? true
            : Array.from(section.querySelectorAll('input:not([type="checkbox"]), select'))
                .filter(control => !control.disabled && !control.closest('[hidden]'))
                .every(control => String(control.value || '').trim());

        button.dataset.complete = String(complete);
        button.setAttribute(
            'aria-label',
            complete ? `${button.textContent.trim()}, complete` : button.textContent.trim()
        );
    });
}

function setActiveProfileSection(targetId) {
    profileIndexButtons.forEach(button => {
        if (button.dataset.profileTarget === targetId) {
            button.setAttribute('aria-current', 'true');
        } else {
            button.removeAttribute('aria-current');
        }
    });
}

profileIndexButtons.forEach(button => {
    button.addEventListener('click', () => {
        const section = document.getElementById(button.dataset.profileTarget);
        if (!section) return;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        section.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start'
        });
        setActiveProfileSection(section.id);
    });
});

profileForm.addEventListener('focusin', event => {
    const section = event.target.closest('.profile-section');
    if (section) setActiveProfileSection(section.id);
});

let profileScrollFrame = 0;
profileForm.addEventListener('scroll', () => {
    window.cancelAnimationFrame(profileScrollFrame);
    profileScrollFrame = window.requestAnimationFrame(() => {
        const formTop = profileForm.getBoundingClientRect().top;
        let activeSection = document.getElementById('profile-identity');
        profileIndexButtons.forEach(button => {
            const section = document.getElementById(button.dataset.profileTarget);
            if (section && section.getBoundingClientRect().top - formTop <= 72) activeSection = section;
        });
        if (activeSection) setActiveProfileSection(activeSection.id);
    });
});

function legacyShippingAddress(profile) {
    return profile?.shipping || {
        street: profile?.street,
        houseNumber: profile?.houseNumber,
        addressLine2: profile?.streetAddition,
        addressLine3: profile?.addressLine3,
        apartment: profile?.apartment,
        floor: profile?.floor,
        building: profile?.building,
        postcode: profile?.postcode,
        city: profile?.city,
        district: profile?.district,
        state: profile?.state,
        country: profile?.country
    };
}

function isProfileUsable(profile) {
    if (!profile) return false;
    const shipping = legacyShippingAddress(profile);
    const billing = profile.billing || profile.billingAddress || {};
    const fillableValues = [
        profile.salutation,
        profile.type,
        profile.firstName,
        profile.middleName,
        profile.lastName,
        profile.companyName,
        profile.vatId,
        profile.email,
        profile.preDial,
        profile.telephone,
        profile.creditcardNumber,
        profile.creditcardMonth,
        profile.creditcardYear,
        profile.creditcardCVC,
        profile.bankIban,
        profile.bankBic,
        profile.dateOfBirth?.day,
        profile.dateOfBirth?.month,
        profile.dateOfBirth?.year,
        shipping.street,
        shipping.houseNumber,
        shipping.addressLine2,
        shipping.addressLine3,
        shipping.apartment,
        shipping.floor,
        shipping.building,
        shipping.postcode,
        shipping.city,
        shipping.district,
        shipping.state,
        shipping.country === 'Country' ? '' : shipping.country,
        billing.street,
        billing.houseNumber,
        billing.addressLine2,
        billing.addressLine3,
        billing.apartment,
        billing.floor,
        billing.building,
        billing.postcode,
        billing.city,
        billing.district,
        billing.state,
        billing.country === 'Country' ? '' : billing.country
    ];
    return Boolean(String(profile.title || '').trim()) &&
        fillableValues.some(value => String(value || '').trim());
}

async function updateAutofillAvailability(activeTitle = profileActive.value) {
    const active = profiles.find(profile => profile.title === activeTitle);
    const hasUsableProfile = profiles.some(isProfileUsable);
    const ready = isProfileUsable(active);

    if (!ready && toggle.checked) {
        toggle.checked = false;
        await chrome.storage.sync.set({ autofillEnabled: false });
    }

    const enabled = ready && toggle.checked;
    toggle.disabled = !ready;
    profileActive.disabled = profiles.length === 0;
    activationControl.classList.toggle('unavailable', !ready);
    activationControl.classList.toggle('enabled', enabled);
    activationTitle.textContent = enabled ? 'Autofill enabled' : 'Autofill disabled';
    autofillStatus.textContent = ready
        ? ''
        : hasUsableProfile
            ? 'Select an active profile'
            : 'Add at least one profile detail';

    await renderSetupGuide();
}

async function renderSetupGuide() {
    const active = profiles.find(profile => profile.title === profileActive.value);
    const profileDone = profiles.some(isProfileUsable);
    const activeDone = isProfileUsable(active);
    const methodDone = activeDone && Boolean(
        document.querySelector('input[name="autofillOption"]:checked')
    );
    const enabledDone = activeDone && toggle.checked;
    const shouldShow = !onboardingPreferences.onboardingCompleted &&
        !onboardingPreferences.onboardingDismissed &&
        !enabledDone;
    setupGuide.hidden = !shouldShow;
    if (!shouldShow) return;

    const states = {
        profile: profileDone,
        active: activeDone,
        enable: methodDone,
        activate: enabledDone
    };
    Object.entries(states).forEach(([name, complete]) => {
        const row = setupGuide.querySelector(`[data-setup-step="${name}"]`);
        row.classList.toggle('complete', complete);
        const current = !complete && (
            (name === 'profile' && !profileDone) ||
            (name === 'active' && profileDone && !activeDone) ||
            (name === 'enable' && activeDone && !methodDone) ||
            (name === 'activate' && methodDone && !enabledDone)
        );
        row.setAttribute('aria-current', current ? 'step' : 'false');
        const state = row.querySelector('.setup-step-state');
        if (state) state.textContent = complete ? 'Done' : current ? 'Next' : 'Waiting';
    });
    setupCreateProfileButton.hidden = profileDone;
    setupChooseMethodButton.hidden = !activeDone;
    setupChooseMethodButton.textContent = methodDone ? 'Change method' : 'Choose method';
    setupGuideCopy.textContent = !profileDone
        ? 'Create a profile with at least one detail to continue.'
        : !activeDone
            ? 'Select the profile Autofill should use.'
            : !methodDone
                ? 'Choose a fill method.'
                : 'Enable Autofill in the top-right corner.';
}

async function initializeProfileData() {
    const state = await runtimeRequest('getProfileStore');
    profileData = {
        profiles: state.profiles || [],
        customRules: state.customRules || []
    };
    profiles = profileData.profiles;
    legacyRecovery.hidden = !state.legacyEncryptedData;
}

async function saveProfileData() {
    profileData.profiles = profiles;
    profileData = await runtimeRequest('saveProfileStore', { data: profileData });
    profiles = profileData.profiles;
}

async function loadProfiles() {
    profileSelection.innerHTML = `<option value="">Select profile</option>`; // Clear existing options
    profileActive.innerHTML = `<option value="">Select profile</option>`; // Clear active profile options
    profileForm.reset();
    clearProfileFormError();
    profileForm.scrollTop = 0;
    setActiveProfileSection('profile-identity');
    editingProfileTitle = '';
    companyNameInput.disabled = true;
    vatIdInput.disabled = true;
    billingSameAsShippingInput.checked = true;
    billingAddressFields.hidden = true;

    // Retrieve profiles and activeProfile from storage
    const result = await chrome.storage.sync.get([
        'activeProfile',
        'autofillOption',
        'whitelistDomains',
        'blacklistDomains'
    ]);

    const activeProfile = result.activeProfile;
    profiles = profileData.profiles || [];

    // Populate profile dropdowns
    profiles.forEach(profile => {
        const option = document.createElement('option');
        option.textContent = profile.title;
        option.value = profile.title;

        profileSelection.appendChild(option);
        profileActive.appendChild(option.cloneNode(true));
    });

    // Set the active profile selection if it exists
    if (activeProfile) {
        profileActive.value = activeProfile;
    }

    await updateAutofillAvailability(profileActive.value);

    // Disable delete button by default
    deleteProfileButton.disabled = true;

    // ---- AUTOFILL SETTINGS LOAD ----
    // Retrieve and apply autofill settings
    const autofillOption = result.autofillOption || 'autofill-button';
    const whitelistDomains = result.whitelistDomains || [];
    const blacklistDomains = result.blacklistDomains || [];

    // Set radio button for autofill option
    document.querySelector(`input[name="autofillOption"][value="${autofillOption}"]`).checked = true;

    // Set whitelist and blacklist textboxes based on autofillOption
    const whitelistInput = document.getElementById('whitelist-input');
    const blacklistInput = document.getElementById('blacklist-input');

    if (autofillOption === 'whitelisted-websites') {
        whitelistInput.disabled = false;
        whitelistInput.value = whitelistDomains.join(', '); // Populate whitelist domains
        blacklistInput.disabled = true;
    } else if (autofillOption === 'blacklisted-websites') {
        blacklistInput.disabled = false;
        blacklistInput.value = blacklistDomains.join(', '); // Populate blacklist domains
        whitelistInput.disabled = true;
    } else {
        // Disable both inputs for "all-websites" option
        whitelistInput.disabled = true;
        blacklistInput.disabled = true;
    }
    updateProfileNavigation();
}


function toggleTextboxes() {
        if (whitelistRadio.checked) {
            whitelistInput.disabled = false;
            blacklistInput.disabled = true;
        } else if (blacklistRadio.checked) {
            whitelistInput.disabled = true;
            blacklistInput.disabled = false;
        } else {
            // For "all-websites" AND "autofill-button"
            whitelistInput.disabled = true;
            blacklistInput.disabled = true;
        }
    }

    billingCountrySelect.innerHTML = countrySelect.innerHTML;
    billingSameAsShippingInput.addEventListener('change', () => {
        billingAddressFields.hidden = billingSameAsShippingInput.checked;
        updateProfileNavigation();
    });

    function enhanceProfileLabels() {
        const labels = {
            'profile-title': 'Profile name',
            salutation: 'Salutation',
            type: 'Profile type',
            'company-name': 'Company',
            'vat-id': 'VAT number',
            'first-name': 'First name',
            'middle-name': 'Middle name',
            'last-name': 'Last name',
            street: 'Street',
            'house-number': 'House number',
            'street-addition': 'Address line 2',
            'address-line-3': 'Address line 3',
            apartment: 'Apartment or unit',
            floor: 'Floor',
            building: 'Building',
            postcode: 'Post code',
            city: 'City',
            district: 'District or suburb',
            state: 'State or region',
            country: 'Country',
            'billing-street': 'Street',
            'billing-house-number': 'House number',
            'billing-address-line-2': 'Address line 2',
            'billing-address-line-3': 'Address line 3',
            'billing-apartment': 'Apartment or unit',
            'billing-floor': 'Floor',
            'billing-building': 'Building',
            'billing-postcode': 'Post code',
            'billing-city': 'City',
            'billing-district': 'District or suburb',
            'billing-state': 'State or region',
            'billing-country': 'Country',
            'dob-day': 'Birth day',
            'dob-month': 'Birth month',
            'dob-year': 'Birth year',
            'e-mail': 'Email address',
            'pre-dial': 'Country calling code',
            telephone: 'Phone number',
            'cc-number': 'Card number',
            'cc-month': 'Expiry month',
            'cc-year': 'Expiry year',
            'cc-cvc': 'CVC',
            iban: 'IBAN',
            bic: 'BIC'
        };
        const examples = {
            'dob-day': 'DD',
            'dob-month': 'MM',
            'dob-year': 'YYYY',
            'pre-dial': '+49'
        };
        const required = new Set(['profile-title']);
        profileForm.querySelectorAll('.input-group > input, .input-group > select').forEach(control => {
            if (control.closest('.profile-field')) return;
            const wrapper = document.createElement('label');
            wrapper.className = 'profile-field';
            const text = document.createElement('span');
            text.textContent = `${labels[control.id] || control.placeholder || control.id}${required.has(control.id) ? ' *' : ''}`;
            control.parentNode.insertBefore(wrapper, control);
            wrapper.append(text, control);
            if (examples[control.id]) control.placeholder = examples[control.id];
            else control.removeAttribute('placeholder');
            if (required.has(control.id)) control.setAttribute('aria-required', 'true');
        });
    }

    async function openProfileCreation() {
        await loadProfiles();
        showSection(profilesContent, profilesButton);
        profileTitleInput.focus({ preventScroll: true });
        profileTitleInput.scrollIntoView({ block: 'center' });
    }

    newProfileButton.addEventListener('click', openProfileCreation);
    setupCreateProfileButton.addEventListener('click', openProfileCreation);
    setupChooseMethodButton.addEventListener('click', () => {
        showSection(settingsContent, settingsButton);
        const behavior = document.getElementById('autofill-behavior');
        behavior.scrollIntoView({ block: 'center' });
        behavior.querySelector('input:checked')?.focus({ preventScroll: true });
    });

    startOnboardingButton.addEventListener('click', async () => {
        onboardingDialog.close();
        onboardingPreferences.onboardingDismissed = false;
        onboardingPreferences.onboardingWelcomeSeen = true;
        await chrome.storage.local.set({
            onboardingDismissed: false,
            onboardingWelcomeSeen: true
        });
        await renderSetupGuide();
        if (profiles.length === 0) {
            await openProfileCreation();
        } else {
            showSection(settingsContent, settingsButton);
            profileActive.focus({ preventScroll: true });
        }
    });
    restartOnboardingButton.addEventListener('click', async () => {
        onboardingPreferences.onboardingCompleted = false;
        onboardingPreferences.onboardingDismissed = false;
        onboardingPreferences.onboardingWelcomeSeen = true;
        startOnboardingButton.textContent = profiles.length > 0 ? 'Continue setup' : 'Create first profile';
        openOnboardingDialog();
        try {
            await chrome.storage.local.set({
                onboardingCompleted: false,
                onboardingDismissed: false,
                onboardingWelcomeSeen: true
            });
        } catch (error) {
            showNotice('Could not reset onboarding progress.', { tone: 'error' });
        }
    });
    dismissOnboardingButton.addEventListener('click', async () => {
        onboardingDialog.close();
        onboardingPreferences.onboardingDismissed = true;
        onboardingPreferences.onboardingWelcomeSeen = true;
        await chrome.storage.local.set({
            onboardingDismissed: true,
            onboardingWelcomeSeen: true
        });
        await renderSetupGuide();
    });
    onboardingDialog.addEventListener('cancel', async () => {
        onboardingPreferences.onboardingDismissed = true;
        onboardingPreferences.onboardingWelcomeSeen = true;
        await chrome.storage.local.set({
            onboardingDismissed: true,
            onboardingWelcomeSeen: true
        });
        await renderSetupGuide();
    });
    onboardingDialog.addEventListener('click', (event) => {
        if (event.target === onboardingDialog) {
            dismissOnboardingButton.click();
        }
    });
    dismissSetupGuideButton.addEventListener('click', async () => {
        onboardingPreferences.onboardingDismissed = true;
        await chrome.storage.local.set({ onboardingDismissed: true });
        await renderSetupGuide();
    });

    restoreLegacyButton.addEventListener('click', async () => {
        legacyError.textContent = '';
        restoreLegacyButton.disabled = true;
        restoreLegacyButton.dataset.state = 'loading';
        try {
            profileData = await runtimeRequest('restoreLegacyProfiles', {
                password: legacyPasswordInput.value
            });
            profiles = profileData.profiles;
            legacyPasswordInput.value = '';
            legacyRecovery.hidden = true;
            await loadProfiles();
            await loadCustomRules();
        } catch (error) {
            legacyError.textContent = error.message;
        } finally {
            restoreLegacyButton.disabled = false;
            delete restoreLegacyButton.dataset.state;
        }
    });

    enhanceProfileLabels();
    profileForm.addEventListener('input', event => {
        if (event.target.matches('input, select')) {
            if (event.target.getAttribute('aria-invalid') === 'true') clearProfileFormError();
            updateProfileNavigation();
        }
    });
    profileForm.addEventListener('change', () => {
        updateProfileNavigation();
    });
    document.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === 's' &&
            profilesContent.classList.contains('active')) {
            event.preventDefault();
            addProfileButton.click();
        }
    });

    async function initializeApp() {
        const [settings, localPreferences] = await Promise.all([
            chrome.storage.sync.get(['autofillEnabled', 'darkMode']),
            chrome.storage.local.get([
                'onboardingCompleted',
                'onboardingDismissed',
                'onboardingWelcomeSeen'
            ])
        ]);
        toggle.checked = settings.autofillEnabled === true;
        if (settings.darkMode) document.body.classList.add('dark-mode');
        onboardingPreferences = {
            onboardingCompleted: localPreferences.onboardingCompleted === true,
            onboardingDismissed: localPreferences.onboardingDismissed === true,
            onboardingWelcomeSeen: localPreferences.onboardingWelcomeSeen === true
        };
        await initializeProfileData();
        await loadProfiles();
        await loadCustomRules();
        await renderSetupGuide();

        const onboardingRequested = new URLSearchParams(location.search).get('onboarding') === '1';
        if ((!onboardingPreferences.onboardingWelcomeSeen && (onboardingRequested || (
            !onboardingPreferences.onboardingCompleted &&
            !onboardingPreferences.onboardingDismissed &&
            profiles.length === 0
        ))) && !onboardingDialog.open) {
            if (profiles.length > 0) startOnboardingButton.textContent = 'Continue setup';
            openOnboardingDialog();
        }
    }

    initializeApp().catch(error => {
        console.error('Could not initialize Autofill Extension.', error);
        showNotice('Could not load Autofill Extension settings.', { tone: 'error', timeout: 0 });
    });

    async function saveSettings() {
        const autofillOption = document.querySelector('input[name="autofillOption"]:checked').value;
        let whitelistDomains = [];
        let blacklistDomains = [];

        // Get whitelist and blacklist domains if applicable
        if (whitelistRadio.checked) {
            whitelistDomains = whitelistInput.value.split(',').map(domain => domain.trim());
        }
        if (blacklistRadio.checked) {
            blacklistDomains = blacklistInput.value.split(',').map(domain => domain.trim());
        }

        await chrome.storage.sync.set({
            autofillOption,
            whitelistDomains,
            blacklistDomains
        });
    }

    autofillOptionsForm.addEventListener('change', function(event) {
        saveSettings();
    });

    importButton.addEventListener("click", () => {
        fileInput.click();
    });

    const PROFILE_VALUE_OPTIONS = [
        ['salutation', 'Salutation'],
        ['companyName', 'Company'],
        ['vatId', 'VAT / USt-IdNr.'],
        ['firstName', 'First name'],
        ['middleName', 'Middle name'],
        ['lastName', 'Last name'],
        ['fullName', 'Full name'],
        ['email', 'Email'],
        ['preDial', 'Pre-dial'],
        ['telephone', 'Telephone as entered'],
        ['telephoneNational', 'Telephone national'],
        ['telephoneNationalSignificant', 'Telephone national without trunk prefix'],
        ['telephoneIntl', 'Telephone international'],
        ['telephoneFull', 'Telephone best full format'],
        ['street', 'Street'],
        ['houseNumber', 'House number'],
        ['streetLine1', 'Street + house number'],
        ['streetAddition', 'Street addition'],
        ['addressLine3', 'Address line 3'],
        ['apartment', 'Apartment / unit'],
        ['floor', 'Floor'],
        ['building', 'Building'],
        ['postcode', 'Post code'],
        ['city', 'City'],
        ['district', 'District / suburb'],
        ['state', 'State / Region'],
        ['country', 'Country'],
        ['billingStreetLine1', 'Billing street + house number'],
        ['billingAddressLine2', 'Billing address line 2'],
        ['billingAddressLine3', 'Billing address line 3'],
        ['billingApartment', 'Billing apartment / unit'],
        ['billingFloor', 'Billing floor'],
        ['billingBuilding', 'Billing building'],
        ['billingPostcode', 'Billing post code'],
        ['billingCity', 'Billing city'],
        ['billingDistrict', 'Billing district / suburb'],
        ['billingState', 'Billing state / region'],
        ['billingCountry', 'Billing country'],
        ['creditcardNumber', 'Credit card number'],
        ['creditcardMonth', 'Credit card month'],
        ['creditcardYear', 'Credit card year'],
        ['creditcardCVC', 'Card CVC'],
        ['bankIban', 'IBAN'],
        ['bankBic', 'BIC'],
        ['day', 'DOB day'],
        ['month', 'DOB month'],
        ['year', 'DOB year']
    ];

    async function loadCustomRules() {
        rules.innerHTML = '';
        const customRules = profileData.customRules || [];
        customRules.forEach(rule => addRuleCard(rule, false));
        renderRulesEmptyState();
    }

    function readRuleCard(card) {
        const action = card.querySelector('.rule-action').value;
        const sourceType = card.querySelector('.rule-source-type').value;
        const valueKey = card.querySelector('.rule-value-key').value;
        const fixedValue = card.querySelector('.rule-fixed-value').value;
        return {
            id: card.dataset.ruleId,
            enabled: card.querySelector('.rule-enabled').checked,
            action,
            type: action,
            cssSelector: card.querySelector('.rule-selector').value.trim(),
            urlPattern: card.querySelector('.rule-url-pattern').value.trim(),
            fillMode: card.querySelector('.rule-fill-mode').value,
            profile: card.querySelector('.rule-profile').value,
            sourceType,
            valueKey,
            fixedValue,
            value: sourceType === 'fixed' ? fixedValue : valueKey
        };
    }

    async function persistRuleCards() {
        const cards = Array.from(rules.querySelectorAll('.rule-card'));
        for (const card of cards) {
            const selector = card.querySelector('.rule-selector').value.trim();
            if (!selector) continue;
            try {
                document.createDocumentFragment().querySelector(selector);
                card.classList.remove('invalid');
            } catch {
                card.classList.add('invalid');
                throw new Error(`Invalid CSS selector: ${selector}`);
            }
        }
        const payload = cards.map(readRuleCard).filter(rule => rule.cssSelector);
        profileData.customRules = payload;
        await saveProfileData();
    }

    function buildProfileOptions(select, currentValue) {
        select.innerHTML = '';
        const all = document.createElement('option');
        all.value = 'All profiles';
        all.textContent = 'All profiles';
        select.appendChild(all);
        profiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.title;
            option.textContent = profile.title;
            select.appendChild(option);
        });
        select.value = currentValue || 'All profiles';
    }

    function buildValueKeyOptions(select, currentValue) {
        select.innerHTML = '';
        PROFILE_VALUE_OPTIONS.forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            select.appendChild(option);
        });
        select.value = currentValue || 'email';
    }

    function updateRuleCardUI(card) {
        const action = card.querySelector('.rule-action').value;
        const sourceType = card.querySelector('.rule-source-type').value;
        const sourceWraps = card.querySelectorAll('.rule-source-wrap');
        const fixedWrap = card.querySelector('.rule-fixed-wrap');
        const fillModeWrap = card.querySelector('.rule-fill-mode-wrap');

        const isClick = action === 'click';
        sourceWraps.forEach(sourceWrap => { sourceWrap.style.display = isClick ? 'none' : ''; });
        fixedWrap.style.display = isClick || sourceType !== 'fixed' ? 'none' : '';
        fillModeWrap.style.display = isClick ? 'none' : '';
        card.querySelector('.rule-value-key').disabled = isClick || sourceType !== 'profile';
        card.querySelector('.rule-fixed-value').disabled = isClick || sourceType !== 'fixed';
        card.querySelector('.rule-source-type').disabled = isClick;
        const valueLabel = sourceType === 'fixed'
            ? 'Fixed value'
            : card.querySelector('.rule-value-key').selectedOptions[0]?.textContent || 'Profile value';
        const urlPattern = card.querySelector('.rule-url-pattern').value.trim();
        const selector = card.querySelector('.rule-selector').value.trim();
        card.querySelector('.rule-name').textContent = isClick ? 'Click control' : `Autofill · ${valueLabel}`;
        card.querySelector('.rule-scope').textContent = urlPattern || 'Every website';
        card.querySelector('.rule-selector-preview').textContent = selector || 'No selector yet';
        card.querySelector('.rule-kind').textContent = isClick ? 'Click' : 'Autofill';
    }

    function refreshRuleNumbers() {
        Array.from(rules.querySelectorAll('.rule-card')).forEach((card, index) => {
            card.querySelector('.rule-number').textContent = String(index + 1).padStart(2, '0');
        });
    }

    function renderRulesEmptyState() {
        const existing = rules.querySelector('.rules-empty');
        const hasCards = Boolean(rules.querySelector('.rule-card'));
        if (hasCards) {
            existing?.remove();
            return;
        }
        if (!existing) {
            const empty = document.createElement('div');
            empty.className = 'rules-empty';
            empty.textContent = 'No custom rules. Add one when Autofill cannot detect a form.';
            rules.appendChild(empty);
        }
    }

    function setRuleEditorOpen(card, open) {
        card.classList.toggle('editing', open);
        const editButton = card.querySelector('.edit-rule');
        editButton.setAttribute('aria-expanded', String(open));
        editButton.setAttribute('aria-label', open ? 'Close rule editor' : 'Edit rule');
        editButton.title = open ? 'Close rule editor' : 'Edit rule';
    }

    function addRuleCard(rule = {}, openEditor = true) {
        rules.querySelector('.rules-empty')?.remove();
        const card = document.createElement('div');
        card.className = 'rule-card';
        card.dataset.ruleId = rule.id || crypto.randomUUID();
        card.innerHTML = `
            <div class="rule-row">
                <div class="rule-card-title">
                    <span class="rule-number"></span>
                    <label class="rule-enabled-label" title="Enable rule">
                        <input type="checkbox" class="rule-enabled" checked>
                        <span class="rule-switch" aria-hidden="true"></span>
                        <span class="visually-hidden">Enabled</span>
                    </label>
                    <span>
                        <strong class="rule-name">Autofill</strong>
                        <small><span class="rule-scope">Every website</span><span aria-hidden="true"> · </span><code class="rule-selector-preview">No selector yet</code></small>
                    </span>
                </div>
                <span class="rule-kind">Autofill</span>
                <div class="rule-row-actions">
                    <button type="button" class="edit-rule icon-button neutral" aria-label="Edit rule" title="Edit rule" aria-expanded="false">
                        <svg class="edit-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="m4 16 3-.7 8-8a1.8 1.8 0 0 0-2.5-2.5l-8 8zM11.8 5.5l2.7 2.7"/></svg>
                        <svg class="close-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg>
                    </button>
                    <button type="button" class="delete-rule icon-button" aria-label="Delete rule" title="Delete rule">
                        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 5.5h12M8 5.5V4h4v1.5M6.5 5.5l.7 10h5.6l.7-10M8.5 8v5M11.5 8v5"/></svg>
                    </button>
                </div>
            </div>
            <div class="rule-editor">
              <div class="rule-grid">
                <div class="field span-2">
                    <label>Website or URL pattern <span class="optional-label">Optional</span></label>
                    <input type="text" class="rule-url-pattern" placeholder="Leave empty for every website">
                </div>
                <div class="field span-2">
                    <label>CSS selector</label>
                    <input type="text" class="rule-selector" placeholder="e.g. input[name='email']">
                </div>
                <div class="field">
                    <label>Action</label>
                    <select class="rule-action">
                        <option value="autofill">Autofill</option>
                        <option value="click">Click</option>
                    </select>
                </div>
                <div class="field">
                    <label>Profile</label>
                    <select class="rule-profile"></select>
                </div>
                <div class="field rule-fill-mode-wrap">
                    <label>Fill behavior</label>
                    <select class="rule-fill-mode">
                        <option value="empty">Only empty fields</option>
                        <option value="overwrite">Overwrite existing value</option>
                    </select>
                </div>
                <div class="field rule-source-wrap">
                    <label>Value source</label>
                    <select class="rule-source-type">
                        <option value="profile">Profile value</option>
                        <option value="fixed">Fixed value</option>
                    </select>
                </div>
                <div class="field rule-source-wrap">
                    <label>Profile value</label>
                    <select class="rule-value-key"></select>
                </div>
                <div class="field span-2 rule-fixed-wrap">
                    <label>Fixed value</label>
                    <input type="text" class="rule-fixed-value" placeholder="e.g. yes, 1, true, Company">
                </div>
              </div>
              <div class="rule-actions">
                  <span class="rule-status" role="status"></span>
                  <button type="button" class="save-rule">Save rule</button>
              </div>
            </div>
        `;

        card.querySelector('.rule-enabled').checked = rule.enabled !== false;
        card.querySelector('.rule-url-pattern').value = rule.urlPattern || '';
        card.querySelector('.rule-selector').value = rule.cssSelector || '';
        card.querySelector('.rule-action').value = rule.action || rule.type || 'autofill';
        card.querySelector('.rule-fill-mode').value = rule.fillMode || 'empty';
        buildProfileOptions(card.querySelector('.rule-profile'), rule.profile);
        buildValueKeyOptions(card.querySelector('.rule-value-key'), rule.valueKey || ((rule.sourceType || 'profile') === 'profile' ? rule.value : 'email'));
        card.querySelector('.rule-source-type').value = rule.sourceType || (rule.fixedValue != null ? 'fixed' : 'profile');
        card.querySelector('.rule-fixed-value').value = rule.fixedValue || (card.querySelector('.rule-source-type').value === 'fixed' ? (rule.value || '') : '');

        card.querySelectorAll('input, select').forEach(control => {
            control.addEventListener('input', () => updateRuleCardUI(card));
            control.addEventListener('change', () => updateRuleCardUI(card));
        });
        card.querySelector('.edit-rule').addEventListener('click', () => {
            setRuleEditorOpen(card, !card.classList.contains('editing'));
        });
        card.querySelector('.rule-enabled').addEventListener('change', () => {
            persistRuleCards().catch(() => {});
        });
        card.querySelector('.save-rule').addEventListener('click', async () => {
            const status = card.querySelector('.rule-status');
            if (!card.querySelector('.rule-selector').value.trim()) {
                card.classList.add('invalid');
                status.textContent = 'CSS selector is required.';
                return;
            }
            try {
                await persistRuleCards();
                card.classList.remove('invalid');
                status.textContent = '';
                setRuleEditorOpen(card, false);
            } catch (error) {
                status.textContent = error.message;
            }
        });
        card.querySelector('.delete-rule').addEventListener('click', async () => {
            const snapshot = readRuleCard(card);
            const originalIndex = Array.from(rules.querySelectorAll('.rule-card')).indexOf(card);
            card.remove();
            refreshRuleNumbers();
            renderRulesEmptyState();
            try {
                await persistRuleCards();
                showNotice('Rule deleted.', {
                    actionLabel: 'Undo',
                    action: async () => {
                        const restoredCard = addRuleCard(snapshot, false);
                        const cards = Array.from(rules.querySelectorAll('.rule-card'));
                        rules.insertBefore(restoredCard, cards[originalIndex] || null);
                        refreshRuleNumbers();
                        await persistRuleCards();
                    }
                });
            } catch (error) {
                const restoredCard = addRuleCard(snapshot, false);
                const cards = Array.from(rules.querySelectorAll('.rule-card'));
                rules.insertBefore(restoredCard, cards[originalIndex] || null);
                refreshRuleNumbers();
                showNotice(error.message, { tone: 'error' });
            }
        });

        rules.appendChild(card);
        updateRuleCardUI(card);
        setRuleEditorOpen(card, openEditor);
        refreshRuleNumbers();
        return card;
    }
    addNewRuleButton.addEventListener('click', () => addRuleCard({}, true));

    fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error('Backup is too large.');
                }
                const backup = JSON.parse(await file.text());
                if (profiles.length || profileData.customRules.length) {
                    const confirmed = await requestConfirmation({
                        title: 'Replace current data?',
                        message: 'Importing this backup replaces current profiles, custom rules and settings.',
                        confirmLabel: 'Replace with backup'
                    });
                    if (!confirmed) return;
                }
                profileData = await runtimeRequest('importBackup', { backup });
                profiles = profileData.profiles;
                location.reload();
            } catch (error) {
                showNotice(error.message, { tone: 'error' });
            } finally {
                fileInput.value = '';
            }
        }
    });

    // Export Settings as JSON
    exportButton.addEventListener("click", async () => {
        try {
            const backup = await runtimeRequest('exportBackup');
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "autofill-extension-backup.json";
            a.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            showNotice(error.message, { tone: 'error' });
        }
    });

    // Handle Add Profile button click
    addProfileButton.addEventListener('click', async function() {
        try {
        // Validate fields
        const profileTitle = profileTitleInput.value.trim();
        const salutation = salutationInput.value;
        const type = typeInput.value;
        const companyName = companyNameInput.value.trim();
        const vatId = vatIdInput.value.trim();
        const firstName = firstNameInput.value.trim();
        const middleName = middleNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const street = streetInput.value.trim();
        const houseNumber = houseNumberInput.value.trim();
        const streetAddition = streetAdditionInput.value.trim();
        const addressLine3 = addressLine3Input.value.trim();
        const apartment = apartmentInput.value.trim();
        const floor = floorInput.value.trim();
        const building = buildingInput.value.trim();
        const postcode = postcodeInput.value.trim();
        const city = cityInput.value.trim();
        const district = districtInput.value.trim();
        const state = stateInput.value.trim();
        const country = countrySelect.value;
        const billingSameAsShipping = billingSameAsShippingInput.checked;
        const email = emailInput.value.trim();
        const preDial = preDialInput.value.trim();
        const telephone = telephoneInput.value.trim();
        const dobDay = dobDayInput.value.trim();
        const dobMonth = dobMonthInput.value.trim();
        const dobYear = dobYearInput.value.trim();
        const creditcardNumber = creditcardNumberInput.value.trim();
        const creditcardMonth = creditcardMonthInput.value.trim();
        const creditcardYear = creditcardYearInput.value.trim();
        const creditcardCVC = creditcardCVCInput.value.replace(/\D/g, '');
		const bankIban = bankIbanInput.value.trim();
		const bankBic = bankBicInput.value.trim();
        // Date of Birth validation (2 digits for day, 2 for month, 4 for year)
        const isDobValid = (
            (dobDay === "" || dobDay.length === 2) &&
            (dobMonth === "" || dobMonth.length === 2) &&
            (dobYear === "" || dobYear.length === 4)
        );


        if (!profileTitle) {
            showProfileFormError('Profile name is missing. Add a name before saving.', [profileTitleInput]);
            return;
        }
        if (!isDobValid) {
            showProfileFormError('Birth date format is invalid. Use DD, MM and YYYY or leave all three empty.', [
                dobDayInput,
                dobMonthInput,
                dobYearInput
            ]);
            return;
        }
        if (creditcardCVC && !/^\d{3,4}$/.test(creditcardCVC)) {
            showProfileFormError('CVC must contain 3 or 4 digits or be left empty.', [creditcardCVCInput]);
            return;
        }

        const shipping = {
            street,
            houseNumber,
            addressLine2: streetAddition,
            addressLine3,
            apartment,
            floor,
            building,
            postcode,
            city,
            district,
            state,
            country
        };
        const billing = billingSameAsShipping ? { ...shipping } : {
            street: billingStreetInput.value.trim(),
            houseNumber: billingHouseNumberInput.value.trim(),
            addressLine2: billingAddressLine2Input.value.trim(),
            addressLine3: billingAddressLine3Input.value.trim(),
            apartment: billingApartmentInput.value.trim(),
            floor: billingFloorInput.value.trim(),
            building: billingBuildingInput.value.trim(),
            postcode: billingPostcodeInput.value.trim(),
            city: billingCityInput.value.trim(),
            district: billingDistrictInput.value.trim(),
            state: billingStateInput.value.trim(),
            country: billingCountrySelect.value
        };
        // Create a profile object
        const newProfile = {
            title: profileTitle,
            salutation,
            type,
            companyName,
            vatId,
            firstName,
            middleName,
            lastName,
            shipping,
            billing,
            billingSameAsShipping,
            email,
            preDial,
            telephone,
            dateOfBirth: {
                day: dobDay,
                month: dobMonth,
                year: dobYear
            },
            creditcardNumber,
            creditcardMonth,
            creditcardYear,
            creditcardCVC,
			bankIban,
			bankBic
        };

        if (editingProfileTitle && editingProfileTitle !== profileTitle &&
            profiles.some(profile => profile.title === profileTitle)) {
            showProfileFormError('Profile name is already used. Choose a different name.', [profileTitleInput]);
            return;
        }
        clearProfileFormError();
        const lookupTitle = editingProfileTitle || profileTitle;
        const existingIndex = profiles.findIndex(profile => profile.title === lookupTitle);
        const creatingFirstProfile = profiles.length === 0 && existingIndex < 0;
        const renamedActiveProfile = editingProfileTitle &&
            editingProfileTitle !== profileTitle &&
            profileActive.value === editingProfileTitle;
        if (existingIndex >= 0) profiles[existingIndex] = newProfile;
        else profiles.push(newProfile);

        await saveSettings();
        await saveProfileData();
        const activeState = await chrome.storage.sync.get('activeProfile');
        const shouldSelectSavedProfile = renamedActiveProfile || !activeState.activeProfile;
        if (shouldSelectSavedProfile) {
            await chrome.storage.sync.set({ activeProfile: profileTitle });
        }
        addProfileButton.dataset.state = 'success';
        addProfileButton.setAttribute('aria-label', 'Profile saved');
        addProfileButton.title = 'Profile saved';
        addProfileButton.querySelector('span').textContent = 'Saved';
        await loadProfiles();
        profileSelection.value = profileTitle;
        profileSelection.dispatchEvent(new Event('change'));
        if (shouldSelectSavedProfile) {
            profileActive.value = profileTitle;
            await updateAutofillAvailability(profileTitle);
        }
        window.setTimeout(() => {
            delete addProfileButton.dataset.state;
            addProfileButton.setAttribute('aria-label', 'Save profile');
            addProfileButton.title = 'Save profile';
            addProfileButton.querySelector('span').textContent = 'Save profile';
        }, 1800);
        if (creatingFirstProfile) {
            showSection(settingsContent, settingsButton);
            document.getElementById('autofill-behavior').scrollIntoView({ block: 'center' });
            document.querySelector('input[name="autofillOption"]:checked')?.focus({ preventScroll: true });
        }
        } catch (error) {
            showNotice(error.message, { tone: 'error' });
        }
    });

    // Enable Delete Profile button only if a profile is selected
    profileSelection.addEventListener("change", () => {
        deleteProfileButton.disabled = profileSelection.value === "";
    });

    // Delete Profile
    deleteProfileButton.addEventListener("click", async () => {
        const selectedProfileTitle = profileSelection.value;
        if (selectedProfileTitle) {
            const originalIndex = profiles.findIndex(profile => profile.title === selectedProfileTitle);
            const deletedProfile = profiles[originalIndex];
            const removingActiveProfile = profileActive.value === selectedProfileTitle;
            const autofillWasEnabled = toggle.checked;

            profiles.splice(originalIndex, 1);
            try {
                await saveProfileData();
                if (removingActiveProfile) {
                    await chrome.storage.sync.set({ activeProfile: '', autofillEnabled: false });
                    toggle.checked = false;
                }

                await loadProfiles();
                showNotice(`Profile "${selectedProfileTitle}" deleted.`, {
                    actionLabel: 'Undo',
                    action: async () => {
                        profiles.splice(originalIndex, 0, deletedProfile);
                        await saveProfileData();
                        if (removingActiveProfile) {
                            await chrome.storage.sync.set({
                                activeProfile: selectedProfileTitle,
                                autofillEnabled: autofillWasEnabled
                            });
                            toggle.checked = autofillWasEnabled;
                        }
                        await loadProfiles();
                        profileSelection.value = selectedProfileTitle;
                        profileSelection.dispatchEvent(new Event('change'));
                        if (removingActiveProfile) {
                            profileActive.value = selectedProfileTitle;
                            await updateAutofillAvailability(selectedProfileTitle);
                        }
                    }
                });
            } catch (error) {
                profiles.splice(originalIndex, 0, deletedProfile);
                showNotice(error.message, { tone: 'error' });
            }
        }
    });


    // Handle profile selection
    profileSelection.addEventListener('change', function() {
        const selectedProfileTitle = profileSelection.value;
        const profile = profiles.find(p => p.title === selectedProfileTitle);
        editingProfileTitle = profile ? selectedProfileTitle : '';
        if (!profile) {
            profileForm.reset();
            companyNameInput.disabled = true;
            vatIdInput.disabled = true;
            billingSameAsShippingInput.checked = true;
            billingAddressFields.hidden = true;
            clearProfileFormError();
            profileForm.scrollTop = 0;
            setActiveProfileSection('profile-identity');
            updateProfileNavigation();
            return;
        }
        const shipping = legacyShippingAddress(profile);
        const billingSameAsShipping = profile.billingSameAsShipping !== false;
        const billing = billingSameAsShipping ? shipping : (profile.billing || profile.billingAddress || {});

        profileTitleInput.value = profile.title;
        salutationInput.value = profile.salutation || '';
        typeInput.value = profile.type || '';
        companyNameInput.value = profile.companyName || '';
        vatIdInput.value = profile.vatId || '';
        firstNameInput.value = profile.firstName || '';
        middleNameInput.value = profile.middleName || '';
        lastNameInput.value = profile.lastName || '';
        streetInput.value = shipping.street || '';
        houseNumberInput.value = shipping.houseNumber || '';
        streetAdditionInput.value = shipping.addressLine2 || '';
        addressLine3Input.value = shipping.addressLine3 || '';
        apartmentInput.value = shipping.apartment || '';
        floorInput.value = shipping.floor || '';
        buildingInput.value = shipping.building || '';
        postcodeInput.value = shipping.postcode || '';
        cityInput.value = shipping.city || '';
        districtInput.value = shipping.district || '';
        stateInput.value = shipping.state || '';
        countrySelect.value = shipping.country && shipping.country !== 'Country' ? shipping.country : '';
        billingSameAsShippingInput.checked = billingSameAsShipping;
        billingAddressFields.hidden = billingSameAsShipping;
        billingStreetInput.value = billing.street || '';
        billingHouseNumberInput.value = billing.houseNumber || '';
        billingAddressLine2Input.value = billing.addressLine2 || '';
        billingAddressLine3Input.value = billing.addressLine3 || '';
        billingApartmentInput.value = billing.apartment || '';
        billingFloorInput.value = billing.floor || '';
        billingBuildingInput.value = billing.building || '';
        billingPostcodeInput.value = billing.postcode || '';
        billingCityInput.value = billing.city || '';
        billingDistrictInput.value = billing.district || '';
        billingStateInput.value = billing.state || '';
        billingCountrySelect.value = billing.country && billing.country !== 'Country' ? billing.country : '';
        emailInput.value = profile.email || '';
        preDialInput.value = profile.preDial || '';
        telephoneInput.value = profile.telephone || '';
        dobDayInput.value = profile.dateOfBirth?.day || '';
        dobMonthInput.value = profile.dateOfBirth?.month || '';
        dobYearInput.value = profile.dateOfBirth?.year || '';
        creditcardNumberInput.value = profile.creditcardNumber || '';
        creditcardMonthInput.value = profile.creditcardMonth || '';
        creditcardYearInput.value = profile.creditcardYear || '';
        creditcardCVCInput.value = profile.creditcardCVC || '';
		bankIbanInput.value = profile.bankIban || '';
		bankBicInput.value = profile.bankBic || '';
        const companyProfile = profile.type === 'Company';
        companyNameInput.disabled = !companyProfile;
        vatIdInput.disabled = !companyProfile;
        profileForm.scrollTop = 0;
        setActiveProfileSection('profile-identity');
        updateProfileNavigation();
    });

    typeInput.addEventListener("change", function() {
        const companyProfile = typeInput.value === "Company";
        companyNameInput.disabled = !companyProfile;
        vatIdInput.disabled = !companyProfile;
        updateProfileNavigation();
     });

    // Save the active profile
    profileActive.addEventListener("change", async function() {
            const selectedProfile = profileActive.value;
            await chrome.storage.sync.set({ activeProfile: selectedProfile });
            await updateAutofillAvailability(selectedProfile);
    });

    // Save the autofill toggle state when it changes
    toggle.addEventListener("change", async function() {
        if (toggle.disabled) return;
        const isEnabled = toggle.checked;
        await chrome.storage.sync.set({ autofillEnabled: isEnabled });
        if (isEnabled) {
            onboardingPreferences.onboardingCompleted = true;
            onboardingPreferences.onboardingDismissed = false;
            await chrome.storage.local.set({
                onboardingCompleted: true,
                onboardingDismissed: false
            });
        }
        await updateAutofillAvailability();
    });

    // Dark mode toggle functionality
    darkModeToggle.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");

        chrome.storage.sync.set({ darkMode: isDarkMode });
    });

    // Function to show only the selected content section and set active menu button
    function showSection(sectionToShow, buttonToActivate) {
        settingsContent.classList.remove("active");
        profilesContent.classList.remove("active");
        customContent.classList.remove("active");
        sectionToShow.classList.add("active");

        settingsButton.classList.remove("active");
        profilesButton.classList.remove("active");
        customButton.classList.remove("active");
        buttonToActivate.classList.add("active");
        [settingsButton, profilesButton, customButton].forEach((button) => {
            if (button === buttonToActivate) {
                button.setAttribute("aria-current", "page");
            } else {
                button.removeAttribute("aria-current");
            }
        });
    }

    // Event listeners for the buttons to display the relevant content
    settingsButton.addEventListener("click", () => showSection(settingsContent, settingsButton));
    profilesButton.addEventListener("click", () => showSection(profilesContent, profilesButton));
    customButton.addEventListener("click", () => showSection(customContent, customButton));
    // Show the "Settings" section by default on page load
    showSection(settingsContent, settingsButton);
});
