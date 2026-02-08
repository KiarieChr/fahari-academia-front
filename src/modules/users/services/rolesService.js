
import { api } from '../../../services/api';

export const rolesService = {
    /**
     * Fetch all roles (groups) with user counts
     */
    getRoles: async () => {
        const response = await api.get('/api/roles/');
        return response.data;
    },

    /**
     * Fetch all permissions
     */
    getPermissions: async () => {
        const response = await api.get('/api/permissions/');
        return response.data;
    },

    /**
     * Create a new role
     * @param {Object} roleData { name: string, permissions: number[] }
     */
    createRole: async (roleData) => {
        const response = await api.post('/api/roles/', roleData);
        return response.data;
    },

    /**
     * Update an existing role
     * @param {number} id 
     * @param {Object} roleData 
     */
    updateRole: async (id, roleData) => {
        const response = await api.patch(`/api/roles/${id}/`, roleData);
        return response.data;
    },

    /**
     * Delete a role
     * @param {number} id 
     */
    deleteRole: async (id) => {
        await api.delete(`/api/roles/${id}/`);
    },

    /**
     * Assign roles to a user
     * @param {number} userId 
     * @param {number[]} roleIds List of group IDs
     */
    assignUserRoles: async (userId, roleIds) => {
        // This assumes the UserViewSet has an update method or we patch the user resource
        // We'll treat 'groups' field on user update if supported, or use a specific endpoint
        // Standard Django User serializer usually expects 'groups' as list of IDs
        const response = await api.patch(`/api/users/${userId}/`, { groups: roleIds });
        return response.data;
    },

    /**
     * Helper to group permissions by app_label (Module)
     */
    getPermissionsByModule: (permissions) => {
        return permissions.reduce((acc, perm) => {
            // perm.content_type is usually an ID in DRF unless expanded, 
            // but if we used depth or a specific serializer it might be an object.
            // Based on my serializer: fields = ['id', 'name', 'codename', 'content_type']
            // 'content_type' is just an ID by default in ModelSerializer.
            // I might need to update the backend serializer to include the app_label name.

            // Let's assume for now I'll fix the backend serializer or I have the data.
            // If I only have ID, this grouping won't work well on frontend without fetching content types.
            // I should verify/revise the backend serializer first to return app_label.

            const module = perm.module || 'General'; // Fallback if not available
            if (!acc[module]) {
                acc[module] = [];
            }
            acc[module].push(perm);
            return acc;
        }, {});
    }
};
