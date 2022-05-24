// Threads
const AddThreadUseCase = require('../../../../Applications/useCase/AddThreadUseCase');
const GetThreadDetailsUseCase = require('../../../../Applications/useCase/GetThreadDetailsUseCase');

// Comments
const AddCommentUseCase = require('../../../../Applications/useCase/AddCommentUseCase');
const ToggleCommentLikeUseCase = require('../../../../Applications/useCase/ToggleCommentLikeUseCase');
const DeleteCommentUseCase = require('../../../../Applications/useCase/DeleteCommentUseCase');

// Replies
const AddReplyUseCase = require('../../../../Applications/useCase/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/useCase/DeleteReplyUseCase');

class ThreadsHandler {
    constructor(container) {
        this._container = container;

        this.postThreadHandler = this.postThreadHandler.bind(this);
        this.postCommentHandler = this.postCommentHandler.bind(this);
        this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
        this.putCommentLikes = this.putCommentLikes.bind(this);
        this.postReplyHandler = this.postReplyHandler.bind(this);
        this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
        this.getThreadHandler = this.getThreadHandler.bind(this);
    }

    async postThreadHandler(request, h) {
        const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
        const { id: userId } = request.auth.credentials;
        const addedThread = await addThreadUseCase.execute(userId, request.payload);

        return h.response({
            status: 'success',
            data: {
                addedThread,
            },
        }).code(201);
    }

    async getThreadHandler(request) {
        const getThreadDetailsUsecase = this._container.getInstance(GetThreadDetailsUseCase.name);
        const { threadId } = request.params;
        const thread = await getThreadDetailsUsecase.execute(threadId);

        return {
            status: 'success',
            data: {
                thread,
            },
        };
    }

    async postCommentHandler(request, h) {
        const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
        const { threadId } = request.params;
        const { id: userId } = request.auth.credentials;
        const addedComment = await addCommentUseCase.execute(userId, threadId, request.payload);

        return h.response({
            status: 'success',
            data: {
                addedComment,
            },
        }).code(201);
    }

    async deleteCommentHandler(request) {
        const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
        const { threadId, commentId } = request.params;
        const { id: userId } = request.auth.credentials;
        await deleteCommentUseCase.execute(userId, threadId, commentId);

        return {
            status: 'success',
            message: 'comment berhasil dihapus',
        };
    }

    async putCommentLikes(request) {
        const toggleContainerUseCase = this._container.getInstance(ToggleCommentLikeUseCase.name);
        const { threadId, commentId } = request.params;
        const { id: userId } = request.auth.credentials;
        await toggleContainerUseCase.execute(threadId, commentId, userId);

        return {
            status: 'success',
        };
    }

    async postReplyHandler(request, h) {
        const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
        const { threadId, commentId } = request.params;
        const { id: userId } = request.auth.credentials;
        const addedReply = await addReplyUseCase.execute(
            userId, threadId, commentId, request.payload,
        );

        return h.response({
            status: 'success',
            data: {
                addedReply,
            },
        }).code(201);
    }

    async deleteReplyHandler(request) {
        const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
        const { threadId, commentId, replyId } = request.params;
        const { id: userId } = request.auth.credentials;
        await deleteReplyUseCase.execute(userId, threadId, commentId, replyId);

        return {
            status: 'success',
            message: 'comment berhasil dihapus',
        };
    }
}

module.exports = ThreadsHandler;
