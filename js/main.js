document.addEventListener("DOMContentLoaded", function() {
    const toggle = document.getElementById("autofill-toggle");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const darkModeIcon = document.getElementById("dark-mode-icon");
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
    const salutationInput = document.getElementById('salutation');
    const typeInput = document.getElementById('type');
    const companyNameInput = document.getElementById('company-name');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const streetInput = document.getElementById('street');
    const houseNumberInput = document.getElementById('house-number');
    const streetAdditionInput = document.getElementById('street-addition');
    const postcodeInput = document.getElementById('postcode');
    const cityInput = document.getElementById('city');
    const countrySelect = document.getElementById('country');
    const emailInput = document.getElementById('e-mail');
    const telephoneInput = document.getElementById('telephone');
    const dobDayInput = document.getElementById('dob-day');
    const dobMonthInput = document.getElementById('dob-month');
    const dobYearInput = document.getElementById('dob-year');
    const creditcardNumberInput = document.getElementById('cc-number');
    const creditcardMonthInput = document.getElementById('cc-month');
    const creditcardYearInput = document.getElementById('cc-year');
    const creditcardCVCInput = document.getElementById('cc-cvc');
    const paypalEmailInput = document.getElementById('pp-email');
    const paypalPasswdInput = document.getElementById('pp-passwd');
    const addProfileButton = document.getElementById('save-profile');
    const deleteProfileButton = document.getElementById("delete-profile");
    const profileForm = document.getElementById("profile-form");
    const allWebsitesRadio = document.querySelector('input[value="all-websites"]');
    const whitelistRadio = document.querySelector('input[value="whitelisted-websites"]');
    const blacklistRadio = document.querySelector('input[value="blacklisted-websites"]');
    const whitelistInput = document.getElementById('whitelist-input');
    const blacklistInput = document.getElementById('blacklist-input');
    const autofillOptionsForm = document.getElementById('autofill-settings-form');
    const addNewRuleButton = document.getElementById('add-new-rule');
    const rules = document.getElementById('rules');
    
    allWebsitesRadio.addEventListener('change', toggleTextboxes);
    whitelistRadio.addEventListener('change', toggleTextboxes);
    blacklistRadio.addEventListener('change', toggleTextboxes);

    // Initialize textboxes based on the default selection (All Websites)
    toggleTextboxes();
    
    var profiles = [];
async function loadProfiles() {
    profileSelection.innerHTML = `<option value="">Select profile</option>`; // Clear existing options
    profileActive.innerHTML = `<option value="">Select profile</option>`; // Clear active profile options
    profileForm.reset();

    // Retrieve profiles and activeProfile from storage
    const result = await chrome.storage.sync.get([
        'activeProfile',
        'profiles',
        'autofillOption',
        'whitelistDomains',
        'blacklistDomains'
    ]);
    
    const activeProfile = result.activeProfile;
    profiles = result.profiles || []; // Set profiles to an empty array if undefined

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

    // Disable delete button by default
    deleteProfileButton.disabled = true;

    // ---- AUTOFILL SETTINGS LOAD ----
    // Retrieve and apply autofill settings
    const autofillOption = result.autofillOption || 'all-websites'; // Default to "all-websites"
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
}

    
    function toggleTextboxes() {
    if (whitelistRadio.checked) {
        whitelistInput.disabled = false;
        blacklistInput.disabled = true;
    } else if (blacklistRadio.checked) {
        whitelistInput.disabled = true;
        blacklistInput.disabled = false;
    } else {
        whitelistInput.disabled = true;
        blacklistInput.disabled = true;
    }
}


    // Load saved state with defaults if not set
    
    try {
        chrome.storage.sync.get(['autofillEnabled', 'darkMode'], function(result) {
            toggle.checked = result.autofillEnabled;
            if (result.darkMode) {
                document.body.classList.add("dark-mode");
                darkModeIcon.src = "./img/dark_mode_icon.png";
            } else {
                darkModeIcon.src = "./img/light_mode_icon.png";
            }
            loadProfiles();

        });
    } catch(e) {
        console.log("Error at settings: " + e);
    }
    
    autofillOptionsForm.addEventListener('change', function(event) {    
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

        chrome.storage.sync.set({ autofillOption: autofillOption, whitelistDomains: whitelistDomains, blacklistDomains: blacklistDomains });

        // Here you would save the settings (e.g., to localStorage or send to a server)
        // localStorage.setItem('autofill-settings', JSON.stringify({ autofillOption, whitelistDomains, blacklistDomains }));
    });
    
    importButton.addEventListener("click", () => {
        fileInput.click();
    });
    
    // Load and populate the saved custom rules from chrome.storage when the page is loaded
    async function loadCustomRules() {
        const result = await chrome.storage.sync.get('customRules');
        const customRules = result.customRules || [];

        // Populate the rules into the DOM
        customRules.forEach(rule => {
            addRuleRow(rule);
        });
    }

    // Add a new rule or update an existing one
    function addRuleRow(rule = null) {
        // Create a container div for each row
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('rule-row');

        // Type Select
        const typeSelect = document.createElement('select');
        typeSelect.innerHTML = `
            <option value="autofill">Autofill</option>
            <option value="click">Click</option>
        `;
        rowDiv.appendChild(typeSelect);

        // Profile Select
        const profileSelect = document.createElement('select');
        let option = document.createElement('option');
        option.value = 'Select profile...';
        option.textContent = 'Select profile...';
        profileSelect.appendChild(option);
        option = document.createElement('option');
        option.value = 'All profiles';
        option.textContent = 'All profiles';
        profileSelect.appendChild(option);
        profiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.title;
            option.textContent = profile.title;
            profileSelect.appendChild(option);
        });
        rowDiv.appendChild(profileSelect);

        // CSS Selector Input
        const cssSelectorInput = document.createElement('input');
        cssSelectorInput.type = 'text';
        cssSelectorInput.placeholder = 'CSS Selector';
        rowDiv.appendChild(cssSelectorInput);

        // Value Input (Initially enabled only if "Autofill" is selected)
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.placeholder = 'Value';
        valueInput.disabled = typeSelect.value !== 'autofill'; // Disable if "Click" is selected
        rowDiv.appendChild(valueInput);

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        rowDiv.appendChild(deleteButton);

        // Load the existing rule data if available (for editing existing rules)
        if (rule) {
            typeSelect.value = rule.type;
            cssSelectorInput.value = rule.cssSelector;
            profileSelect.value = rule.profile;
            valueInput.value = rule.value || '';  // Autofill value
        }

        // Add change event listener on the Type select
        typeSelect.addEventListener('change', () => {
            valueInput.disabled = typeSelect.value !== 'autofill'; // Enable for "Autofill", disable for "Click"
            checkAndSaveRow(rowDiv, typeSelect, profileSelect, cssSelectorInput, valueInput);
        });

        // Add event listener for changes in fields to check if the row is complete
        cssSelectorInput.addEventListener('input', () => checkAndSaveRow(rowDiv, typeSelect, profileSelect, cssSelectorInput, valueInput));
        profileSelect.addEventListener('change', () => checkAndSaveRow(rowDiv, typeSelect, profileSelect, cssSelectorInput, valueInput));
        valueInput.addEventListener('input', () => checkAndSaveRow(rowDiv, typeSelect, profileSelect, cssSelectorInput, valueInput));

        // Save the row to chrome.storage when a complete row is filled or changed
        function checkAndSaveRow(rowDiv, typeSelect, profileSelect, cssSelectorInput, valueInput) {
            const cssSelector = cssSelectorInput.value.trim();
            const profile = profileSelect.value;
            const value = valueInput.value.trim();
            const isAutofill = typeSelect.value === 'autofill';

            // Validation for Autofill: CSS Selector, Profile, and Value must be filled
            if (isAutofill && cssSelector && profile !== 'Select profile...' && value) {
                const rule = { type: 'autofill', cssSelector, profile, value };
                saveRule(rowDiv, rule);
            }
            // Validation for Click: CSS Selector and Profile must be filled (Value is not required)
            else if (!isAutofill && cssSelector && profile !== 'Select profile...') {
                const rule = { type: 'click', cssSelector, profile };
                saveRule(rowDiv, rule);
            } else {
                // If the row is incomplete, remove it from storage (if already saved)
                removeRule(rowDiv);
            }
        }

        // Save the row to chrome storage
        function saveRule(rowDiv, rule) {
            chrome.storage.sync.get('customRules', (result) => {
                let customRules = result.customRules || [];
                
                // Check if this rule already exists, and update it if it does
                const index = customRules.findIndex(existingRule => 
                    existingRule.cssSelector === rule.cssSelector &&
                    existingRule.profile === rule.profile &&
                    existingRule.type === rule.type
                );

                if (index > -1) {
                    // If rule exists, update it
                    customRules[index] = rule;
                } else {
                    // If rule doesn't exist, add it
                    customRules.push(rule);
                }

                chrome.storage.sync.set({ customRules });
            });
        }

        // Remove the row from chrome storage when deleted
        function removeRule(rowDiv) {
            const cssSelector = cssSelectorInput.value.trim();
            const profile = profileSelect.value;
            const value = valueInput.value.trim();
            const isAutofill = typeSelect.value === 'autofill';

            chrome.storage.sync.get('customRules', (result) => {
                let customRules = result.customRules || [];
                
                customRules = customRules.filter(rule => 
                    !(rule.cssSelector === cssSelector && rule.profile === profile && rule.value === value && rule.type === (isAutofill ? 'autofill' : 'click'))
                );

                chrome.storage.sync.set({ customRules });
            });
        }

        // Delete the rule row from the DOM
        deleteButton.addEventListener('click', () => {
            rowDiv.remove(); // Remove row from the DOM
            removeRule(rowDiv); // Remove from chrome storage
        });

        // Append row to container
        rules.appendChild(rowDiv);
    }

    addNewRuleButton.addEventListener('click', addRuleRow);

    // Load custom rules from chrome.storage when the page loads
    loadCustomRules();
    
    fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (file) {
            const text = await file.text();
            const settings = JSON.parse(text);
            await chrome.storage.sync.set(settings);
            alert("Settings imported successfully.");
            location.reload();
        }
    });
    
    // Export Settings as JSON
    exportButton.addEventListener("click", async () => {
        const settings = await chrome.storage.sync.get();
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = "autofill-settings.json";
        a.click();
        
        URL.revokeObjectURL(url);
    });
    
    // Handle Add Profile button click
    addProfileButton.addEventListener('click', function() {
        // Validate fields
        const profileTitle = profileTitleInput.value.trim();
        const salutation = salutationInput.value;
        const type = typeInput.value;
        const companyName = companyNameInput.value.trim();
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const street = streetInput.value.trim();
        const houseNumber = houseNumberInput.value.trim();
        const streetAddition = streetAdditionInput.value.trim();
        const postcode = postcodeInput.value.trim();
        const city = cityInput.value.trim();
        const country = countrySelect.value;
        const email = emailInput.value.trim();
        const telephone = telephoneInput.value.trim();
        const dobDay = dobDayInput.value.trim();
        const dobMonth = dobMonthInput.value.trim();
        const dobYear = dobYearInput.value.trim();
        const creditcardNumber = creditcardNumberInput.value.trim();
        const creditcardMonth = creditcardMonthInput.value.trim();
        const creditcardYear = creditcardYearInput.value.trim();
        const creditcardCVC = creditcardCVCInput.value.trim();
        const paypalEmail = paypalEmailInput.value.trim();
        const paypalPasswd = paypalPasswdInput.value.trim();
        // Date of Birth validation (2 digits for day, 2 for month, 4 for year)
        const isDobValid = (
            (dobDay === "" || dobDay.length === 2) &&
            (dobMonth === "" || dobMonth.length === 2) &&
            (dobYear === "" || dobYear.length === 4)
        );


        // Check if all fields are filled
        if (!profileTitle || !firstName || !lastName || !street || !houseNumber || !postcode || !city || !country || !email || !telephone || !isDobValid || country=="Country") {
            alert("Not all fields has been filled or has incorrect values!");
            return;  // Exit without saving
        }

        // Create a profile object
        const newProfile = {
            title: profileTitle,
            salutation,
            type,
            companyName,
            firstName,
            lastName,
            street,
            houseNumber,
            streetAddition,
            postcode,
            city,
            country,
            email,
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
            paypalEmail,
            paypalPasswd
        };

        // Save the profile to storage
                var i = 0;
                var found = false;
                profiles.forEach(profile => {
                    if (profile.title == profileTitle) {
                        found = true;
                        profiles[i] = newProfile;
                    }
                    i++
                });
                
                if (found==false) {
                    profiles.push(newProfile);
                }
                chrome.storage.sync.set({ profiles: profiles }, function() {
                    alert('Profile saved!');
                    location.reload(); // Reload to update the dropdowns
                });
    

    });
    
    // Enable Delete Profile button only if a profile is selected
    profileSelection.addEventListener("change", () => {
        deleteProfileButton.disabled = profileSelection.value === "";
    });

    // Delete Profile
    deleteProfileButton.addEventListener("click", async () => {
        const selectedProfileTitle = profileSelection.value;
        if (selectedProfileTitle) {
            // Filter out the selected profile by title
            const updatedProfiles = profiles.filter(profile => profile.title !== selectedProfileTitle);

            // Save the updated profiles array back to storage
            await chrome.storage.sync.set({ profiles: updatedProfiles });

            // Provide feedback to the user
            alert(`Profile "${selectedProfileTitle}" deleted successfully.`);

            // Reload the profiles dropdown without refreshing the page
            loadProfiles();
        }
    });

    
    // Handle profile selection
    profileSelection.addEventListener('change', function() {
        const selectedProfileTitle = profileSelection.value;
        chrome.storage.sync.get('profiles', function(data) {
            const profiles = data.profiles || [];
            const profile = profiles.find(p => p.title === selectedProfileTitle);
            if (profile) {
                // Fill in the fields with profile data
                profileTitleInput.value = profile.title;
                salutationInput.value = profile.salutation;
                typeInput.value = profile.type;
                companyNameInput.value = profile.companyName;
                firstNameInput.value = profile.firstName;
                lastNameInput.value = profile.lastName;
                streetInput.value = profile.street;
                houseNumberInput.value = profile.houseNumber;
                streetAdditionInput.value = profile.streetAddition;
                postcodeInput.value = profile.postcode;
                cityInput.value = profile.city;
                countrySelect.value = profile.country;
                emailInput.value = profile.email;
                telephoneInput.value = profile.telephone;
                dobDayInput.value = profile.dateOfBirth.day;
                dobMonthInput.value = profile.dateOfBirth.month;
                dobYearInput.value = profile.dateOfBirth.year;
                creditcardNumberInput.value = profile.creditcardNumber;
                creditcardMonthInput.value = profile.creditcardMonth;
                creditcardYearInput.value = profile.creditcardYear;
                creditcardCVCInput.value = profile.creditcardCVC;
                paypalEmailInput.value = profile.paypalEmail;
                paypalPasswdInput.value = profile.paypalPasswd;
            }
        });
    });
    
    typeInput.addEventListener("change", function() {
        if(typeInput.value == "Private") {
                companyNameInput.disabled = true;
        } else {
                companyNameInput.disabled = false;
        }
     });
     
    // Save the active profile
    profileActive.addEventListener("change", function() {
            const selectedProfile = profileActive.value;
            chrome.storage.sync.set({ activeProfile: selectedProfile });
    });

    // Save the autofill toggle state when it changes
    toggle.addEventListener("change", function() {
        // var profileSelection = document.getElementById("profile-selection");
        // if (profileSelection.value == "None") {
            // alert("Choose a profile first.")
        // } else {
            const isEnabled = toggle.checked;
            chrome.storage.sync.set({ autofillEnabled: isEnabled });
        // }
    });

    // Dark mode toggle functionality
    darkModeToggle.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");
        const isDarkMode = document.body.classList.contains("dark-mode");

        // Change icon based on mode
        darkModeIcon.src = isDarkMode ? "./img/dark_mode_icon.png" : "./img/light_mode_icon.png";
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
    }

    // Event listeners for the buttons to display the relevant content
    settingsButton.addEventListener("click", () => showSection(settingsContent, settingsButton));
    profilesButton.addEventListener("click", () => showSection(profilesContent, profilesButton));
    customButton.addEventListener("click", () => showSection(customContent, customButton));
    // Show the "Settings" section by default on page load
    showSection(settingsContent, settingsButton);
});