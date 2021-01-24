FROM  alpine:3.8
ENV ALPINE_MIRROR "http://dl-cdn.alpinelinux.org/alpine"
RUN echo "${ALPINE_MIRROR}/edge/main" >> /etc/apk/repositories
RUN apk add --no-cache nodejs  npm bash --repository="http://dl-cdn.alpinelinux.org/alpine/edge/community"
WORKDIR /app
COPY . .
RUN npm ci
EXPOSE 3000
CMD npm run start