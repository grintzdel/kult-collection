import { MedusaService } from "@medusajs/framework/utils"
import ProConfig from "./models/pro-config"
import ProLead from "./models/pro-lead"

class ProSpaceModuleService extends MedusaService({
  ProConfig,
  ProLead,
}) {}

export default ProSpaceModuleService
