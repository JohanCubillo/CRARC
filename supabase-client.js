/* Clave pública: los permisos se definen en supabase/schema.sql. */
window.CRARC_DB = {
  url: 'https://jiigafsjrrcndmjfassc.supabase.co',
  key: 'sb_publishable_1uIYUJ50BZpZyhNLwXrlRA_sVvbDfH6',
  async request(table, options = {}) {
    const response = await fetch(`${this.url}/rest/v1/${table}`, {
      ...options,
      headers: {
        apikey: this.key,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
        ...options.headers
      }
    });
    if (!response.ok) throw new Error(`Supabase: ${response.status}`);
    return response.status === 204 || response.headers.get('content-length') === '0'
      ? null : response.json();
  },
  saveContact(data) {
    return this.request('contactos', { method: 'POST', body: JSON.stringify(data) });
  },
  getSponsors() {
    return this.request('padrinos?select=id,nombre,foto,montos,boton,paypal,especie,historia&activo=eq.true&order=orden.asc,id.asc');
  }
};
