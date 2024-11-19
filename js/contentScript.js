const countryMapping = {
    "AF": ["Afghanistan", "Afganistán"],
    "AL": ["Albania", "Albanien", "Albanie"],
    "DZ": ["Algeria", "Algerien", "Algérie", "Argelia"],
    "AS": ["American Samoa", "Amerikanisch-Samoa", "Samoa américaines", "Samoa Americana"],
    "AD": ["Andorra", "Andorre"],
    "AO": ["Angola"],
    "AI": ["Anguilla", "Anguila"],
    "AQ": ["Antarctica", "Antarktis", "Antarctique", "Antártida"],
    "AG": ["Antigua and Barbuda", "Antigua und Barbuda", "Antigua-et-Barbuda", "Antigua y Barbuda"],
    "AR": ["Argentina"],
    "AM": ["Armenia"],
    "AW": ["Aruba"],
    "AU": ["Australia", "Australien", "Australie"],
    "AT": ["Austria", "Österreich", "Autriche"],
    "AZ": ["Azerbaijan", "Aserbaidschan", "Azerbaïdjan", "Azerbaiyán"],
    "BS": ["Bahamas"],
    "BH": ["Bahrain", "Bahreïn", "Baréin"],
    "BD": ["Bangladesh", "Bangladés"],
    "BB": ["Barbados"],
    "BY": ["Belarus", "Weißrussland", "Biélorussie", "Bielorrusia"],
    "BE": ["Belgium", "Belgien", "Belgique", "Bélgica"],
    "BZ": ["Belize", "Belice"],
    "BJ": ["Benin", "Bénin", "Benín"],
    "BM": ["Bermuda", "Bermudes", "Bermudas"],
    "BT": ["Bhutan", "Bhoutan", "Bután"],
    "BO": ["Bolivia", "Bolivien", "Bolivie"],
    "BA": ["Bosnia and Herzegovina", "Bosnien und Herzegowina", "Bosnie-Herzégovine", "Bosnia y Herzegovina"],
    "BW": ["Botswana", "Botsuana"],
    "BR": ["Brazil", "Brasilien", "Brésil", "Brasil"],
    "IO": ["British Indian Ocean Territory", "Britisches Territorium im Indischen Ozean", "Territoire britannique de l'océan Indien", "Territorio Británico del Océano Índico"],
    "BN": ["Brunei", "Brunéi"],
    "BG": ["Bulgaria", "Bulgarien", "Bulgarie"],
    "BF": ["Burkina Faso"],
    "BI": ["Burundi"],
    "KH": ["Cambodia", "Kambodscha", "Cambodge", "Camboya"],
    "CM": ["Cameroon", "Kamerun", "Cameroun", "Camerún"],
    "CA": ["Canada", "Kanada", "Canadá"],
    "CV": ["Cape Verde", "Cap-Vert", "Cabo Verde"],
    "KY": ["Cayman Islands", "Kaimaninseln", "Îles Caïmans", "Islas Caimán"],
    "CF": ["Central African Republic", "Zentralafrikanische Republik", "République centrafricaine", "República Centroafricana"],
    "TD": ["Chad", "Tschad", "Tchad"],
    "CL": ["Chile"],
    "CN": ["China", "Chine"],
    "CX": ["Christmas Island", "Weihnachtsinsel", "Île Christmas", "Isla de Navidad"],
    "CC": ["Cocos Islands", "Kokosinseln", "Îles Cocos", "Islas Cocos"],
    "CO": ["Colombia", "Kolumbien", "Colombie"],
    "KM": ["Comoros", "Komoren", "Comores", "Comoras"],
    "CG": ["Congo", "Kongo"],
    "CD": ["Congo (DRC)", "Congo (RDC)"],
    "CK": ["Cook Islands", "Îles Cook", "Islas Cook"],
    "CR": ["Costa Rica"],
    "CI": ["Côte d'Ivoire", "Elfenbeinküste", "Costa de Marfil"],
    "HR": ["Croatia", "Kroatien", "Croatie", "Croacia"],
    "CU": ["Cuba"],
    "CW": ["Curaçao"],
    "CY": ["Cyprus", "Zypern", "Chypre", "Chipre"],
    "CZ": ["Czech Republic", "Tschechische Republik", "République tchèque", "República Checa"],
    "DK": ["Denmark", "Dänemark", "Danemark", "Dinamarca"],
    "DJ": ["Djibouti"],
    "DM": ["Dominica"],
    "DO": ["Dominican Republic", "Dominikanische Republik", "République dominicaine", "República Dominicana"],
    "EC": ["Ecuador"],
    "EG": ["Egypt", "Ägypten", "Égypte", "Egipto"],
    "SV": ["El Salvador"],
    "GQ": ["Equatorial Guinea", "Äquatorialguinea", "Guinée équatoriale", "Guinea Ecuatorial"],
    "ER": ["Eritrea", "Érythrée"],
    "EE": ["Estonia", "Estland", "Estonie", "Estonia"],
    "ET": ["Ethiopia", "Äthiopien", "Éthiopie", "Etiopía"],
    "FK": ["Falkland Islands", "Falklandinseln", "Îles Malouines", "Islas Malvinas"],
    "FO": ["Faroe Islands", "Färöer-Inseln", "Îles Féroé", "Islas Feroe"],
    "FJ": ["Fiji", "Fidschi", "Fidji"],
    "FI": ["Finland", "Finnland", "Finlande", "Finlandia"],
    "FR": ["France", "Frankreich", "Francia"],
    "GF": ["French Guiana", "Guyane française", "Guayana Francesa"],
    "PF": ["French Polynesia", "Französisch-Polynesien", "Polynésie française", "Polinesia Francesa"],
    "TF": ["French Southern and Antarctic Lands", "Französische Süd- und Antarktisgebiete", "Terres australes et antarctiques françaises", "Tierras Australes y Antárticas Francesas"],
    "GA": ["Gabon"],
    "GM": ["Gambia"],
    "GE": ["Georgia", "Georgien", "Géorgie", "Georgia"],
    "DE": ["Germany", "Deutschland", "Allemagne", "Alemania"],
    "GH": ["Ghana"],
    "GI": ["Gibraltar"],
    "GR": ["Greece", "Griechenland", "Grèce", "Grecia"],
    "GL": ["Greenland", "Grönland", "Groenland", "Groenlandia"],
    "GD": ["Grenada"],
    "GP": ["Guadeloupe"],
    "GU": ["Guam"],
    "GT": ["Guatemala"],
    "GG": ["Guernsey"],
    "GN": ["Guinea", "Guinée"],
    "GW": ["Guinea-Bissau"],
    "GY": ["Guyana"],
    "HT": ["Haiti", "Haïti"],
    "HM": ["Heard Island and McDonald Islands"],
    "HN": ["Honduras"],
    "HK": ["Hong Kong", "Hong-Kong"],
    "HU": ["Hungary", "Ungarn", "Hongrie", "Hungría"],
    "IS": ["Iceland", "Island", "Islande"],
    "IN": ["India", "Indien", "Inde", "India"],
    "ID": ["Indonesia", "Indonesien", "Indonésie", "Indonesia"],
    "IR": ["Iran"],
    "IQ": ["Iraq", "Irak"],
    "IE": ["Ireland", "Irland", "Irlande", "Irlanda"],
    "IL": ["Israel"],
    "IT": ["Italy", "Italien", "Italie", "Italia"],
    "JM": ["Jamaica", "Jamaïque"],
    "JP": ["Japan", "Japon"],
    "JE": ["Jersey"],
    "JO": ["Jordan", "Jordanien", "Jordanie", "Jordania"],
    "KZ": ["Kazakhstan"],
    "KE": ["Kenya"],
    "KI": ["Kiribati"],
    "KW": ["Kuwait", "Koweït"],
    "KG": ["Kyrgyzstan"],
    "LA": ["Laos"],
    "LV": ["Latvia", "Lettland", "Lettonie", "Letonia"],
    "LB": ["Lebanon", "Liban", "Líbano"],
    "LS": ["Lesotho"],
    "LR": ["Liberia"],
    "LY": ["Libya", "Libyen", "Libye", "Libia"],
    "LI": ["Liechtenstein"],
    "LT": ["Lithuania", "Litauen", "Lituanie", "Lituania"],
    "LU": ["Luxembourg", "Luxemburg", "Luxemburgo"],
    "MO": ["Macau", "Macao"],
    "MG": ["Madagascar", "Madagascar"],
    "MW": ["Malawi"],
    "MY": ["Malaysia", "Malaisie", "Malasia"],
    "MV": ["Maldives"],
    "ML": ["Mali"],
    "MT": ["Malta", "Malte"],
    "MH": ["Marshall Islands", "Îles Marshall"],
    "MQ": ["Martinique"],
    "MR": ["Mauritania", "Mauritanie"],
    "MU": ["Mauritius"],
    "YT": ["Mayotte"],
    "MX": ["Mexico", "Mexique", "México"],
    "FM": ["Micronesia", "Micronésie", "Micronesia"],
    "MD": ["Moldova", "Moldavie"],
    "MC": ["Monaco"],
    "MN": ["Mongolia"],
    "ME": ["Montenegro"],
    "MS": ["Montserrat"],
    "MA": ["Morocco", "Marokko", "Maroc", "Marruecos"],
    "MZ": ["Mozambique"],
    "MM": ["Myanmar"],
    "NA": ["Namibia", "Namibie"],
    "NR": ["Nauru"],
    "NP": ["Nepal"],
    "NL": ["Netherlands", "Niederlande", "Pays-Bas", "Países Bajos"],
    "NC": ["New Caledonia", "Nouvelle-Calédonie", "Nueva Caledonia"],
    "NZ": ["New Zealand", "Neuseeland", "Nouvelle-Zélande", "Nueva Zelanda"],
    "NI": ["Nicaragua"],
    "NE": ["Niger", "Niger", "Níger"],
    "NG": ["Nigeria", "Nigéria", "Nigeria"],
    "NU": ["Niue"],
    "NF": ["Norfolk Island", "Île Norfolk", "Isla Norfolk"],
    "MP": ["Northern Mariana Islands"],
    "NO": ["Norway", "Norwegen", "Norvège", "Noruega"],
    "OM": ["Oman"],
    "PK": ["Pakistan"],
    "PW": ["Palau", "Palaos"],
    "PS": ["Palestine", "Palästina", "Palestina"],
    "PA": ["Panama"],
    "PG": ["Papua New Guinea", "Papouasie-Nouvelle-Guinée"],
    "PY": ["Paraguay"],
    "PE": ["Peru", "Perú"],
    "PH": ["Philippines", "Philippinen", "Philippines"],
    "PL": ["Poland", "Polen", "Pologne", "Polonia"],
    "PT": ["Portugal"],
    "PR": ["Puerto Rico"],
    "QA": ["Qatar"],
    "RE": ["Réunion"],
    "RO": ["Romania", "Rumänien", "Roumanie", "Rumanía"],
    "RU": ["Russia", "Russland", "Russie", "Rusia"],
    "RW": ["Rwanda"],
    "SH": ["Saint Helena"],
    "KN": ["Saint Kitts and Nevis"],
    "LC": ["Saint Lucia"],
    "PM": ["Saint Pierre and Miquelon", "Saint-Pierre-et-Miquelon"],
    "VC": ["Saint Vincent and the Grenadines"],
    "WS": ["Samoa"],
    "SM": ["San Marino", "Saint-Marin"],
    "ST": ["São Tomé and Príncipe"],
    "SA": ["Saudi Arabia", "Arabie saoudite", "Arabia Saudí"],
    "SN": ["Senegal", "Sénégal"],
    "RS": ["Serbia", "Serbien", "Serbie", "Serbia"],
    "SC": ["Seychelles", "Seychelles"],
    "SL": ["Sierra Leone", "Sierra Leona"],
    "SG": ["Singapore", "Singapur"],
    "SX": ["Sint Maarten"],
    "SK": ["Slovakia", "Slovakei", "Slovaquie", "Eslovaquia"],
    "SI": ["Slovenia", "Slowenien", "Slovénie", "Eslovenia"],
    "SB": ["Solomon Islands", "Îles Salomon", "Islas Salomón"],
    "SO": ["Somalia", "Somalie", "Somalia"],
    "ZA": ["South Africa", "Südafrika", "Afrique du Sud", "Sudáfrica"],
    "GS": ["South Georgia and the South Sandwich Islands"],
    "KR": ["South Korea", "Südkorea", "Corée du Sud", "Corea del Sur"],
    "SS": ["South Sudan", "Südsudan"],
    "ES": ["Spain", "Spanien", "Espagne", "España"],
    "LK": ["Sri Lanka", "Sri Lanka"],
    "SD": ["Sudan", "Sudan", "Soudan", "Sudán"],
    "SR": ["Suriname"],
    "SZ": ["Swaziland", "Eswatini"],
    "SE": ["Sweden", "Schweden", "Suède", "Suecia"],
    "CH": ["Switzerland", "Schweiz", "Suisse", "Suiza"],
    "SY": ["Syria", "Syrien", "Syrie", "Siria"],
    "TW": ["Taiwan"],
    "TJ": ["Tajikistan", "Tadschikistan", "Tadjikistan"],
    "TZ": ["Tanzania", "Tansania", "Tanzanie", "Tanzania"],
    "TH": ["Thailand", "Thailand", "Thaïlande", "Tailandia"],
    "TL": ["Timor-Leste"],
    "TG": ["Togo"],
    "TK": ["Tokelau"],
    "TO": ["Tonga"],
    "TT": ["Trinidad and Tobago", "Trinidad et Tobago"],
    "TN": ["Tunisia", "Tunesien", "Tunisie", "Túnez"],
    "TR": ["Turkey", "Türkei", "Turquie", "Turquía"],
    "TM": ["Turkmenistan"],
    "TC": ["Turks and Caicos Islands"],
    "TV": ["Tuvalu"],
    "UG": ["Uganda"],
    "UA": ["Ukraine", "Ukraine", "Ucrania"],
    "AE": ["United Arab Emirates", "Vereinigte Arabische Emirate", "Émirats arabes unis", "Emiratos Árabes Unidos"],
    "GB": ["United Kingdom", "Vereinigtes Königreich", "Royaume-Uni", "Reino Unido"],
    "US": ["United States", "Vereinigte Staaten", "États-Unis", "Estados Unidos"],
    "UY": ["Uruguay"],
    "UZ": ["Uzbekistan"],
    "VU": ["Vanuatu"],
    "VE": ["Venezuela"],
    "VN": ["Vietnam", "Vietnam", "Viêt Nam"],
    "VG": ["British Virgin Islands", "Îles Vierges britanniques"],
    "VI": ["US Virgin Islands", "Îles Vierges américaines"],
    "WF": ["Wallis and Futuna"],
    "EH": ["Western Sahara", "Sahara occidental"],
    "YE": ["Yemen", "Jemen", "Yémen"],
    "ZM": ["Zambia", "Sambia"],
    "ZW": ["Zimbabwe"]
};

