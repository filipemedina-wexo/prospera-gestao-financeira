# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b6fe41f5-c1cb-484b-a397-55eb9c122ec0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b6fe41f5-c1cb-484b-a397-55eb9c122ec0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Variáveis de ambiente

Crie um arquivo `.env` a partir de `.env.example` contendo as seguintes variáveis:

```sh
VITE_SUPABASE_URL=<sua URL do Supabase>
VITE_SUPABASE_KEY=<sua chave pública do Supabase>
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b6fe41f5-c1cb-484b-a397-55eb9c122ec0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Variáveis de ambiente do Supabase

Crie um arquivo `supabase/.env` (ou copie `supabase/.env.example`) e defina o valor de `BASE_URL` com a URL do frontend utilizada nos links enviados por email.

## Migrações e geração de tipos

Para aplicar o novo esquema de banco de dados, instale o [Supabase CLI](https://supabase.com/docs/guides/cli) e execute as migrações reestruturadas:

```sh
cd supabase
supabase db reset
```

Após a conclusão das migrações, gere novamente os tipos TypeScript utilizados pelo cliente:

```sh
supabase gen types typescript --local > ../src/integrations/supabase/types.ts
```

Em seguida, retorne à raiz do projeto e rode `npm run lint` para validar a sintaxe.

### Autenticação e multi-tenancy

O fluxo de login e o carregamento do cliente ativo continuam inalterados. Nenhuma alteração é necessária no código de autenticação ou multi-tenancy.
