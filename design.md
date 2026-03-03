# design.md

## Estrutura Recomendada

- `/backend`: API, serviços, modelos, scripts Python.
- `/frontend`: Componentes React, páginas, assets, estilos.
- `/docs`: Documentação, templates, guias de infraestrutura.
- `/scripts`: Automação, deploy, validação.

## Fluxo de Usuário
1. Onboarding → Dashboard → Chat Tutor → Recursos de Estudo → Acompanhamento de Progresso.
2. Backend responde via FastAPI, integra IA e banco de dados.
3. Frontend exibe dados, interage com usuário e IA.

## Padrões de Arquitetura
- Separação de responsabilidades.
- Modularização e reutilização de componentes.
- Infraestrutura Docker para ambientes isolados.
- Testes e rastreamento de progresso.

## Referências
- Templates Kiro.
- Guia de Infraestrutura.
- PORTS.md.
