export const sanitize = ({ id, user, group }) => ({ id, userId: user && user.id, groupId: group && group.id })

export const canEdit = ({ roles, id }, { rootUser }) => (
  (roles && roles.admin) || id === rootUser.id
)
  
export const hasRbac = ({ boundRoles }, role) => {
  console.log(boundRoles)
  console.log(role)

  return (boundRoles || []).some(({ permissions }) => permissions.includes(role))
}
