FROM node:12.16.2-alpine3.11 as builder
COPY package.json /project/
COPY yarn.lock /project/
WORKDIR /project
RUN yarn install
COPY . /project/
RUN yarn run compile
# compile binary
RUN yarn run nexe dist/entrypoint.js -t alpine-x64-12.9.1 -o /che-triage

FROM alpine:3.11.6
COPY --from=builder /che-triage /che-triage
ENTRYPOINT [ "/che-triage" ]