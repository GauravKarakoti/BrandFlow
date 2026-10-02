/// <reference types="@cloudflare/workers-types" />

export interface Env {
  B2_APPLICATION_KEY_ID: string;
  B2_APPLICATION_KEY: string;
  B2_REGION: string;
  B2_ENDPOINT: string;   // e.g., s3.us-west-004.backblazeb2.com
  BUCKET_NAME: string;   // e.g., BrandFlowAssets
  ALLOWED_ORIGIN: string; // e.g., https://app.brandflow.com or *
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
    };

    // 1. Handle CORS Preflight (OPTIONS request)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const key = url.pathname.slice(1);
    const cache = (caches as unknown as { default: Cache }).default;
    let response = await cache.match(request);

    if (!response) {
      // 2. Fetch from Backblaze B2 via AWS V4 Signature
      const awsPath = `/${env.BUCKET_NAME}/${key}`;
      const signedRequest = await signAwsV4(
        `https://${env.B2_ENDPOINT}${awsPath}`,
        {
          method: 'GET',
          accessKeyId: env.B2_APPLICATION_KEY_ID,
          secretAccessKey: env.B2_APPLICATION_KEY,
          region: env.B2_REGION,
        }
      );

      const b2Response = await fetch(signedRequest);

      // 3. Create a new response to modify headers (Response objects are immutable)
      response = new Response(b2Response.body, b2Response);
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
      
      // Only cache if successful
      if (b2Response.status === 200) {
        response.headers.set('Cache-Control', 'public, max-age=604800');
        // Use ctx.waitUntil to handle caching asynchronously without blocking the response
        ctx.waitUntil(cache.put(request, response.clone()));
      }
    } else {
      // Ensure cached responses also get fresh CORS headers
      response = new Response(response.body, response);
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    }

    return response;
  },
};

// --- AWS V4 Signing Utilities ---

async function signAwsV4(
  urlStr: string,
  { method, accessKeyId, secretAccessKey, region }: { method: string; accessKeyId: string; secretAccessKey: string; region: string }
): Promise<Request> {
  const url = new URL(urlStr);
  const service = 's3';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  // Canonical Request
  const canonicalUri = url.pathname;
  const canonicalQuerystring = '';
  const payloadHash = 'UNSIGNED-PAYLOAD'; 
  const canonicalHeaders = `host:${url.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // String to Sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;

  // Signing Key
  const kDate = await hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');

  // Signature
  const signature = await hex(await hmacSha256(kSigning, stringToSign));

  // Final Headers
  const headers = new Headers();
  headers.set('x-amz-date', amzDate);
  headers.set('x-amz-content-sha256', payloadHash);
  headers.set('Authorization', `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`);

  return new Request(url, { method, headers });
}

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return hex(buf);
}

async function hmacSha256(key: string | ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    typeof key === 'string' ? new TextEncoder().encode(key) : key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
}