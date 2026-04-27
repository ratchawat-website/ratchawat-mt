# Checklist sécurité pré-lancement — Ratchawat Muay Thai

> **Stack** : Next.js 14 + Supabase + Stripe + Resend + Vercel
> **Contexte** : site avec booking + paiement (acompte 30% Stripe Checkout)
> **À faire** : passer cette checklist intégralement avant la mise en LIVE Stripe

## 📊 Comment lire cette checklist

| Priorité | Signification |
|---|---|
| **P0** 🚨 | Critique — NE LANCE PAS si non validé |
| **P1** ⚠️ | Important — à fixer avant launch |
| **P2** 💡 | Optimisation — peut attendre 1-2 semaines post-launch |

**Méthode recommandée** : passe les P0 d'abord, dans l'ordre. Tant qu'un P0 n'est pas validé, tu ne touches pas aux P1.

---

# 🚨 P0 — Critique

## P0.1 — Aucun secret dans le code ni dans Git

**Quoi vérifier** : qu'aucune clé API, mot de passe, ou secret n'a jamais été poussé sur GitHub.

**Comment vérifier (3 commandes)** :

```bash
# 1. Cherche dans tout l'historique Git
git log --all --full-history -p | grep -iE "(sk_live|sk_test|whsec_|service_role|api[_-]?key|password|secret)" | head -20

# 2. Vérifie le contenu actuel
grep -rE "(sk_live|sk_test|whsec_|service_role)" --exclude-dir=node_modules --exclude-dir=.next --exclude=".env*"

# 3. Vérifie ce qui est ignoré
cat .gitignore | grep -E "(\.env|credentials)"
```

**✅ Bon** : les 3 commandes retournent vide ou seulement les fichiers `.env.example` (sans valeurs).

**❌ Mauvais** : tu vois des vraies clés dans l'historique.

**Action si KO** :
- Si une clé est dans l'historique : **rotate la clé immédiatement** (régénère sur Supabase/Stripe/etc.) et purge l'historique avec `git filter-repo` ou en cas extrême repart d'un nouveau repo.
- ⚠️ Ne te dis JAMAIS "personne ne va voir l'historique d'un repo privé" — tu peux rendre le repo public par erreur, ou être hacké.

---

## P0.2 — Supabase RLS activée sur 100% des tables

**Quoi vérifier** : chaque table a Row Level Security activée ET au moins une politique restrictive.

**Comment vérifier** :

Va dans Supabase Dashboard → Database → Tables. Pour CHAQUE table, vérifie l'icône RLS (cadenas) :
- 🔓 cadenas ouvert = RLS désactivée → **PROBLÈME CRITIQUE**
- 🔒 cadenas fermé = RLS activée → bien

OU via SQL :
```sql
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**✅ Bon** : `rowsecurity = true` sur toutes les tables (`bookings`, `services`, `customers`, etc.)

**❌ Mauvais** : ne serait-ce qu'UNE table avec `rowsecurity = false`.

**Action si KO** :
```sql
ALTER TABLE [nom_table] ENABLE ROW LEVEL SECURITY;
```

⚠️ Activer RLS sans policy = personne ne peut accéder. Vérifie le P0.3 juste après.

---

## P0.3 — Politiques RLS correctes (pas juste activées)

**Quoi vérifier** : que les policies font sens fonctionnellement. RLS activée + policy `USING (true)` = comme RLS désactivée.

**Comment vérifier** : pour chaque table, va dans Authentication → Policies. Liste les policies et pose-toi la question :

| Table | Qui peut SELECT ? | Qui peut INSERT ? | Qui peut UPDATE / DELETE ? |
|---|---|---|---|
| `bookings` | Personne avec anon key (PII) | Anon (création de booking publique) | Personne avec anon key |
| `services` | Tout le monde (catalogue public) | Personne (admin only) | Personne (admin only) |
| `customers` | Personne avec anon key | Anon (création) | Personne |

**Test concret** :

Ouvre ton site en **incognito**. Ouvre la console DevTools. Tape :
```js
const { data, error } = await window.supabase
  .from('bookings')
  .select('*');
console.log(data, error);
```

**✅ Bon** : `error` retournée OU `data: []` (vide). L'utilisateur anon ne doit JAMAIS voir les bookings d'autres personnes.

**❌ Mauvais** : tu vois la liste des bookings → fuite de données.

**Action si KO** : fixe la policy SELECT immédiatement.
```sql
-- Exemple : bookings non lisibles par anon
DROP POLICY IF EXISTS "anon can read bookings" ON bookings;
-- Si auth admin : autoriser uniquement les admins
CREATE POLICY "admins can read all bookings" 
  ON bookings 
  FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## P0.4 — `SUPABASE_SERVICE_ROLE_KEY` jamais exposée au client

