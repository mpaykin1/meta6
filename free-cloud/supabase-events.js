// Optional authenticated persistence. Requires a Supabase user access token.
// Public publishable key is safe to expose; NEVER use service_role here.
export async function saveWorldEvent({projectUrl,publishableKey,accessToken,world,kind,payload={}}){
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(projectUrl))throw Error('Invalid Supabase URL');
  if(!accessToken)throw Error('Sign in before saving');
  if(!['hub','land','underwater'].includes(world)||!['world_visit','world_transition'].includes(kind))throw Error('Invalid event');
  const userResponse=await fetch(projectUrl+'/auth/v1/user',{headers:{apikey:publishableKey,Authorization:'Bearer '+accessToken}});
  if(!userResponse.ok)throw Error('Session expired');
  const user=await userResponse.json();
  const response=await fetch(projectUrl+'/rest/v1/free_cloud_world_events',{method:'POST',headers:{apikey:publishableKey,Authorization:'Bearer '+accessToken,'content-type':'application/json',Prefer:'return=representation'},body:JSON.stringify({user_id:user.id,world,kind,payload})});
  if(!response.ok)throw Error('Save failed: '+response.status);
  return response.json();
}
