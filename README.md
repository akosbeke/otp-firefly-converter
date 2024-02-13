# Custom converter for OTP and Revolut

This is just a small utility app to watch and convert OTP xlsx and Revolut csv files into a format that can be used to import data into Firefly III.

## Portainer recipe

```
---
version: "3"
services:
  app:
    build: .
    volumes:
      - ./history:/usr/src/app/history
      - ./watch:/usr/src/app/watch
```
