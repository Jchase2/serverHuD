import Permission from "../Models/permission.model";
import { Role } from "../Models/role.model";
import { RolePermissions } from "../Models/rolePerms.model";

export const createPermission = async (permName: string) => {
  try {
    const [createServerPermission, created] = await Permission.findOrCreate({
      where: { name: permName },
    });

    if (created) return createServerPermission?.dataValues.id;
  } catch (err) {
    console.log("ERROR creating permission: ", err);
  }
};

// Create role and associate it with given permissions based on their ids
export const createRole = async (permName: string, permissionIds: number[]) => {
  try {
    const [role, created] = await Role.findOrCreate({
      where: {
        name: permName,
      },
    });

    if (created && permissionIds.length > 0) {
      permissionIds.map(async (permId) => {
        await role.$add("permissions", permId);
      });
    }
    await role.save();
    return role.dataValues.id;
  } catch (err) {
    console.log("Create Role Error: ", err);
  }
};

export const getPermissionIds = async () => {
  const permObjects = await Permission.findAll();
  const permIds = permObjects.map((permObj) => permObj.dataValues.id);
  console.log("PERMISSION IDS: ", permIds);
  return permIds;
};

export const getPermissionIdByName = async (name: string) => {
  const permNameObj = await Permission.findOne({
    where: {
      name: name,
    },
  });

  return permNameObj?.dataValues.id;
};

export const getRoleIds = async () => {
  const roleObjs = await Role.findAll();
  const roleIds = roleObjs.map((roleObj) => roleObj.dataValues.id);
  console.log("ROLE IDS: ", roleIds);
  return roleIds;
};

export const getRoleIdByName = async (name: string) => {
  const roleNameObj = await Role.findOne({
    where: {
      name: name,
    },
  });
  return roleNameObj?.dataValues.id;
};

export const checkRolePerms = async (perms: string[], roleId: number) => {
  const permIds = perms.map((permName) => getPermissionIdByName(permName));
  const rolePermissions = await RolePermissions.findAll({
    where: {
      roleId: roleId,
    },
  });

  const rolePermissionIds = rolePermissions.map(
    (rolePermObj) => rolePermObj?.dataValues?.permissionId
  );

  const hasAllPermissions = permIds.every((permissionId) =>
    rolePermissionIds.includes(permissionId)
  );

  return hasAllPermissions;
};
