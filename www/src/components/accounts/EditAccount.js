import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Box, Text, ThemeContext, TextInput } from 'grommet'
import { SIDEBAR_WIDTH } from '../constants'
import { SectionChoice } from '../utils/SectionChoice'
import { useHistory, useParams } from 'react-router'
import { User, ServiceAccounts as ServiceAccountsI, EditField, Group, Oauth, 
         Invoices as InvoicesI, PaymentMethods, Roles as RolesI, Browser as Domain } from 'forge-core'
import { useMutation } from 'react-apollo'
import { UPDATE_ACCOUNT } from './queries'
import { Button, InputCollection, ResponsiveInput, Trash } from 'forge-core'
import { CurrentUserContext } from '../login/CurrentUser'
import { Groups, Roles, Users } from './Directory'
import Avatar from '../users/Avatar'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { CardList } from '../users/BillingDetails'
import Invoices from '../payments/Invoices'
import { OAuthIntegrations } from '../integrations/OAuthIntegrations'
import { ServiceAccounts } from './ServiceAccounts'
import { SectionContentContainer, SectionPortal } from '../Explore'
import { DnsDirectory } from './Domains'
import { Icon } from './Group'
import { GqlError } from '../utils/Alert'

const ICON_SIZE = '12px'

const ViewOptions = {
  EDIT: 'attributes',
  USERS: 'users',
  SRV_ACCTS: 'service-accounts',
  GROUPS: 'groups',
  ROLES: 'roles',
  METHODS: 'methods',
  INVOICES: 'invoices',
  INTEGRATIONS: 'integrations',
  DOMAINS: 'domains',
}

const VIEWS = [
  {text: 'Edit Attributes', view: ViewOptions.EDIT, icon: <EditField size={ICON_SIZE} />, optional: true},
  {text: "Users", view: ViewOptions.USERS, icon: <User size={ICON_SIZE} />},
  {text: "Service Accounts", view: ViewOptions.SRV_ACCTS, icon: <ServiceAccountsI size={ICON_SIZE} />},
  {text: "Groups", view: ViewOptions.GROUPS, icon: <Group size={ICON_SIZE} />},
  {text: 'Roles', view: ViewOptions.ROLES, icon: <RolesI size={ICON_SIZE} />},
  {text: 'Domains', view: ViewOptions.DOMAINS, icon: <Domain size={ICON_SIZE} />},
  {text: 'Payment Methods', view: ViewOptions.METHODS, icon: <PaymentMethods size={ICON_SIZE} />},
  {text: 'Invoices', view: ViewOptions.INVOICES, icon: <InvoicesI size={ICON_SIZE} />},
  {text: 'OAuth Integrations', view: ViewOptions.INTEGRATIONS, icon: <Oauth size={ICON_SIZE} />},
]

function DomainRow({domain: {domain}, removeDomain}) {
  return (
    <Box direction='row' fill='horizontal' align='center' gap='small'>
      <Box fill='horizontal'><Text size='small' weight='bold'>{domain}</Text></Box>
      <Icon 
        icon={Trash}
        tooltip='delete' 
        onClick={() => removeDomain(domain)} 
        iconAttrs={{color: 'error'}} />
    </Box>
  )
}

export const sanitize = ({__typename, ...rest}) => rest

export const canEdit = ({roles, id}, {rootUser}) => (
  (roles && roles.admin) || id == rootUser.id
)

function EditAttributes() {
  const {account} = useContext(CurrentUserContext)
  const [attributes, setAttributes] = useState({name: account.name, domainMappings: account.domainMappings.map(sanitize)})
  const [domain, setDomain] = useState('')
  const [mutation, {loading, error}] = useMutation(UPDATE_ACCOUNT, {variables: {attributes}})
  const removeDomain = useCallback((domain) => {
    setAttributes({...attributes, domainMappings: attributes.domainMappings.filter((d) => d.domain !== domain)})
  }, [attributes, setAttributes])
  const addDomain = useCallback(() => {
    setAttributes({...attributes, domainMappings: [{domain}, ...attributes.domainMappings]})
    setDomain('')
  }, [domain, setDomain, attributes, setAttributes])

  return (
    <SectionContentContainer header='Edit Attributes'>
      <Box fill pad='small' gap='medium' border='between'>
        {error && <GqlError error={error} header='Failed to update account' />}
        <InputCollection>
          <ResponsiveInput
            value={attributes.name}
            label='name'
            onChange={({target: {value}}) => setAttributes({...attributes, name: value})} />
        </InputCollection>
        <Box gap='small' width='50%'>
          <Text size='small' weight={500}>Domain Mappings</Text>
          <Text size='small'><i>register email domains to automatically add users to your account</i></Text>
          {attributes.domainMappings.map((domain) => (
            <DomainRow key={domain.id} domain={domain} removeDomain={removeDomain} />
          ))}
          <Box direction='row' align='center' gap='small'>
            <TextInput
              placeholder='Enter a domain for this account'
              value={domain}
              onChange={({target: {value}}) => setDomain(value)} />
            <Button label='Add domain' onClick={addDomain} />
          </Box>
        </Box>
      </Box>
      <SectionPortal>
        <Button label='Update' loading={loading} onClick={mutation} />
      </SectionPortal>
    </SectionContentContainer>
  )
}

export function EditAccount({billing}) {
  const {account, ...me} = useContext(CurrentUserContext)
  let history = useHistory()
  const {section} = useParams()
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {    
    const prefix = billing ? '/accounts/billing' : '/accounts/edit'
    setBreadcrumbs([
      {text: 'account', url: '/accounts/edit/attributes'},
      {text: section, url: `${prefix}/${section}`}
    ])
  }, [setBreadcrumbs, section, billing])

  return (
    <ThemeContext.Extend value={{global: {input: {padding: '9px'}}}}>
    <Box fill direction='row'>
      <Box gap='xsmall' flex={false} width={SIDEBAR_WIDTH} height='100%' 
           background='backgroundColor' pad='small'>
        <Box direction='row' align='center' gap='small'>
          <Avatar user={account} size='40px' />
          <Text size='small' truncate>{account.name}</Text>
        </Box>
        {VIEWS.map(({text, view, icon, optional}) => (
          (!optional || canEdit(me, account)) && <SectionChoice
            key={view}
            selected={section === view}
            label={text}
            icon={icon}
            onClick={() => history.push(`/accounts/edit/${view}`)} />
        ))}
      </Box>
      <Box fill>
        {section === ViewOptions.EDIT && <EditAttributes />}
        {section === ViewOptions.USERS && <Users />}
        {section === ViewOptions.SRV_ACCTS && <ServiceAccounts />}
        {section === ViewOptions.GROUPS && <Groups />}
        {section === ViewOptions.ROLES && <Roles />}
        {section === ViewOptions.DOMAINS && <DnsDirectory />}
        {section === ViewOptions.METHODS && (
          <SectionContentContainer header='Payment Methods'>
            <CardList />
          </SectionContentContainer>
        )}
        {section === ViewOptions.INVOICES && (
          <SectionContentContainer header='Invoices'>
            <Invoices />
          </SectionContentContainer>
        )}
        {section === ViewOptions.INTEGRATIONS && (
          <SectionContentContainer header='OAuth Integrations'>
            <OAuthIntegrations />
          </SectionContentContainer>
        )}
      </Box>
    </Box>
    </ThemeContext.Extend>
  )
}