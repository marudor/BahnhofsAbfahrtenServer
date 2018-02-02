FROM node:8-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/
RUN yarn
COPY src/ /usr/src/app/src/
COPY .flowconfig /usr/src/app/
COPY .babelrc /usr/src/app/
ENV NODE_ENV=production
RUN yarn build
EXPOSE 9042
CMD [ "yarn", "start" ]
