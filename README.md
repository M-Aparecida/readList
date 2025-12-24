# ReadList 📚

**ReadList** é uma plataforma literária interativa onde os usuários podem partilhar as suas opiniões sobre livros, interagir através de comentários e "gostos", seguir perfis e trocar mensagens privadas. O sistema integra-se com a API do Google Books para facilitar a pesquisa e o registo de obras.

## Funcionalidades

- **Autenticação Segura**: Registo e Login utilizando JWT (JSON Web Tokens).
- **Feed Literário**: Visualize as resenhas mais recentes ou filtre pelas resenhas de livros e autores específicos.
- **Gestão de Resenhas**:
  - Integração com Google Books API para busca automática de capas e autores.
  - Criação, Edição e Exclusão de resenhas.
  - Validação de limite de palavras e classificação (1 a 5 estrelas).
- **Interação na Comunidade**:
  - Sistema de curtidas em resenhas e comentários.
  - Comentários e respostas aninhadas.
  - Janela modal para visualizar quem gostou de uma publicação.
- **Perfil de Utilizador**:
  - Edição de perfil (Biografia, Hobbies, Avatar).
  - Visualização de perfis públicos (protegendo dados sensíveis como o email).
- **Comunicação**:
  - Mensagens privadas entre utilizadores.
  - Notificações de interações (curtidas, comentários, mensagens).
- **Qualidade de Código**:
  - Monitorização via SonarCloud (Cobertura de testes e Security Hotspots).
  - Pipeline de CI/CD configurado no GitLab.

## Tecnologias Utilizadas

### Backend
- **Linguagem**: Python 3.x
- **Framework**: Django & Django REST Framework (DRF)
- **Autenticação**: SimpleJWT
- **Testes**: Pytest & Django Test Client
- **Base de Dados**: SQLite

### Frontend
- **Framework**: React.js (Vite)
- **Estilos**: Tailwind CSS
- **Ícones**: Lucide React
- **Requisições HTTP**: Axios
- **Roteamento**: React Router Dom

## Instalação e Execução

Pré-requisitos: Python e Node.js instalados.

### 1. Configurar o Backend

```bash
# Entrar na pasta do backend
cd backend

# Criar um ambiente virtual (Opcional, mas recomendado)
python -m venv .venv
# Ativar o ambiente:
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate

# Instalar as dependências
pip install -r requirements.txt

# Realizar as migrações da base de dados
python manage.py migrate

# Iniciar o servidor
python manage.py runserver
```

### 2. Configurar o Frontend

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar as dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

### 3. Testes e Qualidade

O projeto possui uma suite de testes automatizados no backend a cobrir Models, Views, Serializers e Permissões.

```bash
# Para correr os testes e verificar a cobertura:
cd backend
coverage run -m pytest
coverage report
# Para gerar o XML para o Sonar:
coverage xml
```

## Desenvolvedora

<table align="center">
  <tr>    
    <td align="center">
      <a href="https://github.com/M-Aparecida">
        <img src="https://avatars.githubusercontent.com/u/143430124?v=4" width="120px;" alt="Foto de Maria Aparecida"/><br>
        Maria Aparecida
      </a>
    </td>
  </tr>
</table>