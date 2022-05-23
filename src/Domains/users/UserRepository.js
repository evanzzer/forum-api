/* eslint-disable no-unused-vars */
/* Abstract Class that has unused vars. Suppress with eslint */
class UserRepository {
    async addUser(registerUser) {
        throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async verifyAvailableUsername(username) {
        throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async getPasswordByUsername(username) {
        throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async getIdByUsername(username) {
        throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
}

module.exports = UserRepository;
