import { Box } from 'grommet'
import { Span } from 'honorable'

import Avatar from '../users/Avatar'

export function AuditUser({ user }: { user?: any }) {
  if (!user) return null

  return (
    <Box
      flex={false}
      direction="row"
      gap="xsmall"
      align="center"
    >
      <Avatar
        user={user}
        size="24px"
      />
      <Span>{user.name}</Span>
    </Box>
  )
}
