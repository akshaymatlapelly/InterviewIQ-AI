export function getAppParams() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Resolve App ID
  const appId = 
    urlParams.get('app_id') || 
    urlParams.get('appId') || 
    localStorage.getItem('iq_app_id') || 
    import.meta.env.VITE_IQ_APP_ID || 
    'dummy-app-id';

  // Resolve Token
  const token = 
    urlParams.get('token') || 
    localStorage.getItem('iq_app_token') || 
    import.meta.env.VITE_IQ_TOKEN || 
    'dummy-token';

  // Resolve App Base URL
  const appBaseUrl = 
    urlParams.get('app_base_url') || 
    localStorage.getItem('iq_app_base_url') || 
    import.meta.env.VITE_IQ_APP_BASE_URL || 
    window.location.origin;

  // Persist if found in URL parameters
  if (urlParams.get('app_id') || urlParams.get('appId')) {
    localStorage.setItem('iq_app_id', appId);
  }
  if (urlParams.get('token')) {
    localStorage.setItem('iq_app_token', token);
  }
  if (urlParams.get('app_base_url')) {
    localStorage.setItem('iq_app_base_url', appBaseUrl);
  }

  return { appId, token, appBaseUrl, functionsVersion: 'v1' };
}
