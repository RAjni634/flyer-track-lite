variable "subscription_id" {
  description = "Your Azure subscription ID (run: az account show --query id -o tsv)."
  type        = string
}

variable "prefix" {
  description = "Short lowercase prefix used in resource names."
  type        = string
  default     = "flyertrack"

  validation {
    condition     = can(regex("^[a-z0-9]{3,12}$", var.prefix))
    error_message = "Use 3-12 lowercase letters or digits."
  }
}

variable "location" {
  description = "Azure region for the resource group, Cosmos DB and monitoring."
  type        = string
  default     = "australiaeast"
}

variable "swa_location" {
  description = "Static Web Apps metadata region (the site itself is served globally)."
  type        = string
  default     = "eastasia"

  validation {
    condition     = contains(["westus2", "centralus", "eastus2", "westeurope", "eastasia"], var.swa_location)
    error_message = "Static Web Apps is only available in westus2, centralus, eastus2, westeurope or eastasia."
  }
}

variable "use_cosmos_free_tier" {
  description = "Use the Cosmos DB free tier (only ONE per subscription). Set false if you already have one."
  type        = bool
  default     = true
}

variable "cosmos_throughput" {
  description = "Shared database throughput in RU/s (free tier covers the first 1000)."
  type        = number
  default     = 400
}

variable "log_daily_cap_gb" {
  description = "Daily ingestion cap for Log Analytics, to protect the free allowance."
  type        = number
  default     = 0.2
}
