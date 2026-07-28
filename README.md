# Foi de Parcurs

Aplicație pentru gestiunea flotei auto: mașini, șoferi, foi de parcurs, alimentări,
calcul consum mediu pe perioadă și raport tipăribil pentru ANAF.

Nu necesită login — oricine are link-ul aplicației are acces la date.
(Vezi nota de securitate la final.)

---

## Pasul 1 — Creezi baza de date (Supabase, gratuit)

1. Intră pe https://supabase.com și fă-ți cont gratuit (te poți loga cu GitHub).
2. Apasă **New project**. Alege un nume, o parolă pentru bază de date (nu contează,
   nu o vei folosi direct) și o regiune apropiată (ex. Frankfurt).
3. Așteaptă 1-2 minute până se creează proiectul.
4. În meniul din stânga, mergi la **SQL Editor** → **New query**.
5. Deschide fișierul `supabase-schema.sql` din acest proiect, copiază tot conținutul,
   lipește-l în editor și apasă **Run**. Asta creează toate tabelele.
6. Mergi la **Settings** (roata dințată) → **API**. De acolo copiază:
   - **Project URL**
   - **anon public key**

   O să ai nevoie de ele la Pasul 3.

---

## Pasul 2 — Urci codul pe GitHub

1. Intră pe https://github.com și fă-ți cont, dacă nu ai deja.
2. Apasă **New repository**. Dă-i un nume, ex. `foi-de-parcurs`. Lasă-l **Public**
   sau **Private** (ambele merg cu Vercel). Nu bifa nimic altceva. Apasă **Create repository**.
3. Pe pagina goală a repository-ului, apasă linkul **uploading an existing file**.
4. Trage/încarcă toate fișierele și folderele din acest proiect (păstrează structura
   de foldere exact așa cum e — `app/`, `components/`, `lib/`, `package.json`, etc.)
   **Nu urca fișierul `.env.local.example` cu date reale** — el e doar un model.
5. Apasă **Commit changes**.

> Alternativ, dacă preferi linia de comandă și ai Git instalat:
> ```
> git init
> git add .
> git commit -m "Prima versiune"
> git branch -M main
> git remote add origin https://github.com/NUMELE_TAU/foi-de-parcurs.git
> git push -u origin main
> ```

---

## Pasul 3 — Publici aplicația pe Vercel

1. Intră pe https://vercel.com și fă-ți cont (cel mai simplu: **Continue with GitHub**).
2. Apasă **Add New** → **Project**.
3. Alege repository-ul `foi-de-parcurs` pe care l-ai creat la Pasul 2 și apasă **Import**.
4. Înainte de a apăsa Deploy, deschide secțiunea **Environment Variables** și adaugă:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | (Project URL de la Supabase) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon public key de la Supabase) |

5. Apasă **Deploy**. Așteaptă 1-2 minute.
6. Vei primi un link de tipul `foi-de-parcurs.vercel.app` — acesta e link-ul aplicației
   tale, funcțional, pe care îl poți trimite colegilor/șoferilor.

De fiecare dată când modifici un fișier direct pe GitHub (sau faci `git push`),
Vercel republică automat aplicația în ~1 minut.

---

## Cum se folosește aplicația

- **Mașini** — adaugi fiecare mașină cu consum normat, autorizație DSV, ITV,
  rovinietă, asigurare (cu date de expirare). Panoul principal îți arată ce
  documente expiră în curând.
- **Șoferi** — lista de șoferi care apar apoi în foile de parcurs.
- **Foi de parcurs** — pentru fiecare cursă: mașină, șofer, dată, traseu, km start/stop.
- **Alimentări** — jurnal separat cu fiecare alimentare (litri, cost, stație, km).
- **Consum** — alegi o mașină (sau toate) și o perioadă; calculează automat
  km parcurși, litri alimentați și consumul mediu (l/100km), comparat cu normat.
  Nu afișează nimic până nu selectezi perioada.
- **Tipărire ANAF** — alegi perioada și mașina, generează un raport cu toate
  foile de parcurs, alimentările și totalurile, gata de tipărit (buton Tipărește,
  care folosește printarea din browser).
- **Setări** — numele firmei, CUI, adresă — apar pe antetul raportului tipărit.

---

## Notă de securitate

Aplicația nu are login: oricine are link-ul poate vedea și modifica toate datele
(mașini, șoferi, foi de parcurs). E potrivit dacă link-ul rămâne intern, între tine
și colegi. Dacă la un moment dat vrei să restricționezi accesul (ex. parolă comună
sau conturi individuale), pot să-ți adaug asta ulterior — spune-mi și revenim.

## Testare locală (opțional, dacă vrei să vezi aplicația pe calculator înainte de a o publica)

Ai nevoie de [Node.js](https://nodejs.org) instalat. Apoi, în folderul proiectului:

```
npm install
cp .env.local.example .env.local
```

Editează `.env.local` și pune acolo URL-ul și cheia reale de la Supabase, apoi:

```
npm run dev
```

Aplicația va porni la `http://localhost:3000`.
