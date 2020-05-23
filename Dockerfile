FROM node:10
LABEL Ray Nakib <ramalnkb@gmail.com>
WORKDIR /divvy
COPY package.json /divvy
EXPOSE 3000
RUN npm install
COPY . /divvy
CMD [ "npm", "start" ]
