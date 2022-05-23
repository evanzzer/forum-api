const NewComment = require('../../Domains/threads/comments/entities/NewComment');

class AddCommentUseCase {
    constructor({ threadRepository, commentRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
    }

    async execute(userId, threadId, useCasePayload) {
        const newComment = new NewComment(useCasePayload);
        await this._threadRepository.verifyThreadExists(threadId);
        return this._commentRepository.addComment(userId, threadId, newComment);
    }
}

module.exports = AddCommentUseCase;
