output "site_url" {
  description = "Your live website."
  value       = "https://${azurerm_static_web_app.main.default_host_name}"
}

output "resource_group" {
  value = azurerm_resource_group.main.name
}

output "swa_deployment_token" {
  description = "Put this in GitHub secret AZURE_STATIC_WEB_APPS_API_TOKEN. Read it with: terraform output -raw swa_deployment_token"
  value       = azurerm_static_web_app.main.api_key
  sensitive   = true
}

output "cosmos_connection_string" {
  description = "Used by scripts/seed_demo.py. Read it with: terraform output -raw cosmos_connection_string"
  value       = azurerm_cosmosdb_account.main.primary_sql_connection_string
  sensitive   = true
}
