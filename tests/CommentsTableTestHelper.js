/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
    async addComment({
        id = 'comment-123', content = 'content', owner = 'user-123', thread = 'thread-123', isDelete = false,
    }) {
        const query = {
            text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, NOW())',
            values: [id, content, thread, owner, isDelete],
        };

        await pool.query(query);
    },

    async findCommentById(id) {
        const query = {
            text: 'SELECT * FROM comments WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async cleanTable() {
        await pool.query('TRUNCATE TABLE replies, comments');
    },
};

module.exports = CommentsTableTestHelper;
