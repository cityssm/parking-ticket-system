import configOntario from "./configOntario.js";


export const config = configOntario;


config.users = {
  testing: ["*testView", "*testUpdate", "*testAdmin"],
  canLogin: ["*testView", "*testUpdate", "*testAdmin"],
  canUpdate: ["*testUpdate"],
  isAdmin: ["*testAdmin"],
  isOperator: ["*testAdmin"]
}


export default config;
