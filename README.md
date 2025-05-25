# Thoth quiz - Next.js + MongoDB

## 📌 Introducere

Această aplicație este o platformă web de tip quiz, numele provenind de la zeul egiptean Thoth, dezvoltată folosind Next.js și MongoDB. Scopul acesteia este de a pune la dispozitia utilizatorilor o serie de test de cultura generala, acestia putand sa vada si un clasament global a utilizatorilor.

---

## 🧩 Descriere problemă

Aplicațiile educaționale interactive sunt din ce în ce mai populare. Scopul acestui proiect este de a crea o platformă de tip quiz care să permită:

- înregistrarea și autentificarea utilizatorilor,
- generarea și parcurgerea unui test cu întrebări și variante de răspuns,
- salvarea rezultatelor într-o bază de date,
- afișarea istoricului testelor și a unui clasament.

---

## 🌐 Descriere API

Aplicația comunică cu un API REST creat cu Next.js API routes, conectat la o bază de date MongoDB. API-ul permite:

- Înregistrarea utilizatorilor (`/api/register`)
- Autentificarea utilizatorilor (`/api/login`)
- Delogarea utilizatorilor (`/api/logout`)
- Obținerea întrebărilor (`/api/get-questions`)
- Trimiterea unui test (`/api/submit-quiz`)
- Obținerea istoricului testelor (`/api/history`)
- Accesarea detaliilor unui test (`/api/quiz/[id]`)
- Afișarea clasamentului (`/api/leaderboard`)
- Salvarea initiala a unui test (`/api/quiz-attempt`)

---

## 🔄 Flux de date

1. **Autentificare:**

   - Utilizatorul introduce datele de login.
   - Serverul validează și returnează un cookie JWT securizat.

2. **Inițiere quiz:**

   - La accesarea paginii principale, aplicația cere întrebări de la `/api/get-questions`.

3. **Parcurgere quiz:**

   - La fiecare întrebare, selecția este salvată local.

4. **Trimitere quiz:**

   - După ultima întrebare, aplicația trimite răspunsurile la `/api/submit-quiz`.

5. **Istoric și clasament:**
   - Utilizatorul poate vizualiza rezultatele și clasamentul pe baza răspunsurilor salvate.

---

## 📬 Exemple de Request / Response

### 🔐 POST `/api/login`

Autentifică un utilizator existent.

**Request**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**

```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### 🆕 POST `/api/register`

Creează un cont nou pentru un utilizator.

**Request**

```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "name": "New User"
}
```

**Response**

```json
{
  "success": true,
  "message": "Account created successfully."
}
```

---

### 🚪 POST `/api/logout`

Șterge cookie-ul JWT și deloghează utilizatorul.

**Request**

```http
POST /api/logout
```

**Response**

```json
{
  "success": true,
  "message": "User logged out successfully."
}
```

---

### 📥 GET `/api/get-questions`

Obține întrebările generate pentru un test.

**Response**

```json
{
  "quizId": "66401d8f9a5d2c87e429babc",
  "questions": [
    {
      "question": "Which planet is known as the Red Planet?",
      "answers": ["Earth", "Mars", "Jupiter", "Venus"]
    },
    {
      "question": "Who wrote 'Romeo and Juliet'?",
      "answers": ["Shakespeare", "Tolstoy", "Homer", "Goethe"]
    }
  ]
}
```

---

### 📤 POST `/api/submit-quiz`

Trimite răspunsurile utilizatorului și calculează scorul.

**Request**

```json
{
  "quizId": "66401d8f9a5d2c87e429babc",
  "userAnswers": [1, 0]
}
```

**Response**

```json
{
  "score": 2
}
```

---

### 📜 GET `/api/history`

Returnează istoricul testelor completate de utilizator.

**Response**

```json
[
  {
    "_id": "6640a8a19a5d2c87e429baaf",
    "date": "2025-05-25T10:23:00.000Z",
    "score": 9,
    "questions": [
      { "question": "What is 2 + 2?" },
      { "question": "What is the capital of Germany?" }
    ]
  }
]
```

---

### 🧾 GET `/api/quiz/[id]`

Returnează detalii despre un test salvat (pentru vizualizare completă).

**Response**

```json
{
  "_id": "6640a8a19a5d2c87e429baaf",
  "userId": "6640a7dd9a5d2c87e429baae",
  "date": "2025-05-25T10:23:00.000Z",
  "score": 8,
  "questions": [
    {
      "question": "What is 5 x 5?",
      "answers": ["10", "15", "25", "30"],
      "correctAnswer": 2,
      "userAnswer": 2
    }
  ]
}
```

---

### 🏆 GET `/api/leaderboard`

Returnează clasamentul utilizatorilor în funcție de scorul total.

**Response**

```json
[
  {
    "userId": "6640a7dd9a5d2c87e429baae",
    "name": "Alice",
    "totalScore": 48
  },
  {
    "userId": "6640b1fc9a5d2c87e429bb01",
    "name": "Bob",
    "totalScore": 45
  }
]
```

## 🔐 Autentificare și autorizare

Autentificarea se realizează prin:

- **Email și parolă**, salvate în baza de date MongoDB (hash-uite cu bcrypt).
- După autentificare sau înregistrare, utilizatorului i se setează un **cookie HTTP-only** care conține un token JWT semnat.
- Acest cookie este utilizat pentru a proteja rutele server-side (`getServerSideProps`) folosind HOC-ul `withAuth`.

Exemplu flux:

1. Utilizatorul trimite cererea de login cu email/parolă.
2. Serverul validează credențialele și generează un JWT.
3. JWT-ul este trimis înapoi ca HTTP-only cookie.
4. La fiecare request protejat, JWT-ul este validat pe server.

---

## 📚 Referințe

- [Next.js](https://nextjs.org/) – framework-ul principal utilizat
- [MongoDB](https://www.mongodb.com/) – baza de date NoSQL
- [bcrypt](https://www.npmjs.com/package/bcrypt) – pentru criptarea parolelor
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) – pentru semnarea și validarea tokenurilor
- [React](https://react.dev/) – pentru hook-urile utilizate
