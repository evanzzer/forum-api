const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CreatedComment = require('../../Domains/threads/comments/entities/CreatedComment');
const DetailComment = require('../../Domains/threads/comments/entities/DetailComment');
const CommentRepository = require('../../Domains/threads/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addComment(userId, threadId, newComment) {
        const { content } = newComment;
        const id = `comment-${this._idGenerator()}`;

        const query = {
            text: 'INSERT INTO comments VALUES ($1, $2, $3, $4, FALSE, NOW()) RETURNING id, content, owner',
            values: [id, content, threadId, userId],
        };
        const result = await this._pool.query(query);

        return new CreatedComment({ ...result.rows[0] });
    }

    async addLikes(commentId, userId) {
        const id = `likes-${this._idGenerator()}`;

        const query = {
            text: 'INSERT INTO likes VALUES($1, $2, $3)',
            values: [id, userId, commentId],
        };

        await this._pool.query(query);
    }

    async verifyCommentExists(commentId) {
        const query = {
            text: 'SELECT id FROM comments WHERE id = $1',
            values: [commentId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new NotFoundError('comment tidak ditemukan');
    }

    async verifyCommentOwner(commentId, userId) {
        const query = {
            text: 'SELECT id, owner FROM comments WHERE id = $1',
            values: [commentId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new NotFoundError('comment tidak ditemukan');

        if (result.rows[0].owner !== userId) throw new AuthorizationError('Anda tidak berhak mengakses bagian ini!');
    }

    async isLiked(commentId, userId) {
        const query = {
            text: 'SELECT id FROM likes WHERE owner = $1 AND comment = $2',
            values: [userId, commentId],
        };

        const result = await this._pool.query(query);
        return result.rowCount !== 0;
    }

    async getCommentDetails(threadId) {
        const query = {
            text: `SELECT c.id, content, TO_CHAR(date, 'YYYY/MM/dd HH24:MI:SS') AS date, username, is_delete as "isDeleted"
                   FROM comments c INNER JOIN users u ON c.owner = u.id WHERE thread = $1 ORDER BY c.date`,
            values: [threadId],
        };

        const result = await this._pool.query(query);
        return result.rows.map((c) => new DetailComment({ ...c }));
    }

    async getCommentLikes(commentId) {
        const query = {
            text: 'SELECT COUNT(owner) as count FROM likes WHERE comment = $1',
            values: [commentId],
        };

        const result = await this._pool.query(query);
        return parseInt(result.rows[0].count, 10);
    }

    async deleteCommentById(commentId, userId) {
        const query = {
            text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1 AND owner = $2',
            values: [commentId, userId],
        };

        await this._pool.query(query);
    }

    async deleteLikes(commentId, userId) {
        const query = {
            text: 'DELETE FROM likes WHERE owner = $1 AND comment = $2',
            values: [userId, commentId],
        };

        await this._pool.query(query);
    }
}

module.exports = CommentRepositoryPostgres;