const salutationMapping = {
    "Male": ["Herr", "Mr.", "Mr", "Male", "Men", "Man"],
    "Female": ["Frau", "Mrs.", "Mrs", "Ms.", "Ms", "Female", "Women", "Woman"]
}

const typeMapping = {
    "Private": ["Privat", "Private"],
    "Company": ["Firma", "Gewerblich", "Company"]
}

// Define common field selectors
const commonSelectors = {
    salutation: "select[name*='salutation'], select[id*='salutation'], select[placeholder*='salutation'], " +
                "select[name*='Salutation'], select[id*='Salutation'], select[placeholder*='Salutation']",
                 
    type: "select[name*='type'], select[id*='type'], select[placeholder*='type'], " +
          "select[name*='Type'], select[id*='Type'], select[placeholder*='Type']",
          
    companyName: "input[name*='companyName'], input[id*='companyName'], input[placeholder*='companyName'], " +
               "input[name*='cname'], input[id*='cname'], input[placeholder*='cname'], " +
               "input[name*='company-name'], input[id*='company-name'], input[placeholder*='company-name'], " +
               "input[name*='company_name'], input[id*='company_name'], input[placeholder*='company_name'], " +
               "input[name*='company'], input[id*='company'], input[placeholder*='company'], " +
               "input[name*='companyname'], input[id*='companyname'], input[placeholder*='companyname']",
    
    firstName: "input[name*='firstName'], input[id*='firstName'], input[placeholder*='firstName'], " +
               "input[name*='fname'], input[id*='fname'], input[placeholder*='fname'], " +
               "input[name*='given-name'], input[id*='given-name'], input[placeholder*='given-name'], " +
               "input[name*='first_name'], input[id*='first_name'], input[placeholder*='first_name'], " +
               "input[name*='first'], input[id*='first'], input[placeholder*='first'], " +
               "input[name*='firstname'], input[id*='firstname'], input[placeholder*='firstname']",
               
    lastName: "input[name*='lastName'], input[id*='lastName'], input[placeholder*='lastName'], " +
              "input[name*='lname'], input[id*='lname'], input[placeholder*='lname'], " +
              "input[name*='surname'], input[id*='surname'], input[placeholder*='surname'], " +
              "input[name*='last_name'], input[id*='last_name'], input[placeholder*='last_name'], " +
              "input[name*='last'], input[id*='last'], input[placeholder*='last']",

    houseNumber: "input[name*='houseNumber'], input[id*='houseNumber'], input[placeholder*='houseNumber'], " +
                 "input[name*='house_number'], input[id*='house_number'], input[placeholder*='house_number'], " +
                 "input[name*='house'], input[id*='house'], input[placeholder*='house'], " +
                 "input[name*='number'], input[id*='number'], input[placeholder*='number']",
              
    combinedStreet: "input[name*='address'], input[id*='address'], input[placeholder*='address'], " +
                    "input[name*='addressLine'], input[id*='addressLine'], input[placeholder*='addressLine'], " +
                    "input[name*='addr'], input[id*='addr'], input[placeholder*='addr'], " +
                    "input[name*='street[0]'], input[id*='street[0]'], input[placeholder*='street[0]'], " +
                    "input[name*='LoqateSearch'], input[id*='LoqateSearch'], input[placeholder*='LoqateSearch']",

    street: "input[name*='street'], input[id*='street'], input[placeholder*='street'], " +
            "input[name*='address'], input[id*='address'], input[placeholder*='address'], " +
            "input[name*='address-line1'], input[id*='address-line1'], input[placeholder*='address-line1'], " +
            "input[name*='addr1'], input[id*='addr1'], input[placeholder*='addr1']",

    streetAddition: "input[name*='streetAddition'], input[id*='streetAddition'], input[placeholder*='streetAddition'], " +
                    "input[name*='address-line2'], input[id*='address-line2'], input[placeholder*='address-line2'], " +
                    "input[name*='addr2'], input[id*='addr2'], input[placeholder*='addr2'], " +
                    "input[name*='addressLine2'], input[id*='addressLine2'], input[placeholder*='addressLine2'], " +
                    "input[name*='streetAdd'], input[id*='streetAdd'], input[placeholder*='streetAdd'], " +
                    "input[name*='additionalAddressLine1'], input[id*='additionalAddressLine1'], input[placeholder*='additionalAddressLine1']",

    postcode: "input[name*='postcode'], input[id*='postcode'], input[placeholder*='postcode'], " +
              "input[name*='zip'], input[id*='zip'], input[placeholder*='zip'], " +
              "input[name*='postal'], input[id*='postal'], input[placeholder*='postal'], " +
              "input[name*='postalCode'], input[id*='postalCode'], input[placeholder*='postalCode']",

    city: "input[name*='city'], input[id*='city'], input[placeholder*='city'], " +
          "input[name*='locality'], input[id*='locality'], input[placeholder*='locality'], " +
          "input[name*='town'], input[id*='town'], input[placeholder*='town']",

    country: "select[name*='country'], select[id*='country'], select[placeholder*='country'], " +
             "input[name*='country'], input[id*='country'], input[placeholder*='country']",

    email: "input[name*='email'], input[id*='email'], input[placeholder*='email'], " +
           "input[type*='email'], input[placeholder*='email']",

    telephone: "input[name*='tel'], input[id*='tel'], input[placeholder*='tel'], " +
               "input[type*='tel'], input[name*='telephone'], input[id*='telephone'], input[placeholder*='telephone'], " +
               "input[name*='phone'], input[id*='phone'], input[placeholder*='phone'], " +
               "input[name*='phoneNumber'], input[id*='phoneNumber'], input[placeholder*='phoneNumber']",

    dobDay: "input[name*='dob-day'], input[id*='dobDay'], input[placeholder*='dob-day'], " +
            "input[name*='day'], input[id*='day'], input[placeholder*='day'], " +
            "select[name*='dob-day'], select[id*='dobDay'], select[placeholder*='dob-day'], " +
            "select[name*='day'], select[id*='day'], select[placeholder*='day'], " +
            "input[name*='dob_day'], input[id*='dobDay'], input[placeholder*='dob_day']",

    dobMonth: "input[name*='dob-month'], input[id*='dobMonth'], input[placeholder*='dob-month'], " +
              "input[name*='month'], input[id*='month'], input[placeholder*='month'], " +
              "select[name*='dob-month'], select[id*='dobMonth'], select[placeholder*='dob-month'], " +
              "select[name*='month'], select[id*='month'], select[placeholder*='month'], " +
              "input[name*='dob_month'], input[id*='dobMonth'], input[placeholder*='dob_month']",

    dobYear: "input[name*='dob-year'], input[id*='dobYear'], input[placeholder*='dob-year'], " +
             "input[name*='year'], input[id*='year'], input[placeholder*='year'], " +
             "select[name*='dob-year'], select[id*='dobYear'], select[placeholder*='dob-year'], " +
             "select[name*='year'], select[id*='year'], select[placeholder*='year'], " +
             "input[name*='dob_year'], input[id*='dobYear'], input[placeholder*='dob_year']",

    creditcardNumber: "input[name*='cc-number'], input[id*='cc-number'], input[placeholder*='cc-number'], " +
                      "input[name*='creditCardNumber'], input[id*='creditCardNumber'], input[placeholder*='creditCardNumber'], " +
                      "input[name*='cardnumber'], input[id*='cardnumber'], input[placeholder*='cardnumber'], " +
                      "input[name*='card_number'], input[id*='card_number'], input[placeholder*='card_number'], "+
                      "input[name*='CardNumber'], input[id*='CardNumber'], input[placeholder*='CardNumber']",

    creditcardMonth: "input[name*='cc-exp-month'], input[id*='cc-exp-month'], input[placeholder*='cc-exp-month'], " +
                     "input[name*='exp-month'], input[id*='exp-month'], input[placeholder*='exp-month'], " +
                     "input[name*='card_month'], input[id*='card_month'], input[placeholder*='card_month'], " +
                     "select[name*='cc-exp-month'], select[id*='cc-exp-month'], select[placeholder*='cc-exp-month'], " +
                     "select[name*='exp-month'], select[id*='exp-month'], select[placeholder*='exp-month'], " +
                     "select[name*='card_month'], select[id*='card_month'], select[placeholder*='card_month'], " +
                     "input[id*='expMonth'], input[placeholder*='expMonth'], select[id*='expMonth'], select[placeholder*='expMonth']",

    creditcardYear: "input[name*='cc-exp-year'], input[id*='cc-exp-year'], input[placeholder*='cc-exp-year'], " +
                    "input[name*='exp-year'], input[id*='exp-year'], input[placeholder*='exp-year'], " +
                    "input[name*='card_year'], input[id*='card_year'], input[placeholder*='card_year'], " +
                    "select[name*='cc-exp-year'], select[id*='cc-exp-year'], select[placeholder*='cc-exp-year'], " +
                    "select[name*='exp-year'], select[id*='exp-year'], select[placeholder*='exp-year'], " +
                    "select[name*='card_year'], select[id*='card_year'], select[placeholder*='card_year'], " +
                    "input[id*='expYear'], input[placeholder*='expYear'], select[id*='expYear'], select[placeholder*='expYear']",

    creditcardCVC: "input[name*='cc-cvc'], input[id*='cc-cvc'], input[placeholder*='cc-cvc'], " +
                   "input[name*='cc-cvv'], input[id*='cc-cvv'], input[placeholder*='cc-cvv'], " +
                   "input[name*='cvc'], input[id*='cvc'], input[placeholder*='cvc'], " +
                   "input[name*='cvv'], input[id*='cvv'], input[placeholder*='cvv']",
};


