# Xadres-poo

## Banco de Talentos e Dashboard de RH

Este repositório agora inclui uma interface web completa (HTML, CSS e JavaScript) para gestão de um banco de talentos com automação de triagem e visualização de métricas em tempo real.

### Funcionalidades principais

- Cadastro de candidatos com informações essenciais (contato, área de interesse, competências, histórico e disponibilidade).
- Upload de currículos em PDF com extração automática de palavras-chave usando **pdf.js**.
- Classificação automática dos talentos com base em experiência, habilidades estratégicas e disponibilidade.
- Filtros dinâmicos para busca por área, senioridade, disponibilidade, competências e score mínimo.
- Dashboard interativo construído com **Chart.js** exibindo indicadores como volume total, disponibilidade imediata e distribuição por área/senioridade.
- Geração de relatório semanal em texto e exportação do banco em CSV.
- Integração simplificada com planilhas (Google Sheets / Excel) via envio de payload para um webhook configurável.
- Persistência local dos cadastros e do tema (claro/escuro) no navegador.

### Como utilizar

1. Abra o arquivo [`web/index.html`](web/index.html) em um navegador moderno.
2. Cadastre candidatos preenchendo o formulário e, opcionalmente, envie um PDF para extração automática.
3. Acompanhe a classificação automática, aplique filtros e visualize os gráficos no dashboard.
4. Utilize os botões de exportação para gerar o relatório semanal, exportar o CSV ou enviar os dados para um webhook de planilha.

> **Dica:** Para integrar com o Google Sheets, crie um Apps Script publicado como Web App que receba requisições `POST` e grave os dados em uma planilha.

---

O conteúdo original do projeto de xadrez permanece disponível nas pastas Java para referência e estudos de programação orientada a objetos.

<a href="https://iconscout.com/3d-illustrations/tabuleiro-de-xadrez" class="text-underline font-size-sm" target="_blank">Tabuleiro de Xadrez</a> por <a href="https://iconscout.com/pt/contributors/aamiansyah/:assets" class="text-underline font-size-sm" target="_blank">Agung Amiansyah</a>