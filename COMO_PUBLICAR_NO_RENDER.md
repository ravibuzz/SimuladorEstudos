# Como publicar no Render

## 1. Envie os arquivos para o GitHub

Substitua os arquivos antigos do repositório pelos arquivos desta pasta e confirme as alterações no GitHub.

Os arquivos principais corrigidos são:

- `package.json`
- `server.ts`
- `vite.config.ts`

## 2. Configure o serviço no Render

O tipo do serviço deve ser **Web Service**.

Use estas configurações:

- **Build Command:** `npm ci --include=dev && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/health`

## 3. Adicione a chave Gemini

No Render, abra **Environment** e crie a variável:

- **Key:** `GEMINI_API_KEY`
- **Value:** cole a sua chave Gemini

Marque a variável como secreta, se essa opção aparecer. Não coloque a chave dentro dos arquivos nem no GitHub.

## 4. Faça o deploy

Salve as configurações e inicie um novo deploy. Se o Render continuar mostrando o erro antigo, use a opção de limpar o cache de build e faça o deploy novamente.

Quando terminar, teste:

- `https://SEU-ENDERECO.onrender.com/api/health`

O resultado esperado é:

```json
{"status":"ok"}
```
