FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm@latest

COPY . .

ENV CI=true

RUN echo "y" | pnpm install --frozen-lockfile

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
