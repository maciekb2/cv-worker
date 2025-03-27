export interface Env {
	FORM_SUBMISSIONS: KVNamespace;
  }
  
  export default {
	async fetch(request: Request, env: Env): Promise<Response> {
	  if (request.method !== 'POST') {
		return new Response('Method Not Allowed', { status: 405 });
	  }
  
	  try {
		const body = await request.json();
  
		const { imie, nazwisko, email, firma } = body;
  
		if (!imie || !nazwisko || !email) {
		  return new Response('Brakuje wymaganych danych.', { status: 400 });
		}
  
		const timestamp = new Date().toISOString();
		const key = `submission:${timestamp}`;
  
		const value = JSON.stringify({ imie, nazwisko, email, firma, timestamp });
  
		await env.FORM_SUBMISSIONS.put(key, value);
  
		return new Response('OK', { status: 200 });
	  } catch (err) {
		return new Response('Błąd przetwarzania danych', { status: 500 });
	  }
	},
  };
  