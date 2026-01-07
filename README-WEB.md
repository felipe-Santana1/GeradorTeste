# Gerador QRCode PIX

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/qrcode-pix)

Aplicação web para gerar QR Codes PIX válidos.

## 🚀 Demo Online

Acesse: [https://seu-projeto.vercel.app](https://seu-projeto.vercel.app)

## 📦 Tecnologias

- HTML5 / CSS3 / JavaScript Vanilla
- QRCode.js para geração de QR Codes
- Formato EMV para PIX do Banco Central

## 🎯 Recursos

- ✅ Geração de QR Code PIX válido
- ✅ Máscara monetária brasileira (R$)
- ✅ Validação de campos obrigatórios
- ✅ Cópia do código PIX (BRCode)
- ✅ Interface moderna e responsiva
- ✅ Funciona 100% no navegador (sem backend)

## 🔧 Como usar localmente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/qrcode-pix.git
cd qrcode-pix
```

2. Abra o `index.html` no navegador ou use um servidor local:
```bash
# Opção 1: Python
python -m http.server 8000

# Opção 2: Node.js (http-server)
npx http-server

# Opção 3: VSCode - Live Server extension
```

3. Acesse `http://localhost:8000`

## 🌐 Deploy na Vercel

### Método 1: Via GitHub (Recomendado)

1. Crie um repositório no GitHub
2. Faça push do código:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/qrcode-pix.git
git push -u origin main
```

3. Acesse [vercel.com](https://vercel.com)
4. Clique em "New Project"
5. Importe seu repositório do GitHub
6. Clique em "Deploy"

### Método 2: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy em produção
vercel --prod
```

## ⚙️ Configuração

Para usar com sua própria chave PIX, edite o arquivo `script.js`:

```javascript
// Linha 8-10
const CHAVE_PIX = 'sua-chave-aqui';
const NOME_RECEBEDOR = 'Seu Nome Completo';
const CIDADE_RECEBEDOR = 'SUA CIDADE';
```

Tipos de chave aceitos:
- CPF: `12345678900`
- Email: `seu@email.com`
- Telefone: `+5511999999999`
- Chave aleatória: `8ea99593-ee73-432e-a9c3-2a52f0270f22`

## 📱 Versão Desktop (Electron)

Para executar como aplicação desktop:

```bash
npm install
npm start
```

## 📄 Licença

MIT License - Sinta-se livre para usar e modificar.

---

**Desenvolvido por:** Felipe Santana Silva
