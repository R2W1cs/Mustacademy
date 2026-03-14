import pool from '../config/db.js';

// Get all projects with owner names
export const getAllProjects = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, u.name as owner_name 
            FROM creator_projects p
            JOIN users u ON p.owner_id = u.id
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new project
export const createProject = async (req, res) => {
    const { title, description, skills_required, github_repo } = req.body;
    const owner_id = req.user.id;

    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }

    try {
        const result = await pool.query(`
            INSERT INTO creator_projects (title, description, owner_id, skills_required, github_repo)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [title, description, owner_id, skills_required || [], github_repo]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Submit a join request
export const requestToJoin = async (req, res) => {
    const { project_id, message, skills, motivation, contribution } = req.body;
    const user_id = req.user.id;

    try {
        // Check if project exists and user is not the owner
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id = $1', [project_id]);
        if (project.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.rows[0].owner_id === user_id) {
            return res.status(400).json({ message: 'You cannot join your own project' });
        }

        const result = await pool.query(`
            INSERT INTO project_requests (project_id, user_id, message, skills, motivation, contribution)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [project_id, user_id, message, skills, motivation, contribution]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ message: 'Request already sent' });
        }
        console.error('Error joining project:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get requests for projects I own
export const getMyProjectRequests = async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await pool.query(`
            SELECT r.*, p.title as project_title, u.name as requester_name, u.email as requester_email
            FROM project_requests r
            JOIN creator_projects p ON r.project_id = p.id
            JOIN users u ON r.user_id = u.id
            WHERE p.owner_id = $1
            ORDER BY r.created_at DESC
        `, [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching requests:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Handle a join request (Accept/Decline)
export const handleRequest = async (req, res) => {
    const { request_id } = req.params;
    const { status } = req.body; // 'accepted' or 'declined'
    const user_id = req.user.id;

    if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        // Verify ownership
        const ownershipCheck = await pool.query(`
            SELECT p.owner_id 
            FROM project_requests r
            JOIN creator_projects p ON r.project_id = p.id
            WHERE r.id = $1
        `, [request_id]);

        if (ownershipCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (ownershipCheck.rows[0].owner_id !== user_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(`
            UPDATE project_requests 
            SET status = $1 
            WHERE id = $2
            RETURNING *
        `, [status, request_id]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error handling request:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get my own projects
export const getMyProjects = async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await pool.query(`
            SELECT DISTINCT p.*, u.name as owner_name 
            FROM creator_projects p
            JOIN users u ON p.owner_id = u.id
            LEFT JOIN project_requests r ON p.id = r.project_id AND r.user_id = $1
            WHERE p.owner_id = $1 OR r.status = 'accepted'
            ORDER BY p.created_at DESC
        `, [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching my projects/squads:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, description, skills_required, github_repo, status } = req.body;
    const user_id = req.user.id;

    try {
        // Ownership check
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id = $1', [id]);
        if (project.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.rows[0].owner_id !== user_id) {
            return res.status(403).json({ message: 'Unauthorized: Only the creator can update the project' });
        }

        const result = await pool.query(`
            UPDATE creator_projects 
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                skills_required = COALESCE($3, skills_required),
                github_repo = COALESCE($4, github_repo),
                status = COALESCE($5, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *
        `, [title, description, skills_required, github_repo, status, id]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating project:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const getProjectMembers = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        // Verify ownership first
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id = $1', [id]);
        if (project.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.rows[0].owner_id !== user_id) {
            return res.status(403).json({ message: 'Unauthorized: Only the creator can view the dashboard' });
        }

        const members = await pool.query(`
            SELECT u.id, u.name, u.email, r.skills, r.contribution, r.created_at as joined_at, r.status
            FROM project_requests r
            JOIN users u ON r.user_id = u.id
            WHERE r.project_id = $1 AND r.status = 'accepted'
            ORDER BY r.created_at ASC
        `, [id]);

        res.json(members.rows);
    } catch (err) {
        console.error('Error fetching project members:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const deleteProject = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id = $1', [id]);
        if (project.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.rows[0].owner_id !== user_id) {
            return res.status(403).json({ message: 'Unauthorized: Only the creator can delete the project' });
        }

        await pool.query('DELETE FROM creator_projects WHERE id = $1', [id]);
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeMember = async (req, res) => {
    const { id, userId } = req.params;
    const owner_id = req.user.id;

    try {
        const project = await pool.query('SELECT owner_id FROM creator_projects WHERE id = $1', [id]);
        if (project.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.rows[0].owner_id !== owner_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await pool.query('DELETE FROM project_requests WHERE project_id = $1 AND user_id = $2', [id, userId]);
        res.json({ message: 'Member removed successfully' });
    } catch (err) {
        console.error('Error removing member:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
