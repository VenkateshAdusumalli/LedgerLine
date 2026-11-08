const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  ACCOUNT_HOLDER: "ACCOUNT_HOLDER",
  AUDITOR: "AUDITOR",
});

const ROLE_VALUES = Object.freeze(Object.values(ROLES));
const DEFAULT_ROLE = ROLES.ACCOUNT_HOLDER;

module.exports = { ROLES, ROLE_VALUES, DEFAULT_ROLE };
