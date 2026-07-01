import { neon } from '@neondatabase/serverless';
import { verifyRequest, json } from '../lib/auth.js';

export const config = { runtime: 'edge' };

const sql = neon(process.env.DATABASE_URL);

export default async function handler(request) {
  const ok = await verifyRequest(request);
  if (!ok) return json({ error: 'Non autorizzato' }, 401);

  try {
    if (request.method === 'GET') {
      const rows = await sql`
        SELECT id, negozio, sis, agenzia, telefono, mail
        FROM negozi
        ORDER BY sort_order ASC, id ASC
      `;
      return json(rows);
    }

    if (request.method === 'POST') {
      const body = await request.json();

      // Import massivo: sostituisce tutti i record
      if (body && body.replace === true && Array.isArray(body.items)) {
        await sql`DELETE FROM negozi`;
        for (let i = 0; i < body.items.length; i++) {
          const r = body.items[i] || {};
          await sql`
            INSERT INTO negozi (negozio, sis, agenzia, telefono, mail, sort_order)
            VALUES (${r.negozio || ''}, ${r.sis || ''}, ${r.agenzia || ''},
                    ${r.telefono || ''}, ${r.mail || ''}, ${i})
          `;
        }
        const rows = await sql`
          SELECT id, negozio, sis, agenzia, telefono, mail
          FROM negozi ORDER BY sort_order ASC, id ASC
        `;
        return json(rows);
      }

      // Inserimento singolo
      const [row] = await sql`
        INSERT INTO negozi (negozio, sis, agenzia, telefono, mail, sort_order)
        VALUES (${body.negozio || ''}, ${body.sis || ''}, ${body.agenzia || ''},
                ${body.telefono || ''}, ${body.mail || ''},
                COALESCE((SELECT MAX(sort_order) + 1 FROM negozi), 0))
        RETURNING id, negozio, sis, agenzia, telefono, mail
      `;
      return json(row);
    }

    if (request.method === 'PUT') {
      const body = await request.json();
      const id = Number(body.id);
      if (!id) return json({ error: 'id mancante' }, 400);
      const [row] = await sql`
        UPDATE negozi SET
          negozio    = ${body.negozio || ''},
          sis        = ${body.sis || ''},
          agenzia    = ${body.agenzia || ''},
          telefono   = ${body.telefono || ''},
          mail       = ${body.mail || ''},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, negozio, sis, agenzia, telefono, mail
      `;
      if (!row) return json({ error: 'non trovato' }, 404);
      return json(row);
    }

    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const id = Number(url.searchParams.get('id'));
      if (!id) return json({ error: 'id mancante' }, 400);
      await sql`DELETE FROM negozi WHERE id = ${id}`;
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    return json({ error: err.message || 'Errore server' }, 500);
  }
}
