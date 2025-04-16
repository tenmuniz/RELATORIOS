# Sistema de Análise de Produtividade Policial

## Sobre o Projeto
Sistema para análise de relatórios policiais que extrai métricas-chave como pessoas abordadas, veículos fiscalizados, prisões realizadas e outros indicadores de produtividade.

## Deploy no Railway

### Pré-requisitos
- Conta no Railway (https://railway.app/)
- Conta no GitHub (para conectar seu repositório)

### Passo a Passo para Deploy

1. **Faça login no Railway** e acesse o dashboard.

2. **Crie um novo projeto** clicando em "New Project" e selecione "Deploy from GitHub repo".

3. **Conecte seu repositório** GitHub e selecione este projeto.

4. **Configure as variáveis de ambiente** clicando em "Variables" e adicione as seguintes:
   - `OPENAI_API_KEY`: Sua chave de API do OpenAI (obrigatória para análise de texto)
   - `SESSION_SECRET`: Uma string aleatória para segurança de sessões (opcional)
   - Nota: O Railway configura automaticamente a variável `DATABASE_URL` para você.

5. **Configure o banco de dados** clicando em "New" e adicionando um serviço PostgreSQL.

6. O Railway detectará automaticamente o Procfile e iniciará o deploy. Aguarde a conclusão.

7. **Acesse seu aplicativo** clicando no botão "View" ou no domínio gerado pelo Railway.

### Instruções de Manutenção

- Para atualizar o aplicativo, basta fazer commit e push para o repositório conectado.
- Railway fará automaticamente um novo deploy com as mudanças.
- Para verificar logs, acesse a seção "Deployments" no dashboard do Railway.

## Variáveis de Ambiente Necessárias

- `DATABASE_URL`: Configurada automaticamente pelo Railway
- `OPENAI_API_KEY`: Sua chave API do OpenAI para análise de textos
- `SESSION_SECRET`: Chave secreta para cookies/sessões
- `PORT`: Configurada automaticamente pelo Railway

## Tecnologias Utilizadas

- Python Flask
- SQLAlchemy com PostgreSQL
- OpenAI API para análise de texto
- Gunicorn como servidor WSGI