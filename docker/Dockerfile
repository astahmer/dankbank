# Set the base image.
FROM node:10-alpine

WORKDIR /usr/app

# Only copy necessary files
COPY package*.json ./
COPY ./src ./src

# Expose app & debug
EXPOSE 4000
# EXPOSE 9231