/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
    async addReply({
        id = 'reply-123', content = 'content', owner = 'user-123', thread = 'thread-123', comment = 'comment-123', isDelete = false,
    }) {
        const query = {
            text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, NOW())',
            values: [id, content, thread, comment, owner, isDelete],
        };

        await pool.query(query);
    },

    async findReplyById(id) {
        const query = {
            text: 'SELECT * FROM replies WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async deleteReplyById(id) {
        const query = {
            text: 'UPDATE replies SET is_delete = true WHERE id = $1',
            values: [id],
        };

        await pool.query(query);
    },

    async cleanTable() {
        await pool.query('TRUNCATE TABLE replies');
    },
};

module.exports = RepliesTableTestHelper;