**Quoi vérifier** : la clé service_role bypass toutes les RLS. Elle ne doit JAMAIS être dans du code client (préfixe `NEXT_PUBLIC_`) ni dans un Server Component qui leak vers le client.

**Comment vérifier** :

```bash
# 1. Cherche dans le code client
grep -rE "SUPABASE_SERVICE_ROLE_KEY" src/ --include="*.tsx" --include="*.jsx" 

# 2. Vérifie qu'elle n'est utilisée que dans les routes API et Server Actions
grep -rl "SUPABASE_SERVICE_ROLE_KEY" src/
```

**✅ Bon** : la clé n'apparaît QUE dans `src/app/api/`, `src/lib/supabase/server.ts`, ou les Server Actions (`'use server'`).

**❌ Mauvais** : la clé apparaît dans un Client Component, un fichier sans `'use server'`, ou avec préfixe `NEXT_PUBLIC_`.

**Action si KO** : 
- Régénère la clé sur Supabase (Settings → API → reset)
- Mets à jour Vercel env vars
- Refactore le code pour utiliser cette clé UNIQUEMENT côté serveur

---

## P0.5 — Webhook Stripe vérifie la signature

**Quoi vérifier** : ton handler `/api/stripe/webhook` valide la signature avant de traiter l'événement. Sans ça, n'importe qui peut envoyer un faux webhook "payment_intent.succeeded" et confirmer une fausse réservation.

**Comment vérifier** :

Ouvre `src/app/api/stripe/webhook/route.ts` (ou équivalent).

**✅ Bon — pattern correct** :
```typescript
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');
  
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET! // crash si manquant = bien
    );
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }
  
  // Traitement de event...
}
```

**❌ Mauvais — patterns dangereux** :
```typescript
// JAMAIS faire ça
const event = JSON.parse(await req.text()); // pas de vérification
// ou
const event = await req.json(); // pas de vérification
```

**Action si KO** : implémente la vérification immédiatement. Sans ça, un attaquant peut faire valider de fausses réservations gratuitement.

---

## P0.6 — Test webhook Stripe end-to-end (mode TEST)

**Quoi vérifier** : le flow de paiement complet marche, et un webhook avec mauvaise signature est rejeté.

**Comment tester** :

```bash
# 1. Lance ton app en local
npm run dev

# 2. Dans un autre terminal, forward les webhooks Stripe
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Note le whsec_... affiché → met-le dans .env.local

# 3. Encore un autre terminal, déclenche un événement test
stripe trigger payment_intent.succeeded
```

Vérifie dans tes logs que :
- Le webhook est reçu
- La signature est validée
- Le booking est marqué comme `paid` en base
- Un email de confirmation est envoyé

**Test négatif** :
```bash
# Envoie un webhook avec mauvaise signature
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "stripe-signature: t=123,v1=invalid" \
  -d '{"type":"payment_intent.succeeded"}'
```

**✅ Bon** : retourne 400 ou 401 immédiatement.

**❌ Mauvais** : retourne 200 → ton webhook ne vérifie pas la signature.

---

## P0.7 — Idempotency sur le webhook

**Quoi vérifier** : si Stripe envoie le même événement 2 fois (ça arrive en cas de retry), tu ne traites pas la réservation 2 fois.

**Comment vérifier** : ton handler webhook stocke le `event.id` et refuse de retraiter un event_id déjà vu.

**✅ Bon — pattern correct** :
```typescript
// Avant de traiter l'event
const { data: existing } = await supabase
  .from('processed_stripe_events')
  .select('id')
  .eq('event_id', event.id)
  .single();

if (existing) {
  return new Response('Already processed', { status: 200 });
}

// Traiter l'event...

// Marquer comme traité
await supabase
  .from('processed_stripe_events')
  .insert({ event_id: event.id });
```

**❌ Mauvais** : tu traites tous les events sans vérifier l'ID → un retry Stripe = double-confirmation = client mécontent.

---

## P0.8 — Authentification de l'admin dashboard (s'il existe)

**Quoi vérifier** : si Ratchawat a un dashboard pour voir les bookings (admin), il est protégé.

**Comment tester** :

```bash
# Essaye d'accéder à l'admin sans être loggé
curl -I https://ratchawatmuaythai.com/admin
# OU dans ton navigateur en incognito : va sur /admin
```

**✅ Bon** : redirection vers /login ou erreur 401/403.

**❌ Mauvais** : la page admin est accessible directement, ou tu vois des données.

