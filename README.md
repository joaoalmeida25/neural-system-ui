# Neural System UI

> Show your system thinking, processing and communicating in real time.

Neural System UI é uma biblioteca React para visualização 3D de sistemas, componentes, fluxos e execução operacional. Ela permite representar tanto a estrutura de um sistema quanto seu comportamento durante um runtime operacional.

## Sobre o projeto

O projeto explora formas de tornar arquiteturas e processos de software mais fáceis de observar, inspecionar e comunicar por meio de uma representação visual interativa.

Neural System UI nasceu de uma experiência visual inicialmente integrada ao Predator Ubuntu Sense e evoluiu para uma biblioteca independente. Atualmente, possui arquitetura própria, package preparado para distribuição e um showcase web dedicado.

## Showcase

[`apps/web`](./apps/web) é o ambiente de demonstração e playground da biblioteca. Ele reúne os exemplos `Minimal`, `Inspection` e `Operational`, usados para exercitar diferentes níveis de configuração, interação e execução operacional.

O showcase está em evolução e ainda não possui uma URL pública.

## Estrutura

```text
neural-system-ui/
├── apps/
│   └── web/
├── packages/
│   └── neural-system-ui/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

`apps/web` contém o showcase e playground. `packages/neural-system-ui` contém a biblioteca distribuível.

## Arquitetura

A implementação da biblioteca está organizada nas seguintes áreas de alto nível:

```text
src/
├── api/
├── application/
├── domain/
├── visualization/
└── adapters/
    ├── react/
    └── three/
```

- **API:** define a superfície pública da biblioteca.
- **Application:** coordena os fluxos e a orquestração da aplicação.
- **Domain:** concentra regras e modelos centrais.
- **Visualization:** transforma dados e estados em representações visuais independentes de framework.
- **React Adapter:** integra e compõe a biblioteca no ciclo de vida do React.
- **Three Adapter:** realiza o rendering 3D.

A organização física segue camadas com princípios de dependência inspirados em Clean Architecture e Hexagonal Architecture.

## Princípios

- Baixo acoplamento e alta coesão.
- Organização interna por capability.
- API pública pequena em relação aos módulos internos.
- React e Three.js tratados como adapters.
- Domain e Application independentes de frameworks quando aplicável.
- Runtime operacional opcional.
- Peer dependencies de rendering externalizadas do bundle da biblioteca.

## Tecnologias

- React
- TypeScript
- Three.js
- React Three Fiber
- Drei
- Vite
- pnpm
- Turborepo

## Desenvolvimento local

Execute os comandos a partir da raiz do repositório:

| Comando | Finalidade |
| --- | --- |
| `pnpm install` | Instala as dependências do workspace. |
| `pnpm dev` | Inicia o showcase web em modo de desenvolvimento. |
| `pnpm --filter neural-system-ui build` | Gera o build da biblioteca. |
| `pnpm typecheck` | Executa o typecheck dos projetos do workspace. |
| `pnpm build` | Executa o build do workspace com Turborepo. |

## Biblioteca

O package está em [`packages/neural-system-ui`](./packages/neural-system-ui). Este README raiz apresenta o projeto no GitHub; a documentação própria do package permanece em inglês e é voltada ao futuro consumo via npm.

[Documentação do package](./packages/neural-system-ui/README.md)

## Licença

Neural System UI é um projeto source-available. O uso pessoal e não comercial é permitido conforme a [PolyForm Noncommercial License 1.0.0](./packages/neural-system-ui/LICENSE). O uso comercial exige uma [licença comercial separada](./packages/neural-system-ui/COMMERCIAL.md).

## Status

- Biblioteca em desenvolvimento e preparação para sua primeira versão pública.
- Arquitetura e packaging estruturados.
- Showcase web em evolução.
- Publicação no npm ainda não realizada.