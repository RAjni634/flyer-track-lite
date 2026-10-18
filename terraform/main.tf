# Azure design as code (reference only)
# This Terraform is the architecture from architecture/01-target-architecture.md.
# It is NOT deployed in the free Lite project. Validate it with: terraform init -backend=false && terraform validate
# Do NOT run terraform apply unless you want a real Azure environment.

# FlyerTrack - demo infrastructure (free-tier first)

locals {
  tags = {
    project     = "flyertrack"
    environment = "demo"
    managed_by  = "terraform"
  }
}

# Globally-unique names need a random suffix (Cosmos DB account names are global).
resource "random_string" "suffix" {
  length  = 6
  upper   = false
  special = false
}

resource "azurerm_resource_group" "main" {
  name     = "rg-${var.prefix}-demo"
  location = var.location
  tags     = local.tags
}

# ---------- Observability ----------
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.prefix}-log-${random_string.suffix.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  daily_quota_gb      = var.log_daily_cap_gb
  tags                = local.tags
}

resource "azurerm_application_insights" "main" {
  name                = "${var.prefix}-appi-${random_string.suffix.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"
  tags                = local.tags
}

# ---------- Data ----------
resource "azurerm_cosmosdb_account" "main" {
  name                = "${var.prefix}-cosmos-${random_string.suffix.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"
  free_tier_enabled   = var.use_cosmos_free_tier

  minimal_tls_version = "Tls12"
  tags                = local.tags

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }
}

resource "azurerm_cosmosdb_sql_database" "main" {
  name                = "flyertrack"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  throughput          = var.cosmos_throughput # shared by both containers
}

resource "azurerm_cosmosdb_sql_container" "campaigns" {
  name                = "campaigns"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name
  partition_key_paths = ["/id"]
}

resource "azurerm_cosmosdb_sql_container" "locations" {
  name                = "locations"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name
  partition_key_paths = ["/campaignId"]
  default_ttl         = -1 # turns on per-item "ttl" so GPS points can expire

  # Index only what we query: cheaper writes.
  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/campaignId/?"
    }
    included_path {
      path = "/ts/?"
    }
    included_path {
      path = "/accuracy/?"
    }
    excluded_path {
      path = "/*"
    }
  }
}

# ---------- Web + API hosting ----------
resource "azurerm_static_web_app" "main" {
  name                = "${var.prefix}-swa-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.swa_location
  sku_tier            = "Free"
  sku_size            = "Free"
  tags                = local.tags

  app_settings = {
    COSMOS_CONNECTION_STRING              = azurerm_cosmosdb_account.main.primary_sql_connection_string
    APPLICATIONINSIGHTS_CONNECTION_STRING = azurerm_application_insights.main.connection_string
  }
}