**Vérifications à faire** :
- [ ] Middleware Next.js protège toutes les routes `/admin/*`
- [ ] API routes admin (`/api/admin/*`) vérifient l'auth ET le rôle admin sur chaque appel
- [ ] Pas de "secret" en URL pour bypass (`?admin_token=xxx`)

---

# ⚠️ P1 — Important

## P1.1 — Validation Zod sur toutes les API routes

**Quoi vérifier** : chaque API route POST/PUT/PATCH valide son body avec Zod avant de toucher à la DB.

**Comment vérifier** : lis chaque fichier dans `src/app/api/` et vérifie le pattern :

**✅ Bon** :
```typescript
const BookingSchema = z.object({
  service_id: z.string().uuid(),
  customer_email: z.string().email(),
  customer_phone: z.string().regex(/^\+?[\d\s-]+$/).max(20),
  start_date: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = BookingSchema.safeParse(body);
  
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }
  
  // Utiliser parsed.data...
}
```

**❌ Mauvais** :
```typescript
const body = await req.json();
await supabase.from('bookings').insert(body); // injecte n'importe quoi
```

**Action si KO** : ajoute Zod sur chaque route. Liste les schemas dans `src/lib/validators/`.

---

## P1.2 — Rate limiting sur le formulaire de booking

**Quoi vérifier** : un attaquant ne peut pas créer 1000 bookings en 1 minute pour pourrir ta DB ou faire chauffer ton compte Stripe.

**Comment implémenter** : utilise `@upstash/ratelimit` (gratuit jusqu'à 10k requêtes/jour).

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const bookingLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'), // 3 bookings / minute / IP
});
```

```typescript
// dans la route /api/bookings
const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
const { success } = await bookingLimiter.limit(ip);
if (!success) {
  return Response.json({ error: 'Too many requests' }, { status: 429 });
}
```

**✅ Bon** : 4e tentative en 1 minute → 429 Too Many Requests.

---

## P1.3 — Rate limiting sur le formulaire de contact

Même chose qu'au-dessus mais sur `/api/contact`. **5 messages / 10 minutes / IP** est un bon compromis.

---

## P1.4 — Headers de sécurité

**Quoi vérifier** : les headers HTTP sécurité sont configurés.

**Comment** : édite `next.config.js` :

```javascript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { 
    key: 'Strict-Transport-Security', 
    value: 'max-age=63072000; includeSubDomains; preload' 
  },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

**Test après deploy** : va sur https://securityheaders.com → entre ton URL → vise un score A ou A+.

---

## P1.5 — Configuration DNS email (DKIM, SPF, DMARC)

**Quoi vérifier** : les emails de confirmation de booking arrivent en INBOX, pas en spam.

**Comment vérifier** :

1. Sur Resend → Domains → Vérifie que ton domaine est `verified` et que DKIM est `verified`
2. Test concret : envoie un booking de test avec une vraie adresse Gmail. Vérifie qu'il arrive en inbox.
3. Va sur https://www.mail-tester.com → envoie un email du site → vise score 9-10/10

**Action si KO** : ajoute les enregistrements DNS manquants. Resend les fournit clés en main.

**Bonus DMARC** (recommandé) : ajoute un TXT record `_dmarc.ratchawatmuaythai.com` :
```
v=DMARC1; p=quarantine; rua=mailto:contact@ratchawatmuaythai.com
```

---

## P1.6 — Cookie banner et privacy basique

**Quoi vérifier** : si Ratchawat a des touristes européens (très probable), tu dois respecter le RGPD basiquement.

**À avoir** :
- [ ] Page **Privacy Policy** avec : quelles données tu collectes (email, nom, téléphone), pour quoi (booking + contact), où c'est stocké (Supabase EU ou Singapore), combien de temps tu gardes (X mois), comment supprimer (email à contact@)
- [ ] Page **Terms of Service** (CGV en FR/EN)
- [ ] Si tu utilises Google Analytics → cookie banner avec opt-in (`vanilla-cookieconsent` ou `react-cookie-consent`)
- [ ] Lien vers Privacy Policy dans le footer
- [ ] Sur le formulaire de contact/booking : checkbox "J'accepte la politique de confidentialité"

---

## P1.7 — Audit des dépendances npm

```bash
# Audit des vulnérabilités
npm audit

# Si vulnérabilités critical/high
npm audit fix

# Si fix automatique impossible
npm audit fix --force # ⚠️ peut casser des trucs, teste après

# Vérifie qu'il n'y a plus de critical/high
npm audit --audit-level=high
```

**✅ Bon** : 0 vulnérabilité critical, 0 high.

---

## P1.8 — Tests fonctionnels de sécurité (manuel)

Cas à tester en navigateur incognito, AVANT de passer en LIVE :

