/* eslint-disable no-unused-vars */
/* Abstract Class that has unused vars. Suppress with eslint */
class AuthenticationRepository {
    async addToken(token) {
        throw new Error('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async checkAvailabilityToken(token) {
        throw new Error('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async deleteToken(token) {
        throw new Error('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
}

module.exports = AuthenticationRepository;
