<h1 align="center">📌 Controle de Atividades (HTML, CSS e JavaScript) + Dashboard</h1>

<p align="center">
  <img src="https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JavaScript-informational" />
  <img src="https://img.shields.io/badge/charts-Chart.js-blue" />
  <img src="https://img.shields.io/badge/storage-localStorage-success" />
</p>

## ✨ Visão geral

Aplicação web **100% cliente** para gerenciar atividades do dia a dia, com:
- **index.html**: cadastro, edição e listagem de atividades, com **filtro por status** e **exportação CSV**.
- **dashboard.html**: painel visual com **KPIs + gráficos responsivos (Chart.js)** e **storytelling** sobre suas atividades, lendo os dados direto do `localStorage`.

Nenhum backend, nenhum framework — apenas **HTML, CSS e JavaScript puros**.

---

## 🧭 Funcionalidades

### Página principal (`index.html`)
- **Campos**: Categoria, Subcategoria (dependente), Atividade, Descrição, Status, Data início, Hora início, Hora fim, Data fim.
- **Subcategorias dinâmicas** por Categoria  
  (ex.: *Atividade Física → Caminhada, Ciclismo, Academia…* / *Leitura → Ficção-Científica, Fantasia…*).
- **Automatizações**:
  - Ao selecionar **“Em andamento”** → preenche **Hora Início** automaticamente (não editável).
  - Ao selecionar **“Concluída”** → preenche **Hora Fim** e **Data Fim** automaticamente (não editáveis).
  - Ao selecionar **“Pulada”** → preenche **Data Fim** automaticamente.
- **Regras de edição**: atividades com **Status “Concluída” ou “Pulada”** não podem mais ser editadas.
- **Cores por status**:
  - Concluída → **Verde**
  - Em andamento → **Amarelo**
  - Pulada → **Vermelho**
- **Persistência**: tudo salvo no **`localStorage`**.
- **Exportar CSV**: um clique e você baixa `atividades.csv`.
- **Filtro por Status**: exibe só o que você quer ver.

### Dashboard (`dashboard.html`)
- **KPIs**: Total, Concluídas, Em andamento, Puladas, Não iniciadas, **Taxa de conclusão**.
- **Gráficos (Chart.js)**:
  - Donut: **Distribuição por Status**
  - Barras: **Atividades por Categoria**
  - Linha: **Concluídas ao longo do tempo**
- **Filtros no topo**: Data inicial, Data final, Status.
- **Storytelling**: narrativa automática (badges + insights) e **tempo médio por atividade concluída** (se Hora Início/Fim existirem).
- **Atualização automática** ao focar a aba (sincroniza com alterações feitas na página principal).

---

## 🗂 Estrutura do projeto

```bash
📦 atividades-app
┣ 📜 index.html        # Gerenciador de atividades (CRUD, filtro, CSV, localStorage)
┣ 📜 dashboard.html    # Dashboard (Chart.js) lendo a mesma chave do localStorage
┗ 📜 README.md
