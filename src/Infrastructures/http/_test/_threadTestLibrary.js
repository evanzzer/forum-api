const Jwt = require('@hapi/jwt');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

// Supporting Functions
const getAccessToken = async () => {
    await UsersTableTestHelper.addUser({
        id: 'user-001', username: 'dicoding', password: 'secret',
    });
    return Jwt.token.generate({ username: 'dicoding', id: 'user-001' }, process.env.ACCESS_TOKEN_KEY);
};

const getThreadId = async () => {
    await ThreadsTableTestHelper.addThread({
        id: 'thread-001', title: 'a new thread', body: 'a new body', owner: 'user-001',
    });
    return 'thread-001';
};

const getCommentId = async () => {
    await CommentsTableTestHelper.addComment({
        id: 'comment-001', content: 'a new comment', thread: 'thread-001', owner: 'user-001',
    });
    return 'comment-001';
};

const getReplyId = async () => {
    await RepliesTableTestHelper.addReply({
        id: 'reply-001', content: 'a new reply', thread: 'thread-001', comment: 'comment-001', owner: 'user-001',
    });
    return 'reply-001';
};

const insertLikes = async () => {
    await LikesTableTestHelper.addLikes({
        id: 'likes-001', owner: 'user-001', comment: 'comment-001',
    });
};

module.exports = { getAccessToken, getThreadId, getCommentId, getReplyId, insertLikes };