**Test 1 — Anon ne peut pas voir les bookings**
- Ouvre la console DevTools sur la homepage
- Tape : `await window.supabase.from('bookings').select('*')`
- Attendu : `data: []` ou erreur

**Test 2 — Booking sans paiement = booking pending**
- Crée un booking via l'UI
- Avant de payer Stripe, ferme la page
- Va voir dans la DB : le booking doit être `pending`, pas `paid`
- Le client ne doit JAMAIS recevoir d'email "réservation confirmée" sans paiement

**Test 3 — Validation des inputs**
- Mets un email invalide (`pas-un-email`) → erreur claire
- Mets un nom de 5000 caractères → tronqué ou erreur
- Mets `<script>alert('xss')</script>` dans un champ texte → affiché en texte, pas exécuté

**Test 4 — Routes admin protégées**
- Va sur `/admin`, `/api/admin/bookings`, `/dashboard` en incognito
- Toutes redirigent vers login ou retournent 401/403

**Test 5 — Pas de leak dans les API publiques**
- Inspecte le payload renvoyé par `/api/services` (catalogue)
- Vérifie qu'il n'y a pas de champs internes (cost_price, internal_notes, etc.)

**Test 6 — HTTPS forcé**
- Va sur `http://ratchawatmuaythai.com` (sans HTTPS)
- Doit rediriger automatiquement vers HTTPS

---

# 💡 P2 — Optimisations post-launch

## P2.1 — Error tracking avec Sentry

```bash
npx @sentry/wizard@latest -i nextjs
```

Configure pour ne pas leak les données sensibles :
- Mask les inputs des forms par défaut
- Filtre les events par env (prod only ou prod+dev)

## P2.2 — Uptime monitoring

UptimeRobot gratuit (50 monitors) :
- Crée un monitor HTTP sur `https://ratchawatmuaythai.com`
- Crée un monitor sur l'endpoint `/api/health` (à créer si inexistant)
- Notifications email + WhatsApp en cas de down

## P2.3 — Backups automatiques Supabase

- Plan Free : Supabase fait des backups quotidiens 7 jours en arrière (vérifier)
- Plan Pro (25$/mois) : backups 14 jours + Point-in-Time Recovery
- Pour Ratchawat avec paiements : envisager Pro après quelques semaines de prod

Ou backup manuel hebdomadaire :
```bash
pg_dump postgresql://... > backups/ratchawat-$(date +%Y%m%d).sql
```

## P2.4 — CSP (Content Security Policy)

Plus avancé. À ajouter dans les headers `next.config.js` :
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' js.stripe.com; ...
```

⚠️ Casse facilement le site si mal configuré. Teste en mode `report-only` d'abord.

## P2.5 — Logs structurés

Vercel logs sont OK pour démarrer. Si volume monte → Axiom ou BetterStack pour logs structurés interrogeables.

---

# 📋 Plan d'attaque recommandé

**Aujourd'hui (2-3h)** :
1. Passe les **P0.1 → P0.8** dans l'ordre
2. Pour CHAQUE P0 : valide ✅ avant de passer au suivant
3. Si un P0 KO → fix avant de continuer

**Demain (2h)** :
4. Passe les P1
5. Test fonctionnels P1.8 en condition réelle

**Après lancement (semaine 1)** :
6. P2.1 (Sentry) + P2.2 (UptimeRobot)

**Après lancement (mois 1)** :
7. P2.3 + P2.4 + P2.5

---

# 🚦 Critère GO / NO-GO pour le launch

```
┌─────────────────────────────────────────────────┐
│  TOUS les P0 validés ? ───── ✅ ──▶ GO LAUNCH   │
│                                                 │
│                       └── ❌ ──▶ NO-GO          │
└─────────────────────────────────────────────────┘
```

P1 incomplets = délai de 1-2 jours, mais pas blocker absolu.
P0 incomplet = stop immédiat, fix avant tout.

---

# 🆘 Si tu trouves une faille en production

**Ordre d'action en cas de fuite/breach** :

1. **STOP** — coupe le site (Vercel : pause project) si fuite active
2. **ROTATE** toutes les clés concernées (Supabase, Stripe, Resend)
3. **AUDIT** ce qui a fuité (logs, requêtes DB)
4. **NOTIFY** le client (Ratchawat) immédiatement, sois transparent
5. **RGPD** : si données EU touchées, **72h pour notifier la CNIL** ou équivalent thaï (PDPA)
6. **FIX** la faille
7. **POSTMORTEM** — qu'est-ce qui a foiré, comment l'éviter ensuite

C'est l'incident qui peut détruire ta réputation. Mieux vaut être transparent et rapide que de cacher.