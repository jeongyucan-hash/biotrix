import {headers} from 'next/headers';
import {resolveGatewayCredentials} from './gateway-auth-options.mjs';

// Server-only request-scoped credentials. Never pass this object to client props.
export async function gatewayCredentials() {
  const incoming=await headers();
  return resolveGatewayCredentials(process.env,incoming);
}
