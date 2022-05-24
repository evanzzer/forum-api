exports.up = (pgm) => {
    pgm.createTable('likes', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        owner: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'users(id)',
            referencesConstraintName: 'FK_USERS.ID',
            onDelete: 'CASCADE',
        },
        comment: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'comments(id)',
            referencesConstraintName: 'FK_COMMENTS.ID',
            onDelete: 'CASCADE',
        },
    });
};

exports.down = (pgm) => pgm.dropTable('likes');
