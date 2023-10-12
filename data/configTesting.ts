import configOntario from './configOntario.js'

export const config = configOntario

config.application = Object.assign(
  { useTestDatabases: true },
  configOntario.application
)

config.users = {
  testing: ['*testView', '*testUpdate', '*testAdmin'],
  canLogin: ['*testView', '*testUpdate', '*testAdmin'],
  canUpdate: ['*testUpdate'],
  isAdmin: ['*testAdmin'],
  isOperator: ['*testAdmin']
}

export default config
