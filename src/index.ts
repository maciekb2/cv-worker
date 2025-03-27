export interface Env {
	FORM_SUBMISSIONS: KVNamespace;
  }
  
  const corsHeaders = {
	'Access-Control-Allow-Origin': '*', // możesz podać konkretną domenę zamiast *
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  export default {
	async fetch(request: Request, env: Env): Promise<Response> {
	  if (request.method === 'OPTIONS') {
		return new Response(null, {
		  status: 204,
		  headers: corsHeaders,
		});
	  }
  
	  if (request.method !== 'POST') {
		return new Response('Method Not Allowed', {
		  status: 405,
		  headers: corsHeaders,
		});
	  }
  
	  try {
		interface FormData {
			imie: string;
			nazwisko: string;
			email: string;
			firma?: string;
		}

		const body: FormData = await request.json();
		const { imie, nazwisko, email, firma } = body;
  
		if (!imie || !nazwisko || !email) {
		  return new Response('Brakuje wymaganych danych.', {
			status: 400,
			headers: corsHeaders,
		  });
		}
  
		const timestamp = new Date().toISOString();
		const key = `submission:${timestamp}`;
		const value = JSON.stringify({ imie, nazwisko, email, firma, timestamp });
  
		await env.FORM_SUBMISSIONS.put(key, value);
  
		return new Response('OK', {
		  status: 200,
		  headers: corsHeaders,
		});
	  } catch (err) {
		return new Response('Błąd przetwarzania danych', {
		  status: 500,
		  headers: corsHeaders,
		});
	  }
	},
  };
  