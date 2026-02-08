
import React from 'react';
import { Shield, Key, Users, Lock } from 'lucide-react';

const RoleStats = ({ roles, permissions }) => {
    const activeRoles = roles.filter(r => r.status === 'active').length;

    return (
        <div className="row mb-4">
            <div className="col-xl-3 col-md-6 mb-4">
                <div className="card h-100 py-2 border-left-primary">
                    <div className="card-body">
                        <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                                <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                    Total Roles
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{roles.length}</div>
                            </div>
                            <div className="col-auto">
                                <Shield size={24} className="text-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
                <div className="card h-100 py-2 border-left-success">
                    <div className="card-body">
                        <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                                <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                    Active Roles
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{activeRoles}</div>
                            </div>
                            <div className="col-auto">
                                <Users size={24} className="text-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
                <div className="card h-100 py-2 border-left-info">
                    <div className="card-body">
                        <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                                <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                    Total Permissions
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{permissions.length}</div>
                            </div>
                            <div className="col-auto">
                                <Key size={24} className="text-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
                <div className="card h-100 py-2 border-left-warning">
                    <div className="card-body">
                        <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                                <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                    System Roles
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">
                                    {roles.filter(r => r.isSystemRole).length}
                                </div>
                            </div>
                            <div className="col-auto">
                                <Lock size={24} className="text-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleStats;
