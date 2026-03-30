/**
 * Cloudflare Worker para Upload no R2 (SkyFlow)
 * 
 * 1. Crie um novo Worker no painel do Cloudflare: "Workers & Pages" -> "Create" -> "Create Worker".
 * 2. Dê um nome (ex: skyflow-storage-uploader).
 * 3. Clique em "Deploy" e depois em "Edit code" (Editar código).
 * 4. Cole este código lá e clique em "Deploy" no canto superior direito.
 * 5. Volte para a página do Worker, vá em "Settings" -> "Variables".
 * 6. Em "R2 Bucket Bindings", adicione um binding:
 *    - Variable name: MY_BUCKET
 *    - R2 bucket: (selecione o bucket R2 que você criou)
 */

export default {
  async fetch(request, env) {
    // Configuração de CORS para permitir que o frontend do SkyFlow envie arquivos
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Em produção, você pode mudar para a URL do seu site, ex: 'https://skyflow.com'
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Responde às requisições de preflight do navegador (CORS)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Aceita apenas POST para upload
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file');
      const key = formData.get('key'); // O caminho do arquivo gerado pelo frontend (storage.ts)

      if (!file || !key) {
        return new Response('Missing file or key', { status: 400, headers: corsHeaders });
      }

      // Salva o arquivo no bucket R2
      await env.MY_BUCKET.put(key, file.stream(), {
        httpMetadata: { contentType: file.type }
      });

      return new Response('Upload successful', { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(e.message, { status: 500, headers: corsHeaders });
    }
  }
};
