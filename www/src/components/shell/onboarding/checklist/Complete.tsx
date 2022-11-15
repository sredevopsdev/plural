import { useMutation } from '@apollo/client'
import {
  A,
  Button,
  Div,
  Flex,
  Span,
} from 'honorable'
import { GitHubLogoIcon, SourcererIcon } from '@pluralsh/design-system'

import { UPDATE_USER } from '../../../users/queries'
import { updateUserFragment } from '../../../../utils/graphql'
import { RootMutationType, RootMutationTypeUpdateUserArgs } from '../../../../generated/graphql'

export function ChecklistComplete() {
  const [updateChecklist, { loading }] = useMutation<RootMutationType, RootMutationTypeUpdateUserArgs>(UPDATE_USER, {
    variables: {
      attributes: {
        onboardingChecklist: {
          dismissed: true,
        },
      },
    },
    update: updateUserFragment,
  })

  return (
    <Flex
      direction="column"
      gap="medium"
    >
      <Flex
        paddingHorizontal="large"
        gap="medium"
      >
        <SourcererIcon width={68} />
        <Flex
          gap="xxsmall"
          direction="column"
        >
          <Span subtitle1>Congratulations!</Span>
          <Span body2>With these first steps completed, you're well on your way to becoming an&nbsp;
            <A
              inline
              href="https://www.plural.sh/community"
              target="_blank"
              rel="noopener noreferrer"
            >
              open-sourcerer
            </A>.
          </Span>
        </Flex>
      </Flex>
      <Div
        height={1}
        backgroundColor="border-input"
      />
      <Flex
        gap="small"
        paddingHorizontal="large"
      >
        <Button
          as="a"
          href="https://github.com/pluralsh/plural"
          target="_blank"
          rel="noopener noreferrer"
          small
          secondary
          startIcon={<GitHubLogoIcon />}
        >Star us on GitHub
        </Button>
        <Flex grow={1} />
        <Button
          small
          loading={loading}
          onClick={() => updateChecklist()}
        >Complete
        </Button>
      </Flex>
    </Flex>
  )
}
