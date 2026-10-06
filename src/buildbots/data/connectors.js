// Connectors gallery. status: 'connected' | 'available' | 'soon'
export const connectors = [
  { id: 'quickbooks', name: 'QuickBooks', group: 'Accounting', status: 'connected' },
  { id: 'xero', name: 'Xero', group: 'Accounting', status: 'available' },
  { id: 'gmail', name: 'Gmail', group: 'Email', status: 'connected' },
  { id: 'outlook', name: 'Outlook', group: 'Email', status: 'available' },
  { id: 'gcal', name: 'Google Calendar', group: 'Calendar', status: 'available' },
  { id: 'google-ads', name: 'Google Ads Manager', group: 'Advertising', status: 'available' },
  { id: 'meta-ads', name: 'Meta Ads Manager', group: 'Advertising', status: 'available' },
  { id: 'companycam', name: 'CompanyCam', group: 'Photos', status: 'connected' },
  { id: 'dropbox', name: 'Dropbox', group: 'Files', status: 'available' },
  { id: 'gdrive', name: 'Google Drive', group: 'Files', status: 'available' },
  { id: 'slack', name: 'Slack', group: 'Chat', status: 'available' },
  { id: 'zapier', name: 'Zapier', group: 'Automation', status: 'soon' },
  { id: 'facebook', name: 'Facebook', group: 'Social', status: 'available' },
  { id: 'instagram', name: 'Instagram', group: 'Social', status: 'available' },
  { id: 'gbp', name: 'Google Business Profile', group: 'Social', status: 'available' },
  { id: 'twilio', name: 'Twilio', group: 'SMS', status: 'soon' },
  { id: 'mcp', name: 'MCP server', group: 'Custom', status: 'available', generic: true },
]

export const mcpNote =
  'Prebuilt Buildertrend bots arrive already wired into Buildertrend’s MCP and APIs. No setup.'
