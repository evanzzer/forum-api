/* eslint-disable no-unused-vars */
/* Abstract Class that has unused vars. Suppress with eslint */
class AuthenticationTokenManager {
    async createRefreshToken(payload) {
        throw new Error('AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
    }

    async createAccessToken(payload) {
        throw new Error('AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
    }

    async verifyRefreshToken(token) {
        throw new Error('AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
    }

    async decodePayload() {
        throw new Error('AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
    }
}

module.exports = AuthenticationTokenManager;
