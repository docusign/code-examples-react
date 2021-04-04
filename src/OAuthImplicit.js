/**
 * This file's functions are used for OAuthImplicit grant and
 * related authentication operations.
 */
import { toast } from 'react-toastify';

const expirationBuffer = 10 * 60; // 10 minute buffer
const sdkString = 'codeEg_react';
const urlFrag = '/restapi/v2.1'; // DocuSign specific
const log = m => {console.log(m)}
const oauthState = 'oauthState'; // The name of the localStorage item for the OAuth state parameter

class OAuthImplicit {
    //
    // Static methods
    //
    /**
     * Generate a psuedo random string
     * See https://stackoverflow.com/a/27747377/64904
     * @param {integer} len  length of the returned string
     */
    static generateId(len = 40) {
        // dec2hex :: Integer -> String i.e. 0-255 -> '00'-'ff'
        const arr = new Uint8Array((len || 40) / 2);
        function dec2hex(dec) {
        return `0${dec.toString(16)}`.substr(-2);
        }
        window.crypto.getRandomValues(arr);
        return Array.from(arr, dec2hex).join('');
    }

    //
    // constructor for the class
    //
    constructor(app) {
        this.app = app;
    }

    /**
     * Handle incoming OAuth Implicit grant response
     */
    async completeLogin() {
        const config = window.config;
        const hash = window.location.hash
            , accessTokenFound = hash && hash.substring(0,14) === '#access_token=';
        if (!accessTokenFound) {return} // EARLY RETURN

        // Avoiding an injection attack: check that the hash only includes expected characters
        // An example: #access_token=eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQkAAAABAAUABwCA5xeRWULXSAgAgCc7n5xC10gCAHR-9s2Nn_hNv77uMjz2XvIVAAEAAAAYAAEAAAAFAAAADQAkAAAAN2ZiMmFhYmUtYjI3NC00MDQzLWIyYTItY2M1NDg0MGRmMzJkMACA5xeRWULXSBIAAQAAAAsAAABpbnRlcmFjdGl2ZQ.eUVqrmf4wZ8EQRqNPDI2AumqbNVrxlxCD0uq8YCWNDAvC1lAakTdInXUBLMMsjN-NxXChP7UX8VF870-kSsiR9izXj55-YjTHveCyEdJ-V9iSotZpHLZ58Y2ScGF4mreBmZqFX2jVed43NY71b-qAlghTP7VfMulP0KnpYwLWLllNSB-OIlg68tsVhbhiUayC5fLHRv0mm1lB9LCjf5GzeP3TJLTkQ5NiAqEmEGqdmo4r8BkRxxW4X1hBHq2iD3E2cMugdOpMFamUFRw3vHCHdDiJxYMy6RO8ogtpE98n915hj4jTc2wbtRnJqwiDA90mo-eq4pL5uzw1wKVQLqF6A&expires_in=28800&token_type=bearer&state=e3f287fbe932b904a660282242bfc58bd6a67fe2
        // No characters other than #.-&=_ a-z A-Z 0-9 (no spaces)
        const hashRegex = /[^#.\-&=_a-zA-Z0-9]/;
        if (hash.search(hashRegex) !== -1) {
            console.error (`Potential XSS attack via fragment (#) value: ${hash}`);
            toast.error('Potential XSS attack via the fragment value. Please login again.', {
                autoClose: 7000});
            return
        } 

        const oauthStateValue = window.localStorage.getItem(oauthState);
        const regex = /(#access_token=)(.*)(&expires_in=)(.*)(&token_type=)(.*)(&state=)(.*)/
            , results = regex.exec(hash)
            , accessToken = results[2]
            , expiresIn = results[4]
            , incomingState = results[8]
            , stateOk = incomingState === oauthStateValue
            ;
        if (!stateOk) {
            toast.error('State error during login. Please login again.', {
                autoClose: 10000});
            console.error(`OAuth state mismatch!! Expected state: ${oauthStateValue}; received state: ${incomingState}`);
            return // EARLY RETURN
        }
        // hash was good, so erase it from the browser
        window.history.replaceState(null, '', config.DS_APP_URL);
        window.localStorage.clear(); // clean up

        // calculate expires
        let expires = new Date()
        expires.setTime(expires.getTime() + (expiresIn - expirationBuffer)* 1000)
        this.accessToken = accessToken;

        const toastId = toast.success('Completing the login process...', {autoClose: 7000});

        // call /oauth/userinfo for general user info
        // This API method is common for many IdP systems.
        // But the exact format of the response tends to vary.
        // The following works for the DocuSign IdP.
        const userInfo = await this.fetchUserInfo();
        const defaultAccountArray = userInfo.accounts.filter((acc) => acc.is_default);
        const defaultAccount = defaultAccountArray.length > 0 && defaultAccountArray[0];
        if (!defaultAccount) {
            const msg = `Problem: the user does not have a default account. Contact DocuSign Customer Service to fix.`;
            log(msg);
            toast.error(msg, { autoClose: 10000 });
            return;
        }
        // 
        // Need to select the right proxy for the API call
        let baseUri;
        if (defaultAccount.base_uri === config.DS_API_CORS_PROXY_FOR) {
            baseUri = config.DS_API_CORS_PROXY;
        }
        if (!baseUri) {
            const msg = `Problem: no proxy for ${defaultAccount.base_uri}.`;
            log(msg);
            toast.error(msg, { autoClose: 10000 });
            return; 
        }
            
        const externalAccountId = await this.getExternalAccountId(
            defaultAccount.account_id, baseUri);
        toast.dismiss(toastId);
        this.app.oAuthResults({
            accessToken,
            expires,
            name: userInfo.name,
            email: userInfo.email,
            accountId: defaultAccount.account_id,
            externalAccountId,
            accountName: defaultAccount.account_name,
            baseUri: defaultAccount.base_uri,
        })
    }

    /**
     * Start the login flow by computing the Implicit grant URL
     * and redirecting to the URL for the user.
     */
    startLogin() {
        const oauthStateValue = OAuthImplicit.generateId();
        window.localStorage.setItem(oauthState, oauthStateValue); // store for when we come back
        const url =
        `${window.config.DS_IDP}/oauth/auth?` +
        `response_type=token&` +
        `scope=${window.config.IMPLICIT_SCOPES}&` +
        `client_id=${window.config.DS_CLIENT_ID}&` +
        `state=${oauthStateValue}&` +
        `redirect_uri=${encodeURIComponent(window.config.DS_APP_URL)}`;

        window.location = url;
    }

    /**
     * logout of the DocuSign IdP. 
     * If SSO is used, the upstream IdP may not redirect the 
     * browser back to this app
     */
    logout () {
        const url =
        `${window.config.DS_IDP}/logout?` +
        //`response_type=code&` +
        `response_type=token&` +
        `scope=${window.config.IMPLICIT_SCOPES}&` +
        `client_id=${window.config.DS_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(window.config.DS_APP_URL)}&` +
        `response_mode=logout_redirect`;

        window.location = url;
    }

    /**
     * A relatively common OAuth API endpoint for obtaining information
     * on the user associated with the accessToken
     * @returns userInfoResponse JSON 
     */
    async fetchUserInfo() {
        let userInfoResponse
        try {
            userInfoResponse = await fetch(
                `${window.config.DS_AUTHENTICATION}/oauth/userinfo`, {
                headers: new Headers({
                    Authorization: `Bearer ${this.accessToken}`,
                    Accept: `application/json`,
                    'X-DocuSign-SDK': sdkString,
                }),
            })
        } catch (e) {
            const msg = `Problem while completing login.\nPlease retry.\nError: ${e.toString()}`;
            log(msg);
            toast.error(msg, { autoClose: 10000 });
            return null;
        }
        if (!userInfoResponse || !userInfoResponse.ok) {
            const msg = `Problem while completing login.\nPlease retry.\nError: ${userInfoResponse.statusText}`;
            log(msg);
            toast.error(msg, { autoClose: 10000 });
            return null;
        }
        return await userInfoResponse.json();
    }

    /**
     * Fetch the user-friendly version of the accountId.
     * See https://developers.docusign.com/docs/esign-rest-api/reference/accounts/accounts/get/
     */
    async getExternalAccountId(accountId, baseUri) {
        try {
            const url = `${baseUri}${urlFrag}/accounts/${accountId}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: new Headers({
                    Authorization: `Bearer ${this.accessToken}`,
                    Accept: `application/json`,
                    'X-DocuSign-SDK': sdkString,
                })
            });
            const data = response && response.ok && (await response.json());
            return data.externalAccountId;
        } catch (e) {
            return null;
        }
    }
}

export default OAuthImplicit;
