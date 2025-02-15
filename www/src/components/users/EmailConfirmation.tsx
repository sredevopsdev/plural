import { useCallback, useContext, useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Box, Layer, Text } from 'grommet'
import {
  CloseIcon,
  ErrorIcon,
  IconFrame,
  ReloadIcon,
} from '@pluralsh/design-system'
import moment from 'moment'
import { useParams } from 'react-router-dom'

import { useIsCurrentlyOnboarding } from '../shell/hooks/useOnboarded'
import CurrentUserContext from '../../contexts/CurrentUserContext'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import LoadingIndicator from '../utils/LoadingIndicator'

import { CREATE_RESET_TOKEN, REALIZE_TOKEN } from './queries'
import { ResetTokenType } from './types'
import { LoginPortal } from './LoginPortal'

export function EmailConfirmed() {
  const { id } = useParams()
  const [mutation, { data, error }] = useMutation(REALIZE_TOKEN, {
    variables: { id, attributes: {} },
    onCompleted: () => {
      setTimeout(() => {
        ;(window as Window).location = '/'
      }, 2000)
    },
  })

  useEffect(() => {
    mutation()
  }, [mutation])

  return (
    <LoginPortal>
      <Box
        gap="small"
        width="400px"
      >
        {!data && !error && <LoadingIndicator />}
        {data && (
          <Alert
            status={AlertStatus.SUCCESS}
            header="Email confirmed"
            description="we'll redirect you to Plural shortly"
          />
        )}
        {error && (
          <GqlError
            header="Failed!"
            error={error}
          />
        )}
      </Box>
    </LoginPortal>
  )
}

export function VerifyEmailConfirmed() {
  const [open, setOpen] = useState(true)
  const me = useContext(CurrentUserContext)
  const [mutation] = useMutation(CREATE_RESET_TOKEN, {
    variables: { attributes: { email: me.email, type: ResetTokenType.EMAIL } },
    onCompleted: () => setOpen(false),
  })
  const isCurrentlyOnboarding = useIsCurrentlyOnboarding()

  const close = useCallback(() => setOpen(false), [setOpen])

  if (me.emailConfirmed || me.serviceAccount || !open || isCurrentlyOnboarding)
    return null

  return (
    <Layer
      plain
      modal={false}
      position="top"
      margin={{ top: 'medium' }}
      onEsc={close}
      onClickOutside={close}
    >
      <Box
        round="xsmall"
        direction="row"
        gap="small"
        background="fill-two"
        pad="small"
        align="center"
        border={{ color: 'border' }}
      >
        <Box
          flex={false}
          align="center"
        >
          <ErrorIcon
            size={24}
            color="error"
          />
        </Box>
        <Box
          fill="horizontal"
          align="center"
        >
          <Text
            size="small"
            weight={500}
          >
            Your email is not confirmed
          </Text>
          {me.emailConfirmBy && (
            <Text size="small">
              you have {moment(me.emailConfirmBy).fromNow(true)} to confirm your
              email
            </Text>
          )}
        </Box>
        <Box
          flex={false}
          gap="xsmall"
          direction="row"
          align="center"
        >
          <IconFrame
            icon={<ReloadIcon />}
            clickable
            textValue="Resend"
            tooltip
            tooltipProps={{ placement: 'bottom' }}
            onClick={() => mutation()}
          />
          <IconFrame
            icon={<CloseIcon />}
            clickable
            textValue="Close"
            tooltip
            tooltipProps={{ placement: 'bottom' }}
            onClick={() => setOpen(false)}
          />
        </Box>
      </Box>
    </Layer>
  )
}
