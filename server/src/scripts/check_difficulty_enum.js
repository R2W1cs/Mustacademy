import pool from '../config/db.js';

async function checkDifficultyType() {
    try {
        const res = await pool.query(`
            SELECT udt_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'topics' AND column_name = 'difficulty'
        `);

        if (res.rows.length === 0) {
            console.log("Column 'difficulty' not found in 'topics' table.");
            process.exit(0);
        }

        const { udt_name, data_type } = res.rows[0];
        console.log(`Column: difficulty | Data Type: ${data_type} | UDT Name: ${udt_name}`);

        if (data_type === 'USER-DEFINED') {
            const enumVals = await pool.query(`
                SELECT enumlabel 
                FROM pg_enum 
                JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
                WHERE pg_type.typname = $1
            `, [udt_name]);
            console.log('ENUM_VALUES:', enumVals.rows.map(r => r.enumlabel));
        } else {
            console.log('Not a user-defined type (likely not an ENUM).');
        }

        process.exit(0);
    } catch (e) {
        console.error("Failure:", e);
        process.exit(1);
    }
}

checkDifficultyType();
