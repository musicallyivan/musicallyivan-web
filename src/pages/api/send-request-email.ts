import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	const resendApiKey = import.meta.env.RESEND_API_KEY;
	const to = import.meta.env.REQUEST_EMAIL_TO;
	const from = import.meta.env.REQUEST_EMAIL_FROM ?? 'Musically Ivan <onboarding@resend.dev>';

	const body = await request.json().catch(() => null);
	if (!body?.message || !body?.email) {
		return Response.json({ error: 'Missing required fields' }, { status: 400 });
	}

	if (!resendApiKey || !to) {
		return Response.json({ ok: true, skipped: true });
	}

	const html = `
		<h1>Nueva peticion de TikTok</h1>
		<p><strong>Nombre:</strong> ${escapeHtml(body.name || 'Sin nombre')}</p>
		<p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
		<p><strong>Mensaje:</strong></p>
		<p>${escapeHtml(body.message).replaceAll('\n', '<br>')}</p>
	`;

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${resendApiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from,
			to,
			subject: 'Nueva peticion de TikTok - Musically Ivan',
			html,
			reply_to: body.email,
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		return Response.json({ error }, { status: 502 });
	}

	return Response.json({ ok: true });
};

const escapeHtml = (value: string) =>
	String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
