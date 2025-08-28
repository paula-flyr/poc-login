document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Configuración de Keycloak para el entorno Docker ---
    const keycloakConfig = {
        url: 'https://sso.lm.com',      // APUNTANDO A HTTPS
        realm: 'my-realm',           // El realm que creamos en el docker-compose
        clientId: 'my-webapp'        // El client ID que creamos para la app
    };

    const keycloak = new Keycloak(keycloakConfig);

    // --- 2. Lógica de Almacenamiento en LocalStorage ---
    const TOKEN_STORAGE_KEY = 'keycloak-tokens-docker';

    function saveTokens() {
        if (keycloak.authenticated) {
            const tokens = {
                token: keycloak.token,
                refreshToken: keycloak.refreshToken,
                idToken: keycloak.idToken
            };
            console.log('Authentication successful. Saving tokens to localStorage:', tokens);
            localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
        } else {
            console.log('Not authenticated. Clearing tokens from localStorage.');
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
    }

    function loadTokens() {
        const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedTokens) {
            console.log('Found stored tokens in localStorage. Will try to initialize with them.', JSON.parse(storedTokens));
            return JSON.parse(storedTokens);
        }
        console.log('No tokens found in localStorage.');
        return null;
    }

    // --- 3. Funciones para actualizar la UI ---
    function updateUI() {
        if (keycloak.authenticated) {
            document.getElementById('status').textContent = 'Authenticated';
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'inline-block';
            document.getElementById('refreshBtn').style.display = 'inline-block';

            keycloak.loadUserProfile().then(profile => {
                document.getElementById('userInfo').textContent = JSON.stringify(profile, null, 2);
            });

            document.getElementById('tokenInfo').textContent = JSON.stringify(keycloak.tokenParsed, null, 2);
        } else {
            document.getElementById('status').textContent = 'Not Authenticated';
            document.getElementById('loginBtn').style.display = 'inline-block';
            document.getElementById('logoutBtn').style.display = 'none';
            document.getElementById('refreshBtn').style.display = 'none';
            document.getElementById('userInfo').textContent = 'Not available';
            document.getElementById('tokenInfo').textContent = 'Not available';
        }
    }

    // --- 4. Vinculación de Eventos de Keycloak y UI ---
    keycloak.onAuthSuccess = saveTokens;
    keycloak.onAuthRefreshSuccess = saveTokens;
    keycloak.onAuthLogout = () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        updateUI();
    };

    document.getElementById('loginBtn').addEventListener('click', () => keycloak.login());
    document.getElementById('logoutBtn').addEventListener('click', () => keycloak.logout());
    document.getElementById('refreshBtn').addEventListener('click', () => {
        keycloak.updateToken(30).then(refreshed => {
            if (refreshed) {
                console.log('Token was successfully refreshed');
                updateUI();
            } else {
                console.log('Token not refreshed, still valid');
            }
        }).catch(() => {
            console.error('Failed to refresh token');
            keycloak.clearToken();
        });
    });

    // --- 5. Inicialización de Keycloak ---
    console.log('Starting initialization... Checking for tokens in localStorage first.');
    const storedTokens = loadTokens();

    const initOptions = {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    };

    if (storedTokens) {
        console.log('Code will evaluate if localStorage has the token... and it does.');
        initOptions.token = storedTokens.token;
        initOptions.refreshToken = storedTokens.refreshToken;
        initOptions.idToken = storedTokens.idToken;
    } else {
        console.log('Code will evaluate if localStorage has the token... and it does NOT.');
    }

    keycloak.init(initOptions)
        .then(authenticated => {
            console.log(`Initialization finished. Authenticated: ${authenticated}`);
            if (authenticated) {
                saveTokens(); // Save tokens in case they were refreshed during init
            } else if (storedTokens) {
                console.log('Initialization with stored tokens failed, likely expired. Clearing them.');
                localStorage.removeItem(TOKEN_STORAGE_KEY);
            }
            updateUI();
        })
        .catch(error => {
            console.error('Keycloak initialization failed.', error);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            updateUI();
        });
});