const filledFields = new Set();

// Updated fillField function to track filled fields without modifying the DOM
function fillField(field, value) {
    if (!field || !value) return;

    // Skip autofill if the field is already filled
    const fieldIdentifier = field.id || field.name || field.placeholder; // Use a unique identifier
    if (filledFields.has(fieldIdentifier)) return; // Skip if this field was already filled

    // Handle country select dropdowns specifically
    if (field.tagName === "SELECT" && field.matches(commonSelectors.country)) {
        const countryOptions = countryMapping[value];

        if (countryOptions) {
            for (let option of field.options) {
                if (countryOptions.includes(option.text.trim())) {
                    field.value = option.value;
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
    }     
    else if (field.tagName === "SELECT" && field.matches(commonSelectors.salutation)) {
        const salutationOptions = salutationMapping[value];

        if (salutationOptions) {
            for (let option of field.options) {
                if (salutationOptions.includes(option.text.trim())) {
                    field.value = option.value;
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
    }
    else if (field.tagName === "SELECT" && field.matches(commonSelectors.type)) {
        const typeOptions = typeMapping[value];

        if (typeOptions) {
            for (let option of field.options) {
                if (typeOptions.includes(option.text.trim())) {
                    field.value = option.value;
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }
   
    } 
    else if (field.tagName === "SELECT" && field.matches(commonSelectors.dobDay)) {
            for (let option of field.options) {
                if (option.text.trim().includes(value)) {
                    field.value = option.value;
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
     
   
    }     
    
    else {
        // For other input types, use the original typing simulation
        field.value = "";

        const inputEvent = new Event('input', { bubbles: true });
        const changeEvent = new Event('change', { bubbles: true });

        let currentIndex = 0;
        function simulateTyping() {
            if (currentIndex < value.length) {
                field.value += value[currentIndex];
                field.dispatchEvent(inputEvent);
                currentIndex++;
                setTimeout(simulateTyping, 10);
            } else {
                field.dispatchEvent(changeEvent);
                filledFields.add(fieldIdentifier); // Mark as filled
            }
        }
        simulateTyping();
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Function to observe dynamic DOM changes and autofill new fields indefinitely
function observeFormFieldsIndefinitely(currentActiveProfile) {
    const observer = new MutationObserver(debounce(() => {
        autofillGenericForm(currentActiveProfile);
    }, 50)); // Debounce delay to avoid excessive calls

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true // Monitors for new fields and attribute changes
    });

    return observer;
}



// Helper function to check if an element is visible in the viewport
function isVisibleAndEnabled(element) {
    // Check if the element is in the viewport
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top >= 0 &&
                      rect.left >= 0 &&
                      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                      rect.right <= (window.innerWidth || document.documentElement.clientWidth);

    // Check if the element is not disabled or readonly
    const isEnabled = !element.disabled && !element.readOnly && element.tabIndex !== -1;

    // The element must be both visible and enabled
    return isVisible && isEnabled;
}

function autofillGenericForm(currentActiveProfile) {
    let fieldsFilled = true;
    
    document.querySelectorAll('input, select, textarea').forEach(input => {
        // Only autofill if the field is visible
        if (isVisibleAndEnabled(input)) {
            // Salutation
            if (input.matches(commonSelectors.salutation) && currentActiveProfile.salutation) {
                fillField(input, currentActiveProfile.salutation);
            }

            //Type
            if (input.matches(commonSelectors.type) && currentActiveProfile.type) {
                fillField(input, currentActiveProfile.type);
            }
            
            //Company Name
            if (input.matches(commonSelectors.companyName) && currentActiveProfile.companyName && !input.value) {
                fillField(input, currentActiveProfile.companyName);
            }
            
            // First Name
            if (input.matches(commonSelectors.firstName) && currentActiveProfile.firstName && !input.value) {
                fillField(input, currentActiveProfile.firstName);
            }
            
            // Last Name
            if (input.matches(commonSelectors.lastName) && currentActiveProfile.lastName && !input.value) {
                fillField(input, currentActiveProfile.lastName);
            }

            // Email
            if (input.matches(commonSelectors.email) && currentActiveProfile.email && !input.value) {
                fillField(input, currentActiveProfile.email);
            }

            // Telephone
            if (input.matches(commonSelectors.telephone) && currentActiveProfile.telephone && !input.value) {
                fillField(input, currentActiveProfile.telephone);
            }

            // Combined Address (Street + House Number) Check
            if (input.matches(commonSelectors.street) && currentActiveProfile.street && currentActiveProfile.houseNumber && !input.value) {
                // Check if the house number field is missing, meaning it might be a combined field
                const houseNumberField = document.querySelector(commonSelectors.houseNumber);
                
                if (!houseNumberField) {
                    // If no separate house number field, combine street and house number into one field
                    const combinedAddress = `${currentActiveProfile.street} ${currentActiveProfile.houseNumber}`;
                    fillField(input, combinedAddress);
                } else {
                    // Otherwise, just fill the street field with the street address
                    fillField(input, currentActiveProfile.street);
                }
            }

            // House Number (if not handled by combined address)
            if (input.matches(commonSelectors.houseNumber) && currentActiveProfile.houseNumber && !input.value) {
                // Only fill if the house number field is separate and not part of a combined address
                const streetField = document.querySelector(commonSelectors.street);
                
                if (streetField) {
                    fillField(input, currentActiveProfile.houseNumber);
                }
            }

            // Street Addition
            if (input.matches(commonSelectors.streetAddition) && currentActiveProfile.streetAddition && !input.value) {
                fillField(input, currentActiveProfile.streetAddition);
            }

            // Postcode
            if (input.matches(commonSelectors.postcode) && currentActiveProfile.postcode && !input.value) {
                fillField(input, currentActiveProfile.postcode);
            }

            // City
            if (input.matches(commonSelectors.city) && currentActiveProfile.city && !input.value) {
                fillField(input, currentActiveProfile.city);
            }

            // Country
            if (input.matches(commonSelectors.country) && currentActiveProfile.country) {
                fillField(input, currentActiveProfile.country);
            }

            // Date of Birth - Day
            if (input.matches(commonSelectors.dobDay) && currentActiveProfile.dobDay) {
                fillField(input, currentActiveProfile.dobDay);
            }

            // Date of Birth - Month
            if (input.matches(commonSelectors.dobMonth) && currentActiveProfile.dobMonth && !input.value) {
                fillField(input, currentActiveProfile.dobMonth);
            }

            // Date of Birth - Year
            if (input.matches(commonSelectors.dobYear) && currentActiveProfile.dobYear && !input.value) {
                fillField(input, currentActiveProfile.dobYear);
            }

            // Credit Card Number
            if (input.matches(commonSelectors.creditcardNumber) && currentActiveProfile.creditcardNumber && !input.value) {
                fillField(input, currentActiveProfile.creditcardNumber);
            }

            // Credit Card Month
            if (input.matches(commonSelectors.creditcardMonth) && currentActiveProfile.creditcardMonth && !input.value) {
                fillField(input, currentActiveProfile.creditcardMonth);
            }

            // Credit Card Year
            if (input.matches(commonSelectors.creditcardYear) && currentActiveProfile.creditcardYear && !input.value) {
                fillField(input, currentActiveProfile.creditcardYear);
            }

            // Credit Card CVC
            if (input.matches(commonSelectors.creditcardCVC) && currentActiveProfile.creditcardCVC && !input.value) {
                fillField(input, currentActiveProfile.creditcardCVC);
            }
        }
    });

    // If any field is not filled, mark as incomplete
    return Array.from(document.querySelectorAll('input, select, textarea')).every(input => input.value !== "");
}




// Main function to handle autofill process
async function autofillFormOnPageLoad() {

    // Retrieve settings and profile data
    const { autofillEnabled, activeProfile, profiles, autofillOption, whitelistDomains, blacklistDomains } = await chrome.runtime.sendMessage({ type: "getAutofillSettings" });
    if (!autofillEnabled || activeProfile === "") return;

    const currentDomain = window.location.hostname.replace("www.", "");
    const shouldAutofill = (autofillOption === "all-websites") ||
                           (autofillOption === "whitelisted-websites" && whitelistDomains.includes(currentDomain)) ||
                           (autofillOption === "blacklisted-websites" && !blacklistDomains.includes(currentDomain));
    if (!shouldAutofill) return;

    const currentActiveProfile = profiles.find(profile => profile.title === activeProfile);

    // Initial autofill attempt in case fields are already present
    autofillGenericForm(currentActiveProfile);

    // Start the observer to keep checking for new fields indefinitely
    observeFormFieldsIndefinitely(currentActiveProfile);
}

// Execute autofill when the page is loaded
autofillFormOnPageLoad();
